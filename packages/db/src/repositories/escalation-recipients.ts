import { Prisma, prisma } from '../index.js';

/**
 * One resolved recipient ready for the worker to send an alert through.
 * Both `channelId` (where to actually send) and the originating recipient row
 * id are returned so callers can correlate sends back to the policy editor.
 */
export interface ResolvedEscalationRecipient {
  recipientId: string;
  channelId: string;
  channelType: string;
  channelConfig: unknown;
  /** True if this recipient was a user-target whose primary channel resolved. */
  viaUser: boolean;
  userId: string | null;
}

/** A recipient that the worker should skip, and the reason. */
export interface SkippedRecipient {
  recipientId: string;
  reason:
    | 'removed_user'
    | 'channel_inactive'
    | 'channel_disabled'
    | 'channel_missing'
    | 'user_left_team'
    | 'user_missing';
}

export interface RecipientResolution {
  resolved: ResolvedEscalationRecipient[];
  skipped: SkippedRecipient[];
}

/**
 * Lazy-create the user's personal email channel for a team if missing, using
 * their account email. Idempotent: a `findFirst → create` race is acceptable
 * because alert idempotency dedupes per channelId.
 */
async function ensurePersonalEmailChannel(
  userId: string,
  teamId: string,
  email: string
): Promise<{ id: string; type: string; config: unknown; isActive: boolean; disabledAt: Date | null }> {
  const existing = await prisma.alertChannel.findFirst({
    where: { userId, teamId, type: 'email' },
    select: { id: true, type: true, config: true, isActive: true, disabledAt: true },
  });
  if (existing) return existing;

  const created = await prisma.alertChannel.create({
    data: {
      teamId,
      userId,
      type: 'email',
      name: 'My email',
      config: { recipients: [email] } as unknown as Prisma.InputJsonValue,
    },
    select: { id: true, type: true, config: true, isActive: true, disabledAt: true },
  });
  return created;
}

/**
 * Resolve the user's primary alert channel within a team:
 *   1. preference.primaryChannelId, if set and channel still active
 *   2. else lazy-upsert a personal email channel pointing at user.email
 *
 * Returns null if the user no longer belongs to the team (left/removed).
 */
async function resolveUserPrimaryChannel(
  userId: string,
  teamId: string
): Promise<
  | { id: string; type: string; config: unknown }
  | { skipReason: 'user_left_team' | 'user_missing' }
> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { user: { select: { email: true } } },
  });
  if (!member) return { skipReason: 'user_left_team' };
  if (!member.user) return { skipReason: 'user_missing' };

  const pref = await prisma.userNotificationPreference.findUnique({
    where: { userId_teamId: { userId, teamId } },
    select: {
      primaryChannelId: true,
      primaryChannel: {
        select: { id: true, type: true, config: true, isActive: true, disabledAt: true },
      },
    },
  });

  if (
    pref?.primaryChannel &&
    pref.primaryChannel.isActive &&
    pref.primaryChannel.disabledAt === null
  ) {
    return {
      id: pref.primaryChannel.id,
      type: pref.primaryChannel.type,
      config: pref.primaryChannel.config,
    };
  }

  const fallback = await ensurePersonalEmailChannel(userId, teamId, member.user.email);
  if (!fallback.isActive || fallback.disabledAt !== null) {
    return { skipReason: 'user_left_team' }; // best-available signal — channel got disabled
  }
  return { id: fallback.id, type: fallback.type, config: fallback.config };
}

export const escalationRecipientResolver = {
  /**
   * Load the escalation step at the given (policyId, stepIndex) along with all
   * its recipients, and resolve each to a concrete alert channel:
   *   - Direct channel recipients pass through if active and not system-disabled
   *   - User recipients resolve to the user's primary channel (or fall back to
   *     a lazily-created personal email channel)
   *   - Removed-user recipients (userId NULL + removedAt set) are skipped
   *
   * Returns null if the step itself is not found.
   */
  async resolveStep(
    policyId: string,
    stepIndex: number
  ): Promise<RecipientResolution | null> {
    const step = await prisma.escalationStep.findFirst({
      where: { policyId, stepOrder: stepIndex },
      select: {
        id: true,
        recipients: {
          select: {
            id: true,
            channelId: true,
            userId: true,
            removedAt: true,
            channel: {
              select: { id: true, type: true, config: true, isActive: true, disabledAt: true },
            },
          },
        },
      },
    });
    if (!step) return null;

    const resolved: ResolvedEscalationRecipient[] = [];
    const skipped: SkippedRecipient[] = [];

    for (const r of step.recipients) {
      if (r.removedAt) {
        skipped.push({ recipientId: r.id, reason: 'removed_user' });
        continue;
      }

      if (r.channelId) {
        if (!r.channel) {
          skipped.push({ recipientId: r.id, reason: 'channel_missing' });
          continue;
        }
        if (!r.channel.isActive) {
          skipped.push({ recipientId: r.id, reason: 'channel_inactive' });
          continue;
        }
        if (r.channel.disabledAt !== null) {
          skipped.push({ recipientId: r.id, reason: 'channel_disabled' });
          continue;
        }
        resolved.push({
          recipientId: r.id,
          channelId: r.channel.id,
          channelType: r.channel.type,
          channelConfig: r.channel.config,
          viaUser: false,
          userId: null,
        });
        continue;
      }

      if (r.userId) {
        const teamRow = await prisma.escalationStep.findUnique({
          where: { id: step.id },
          select: { policy: { select: { teamId: true } } },
        });
        const teamId = teamRow?.policy.teamId;
        if (!teamId) {
          skipped.push({ recipientId: r.id, reason: 'user_left_team' });
          continue;
        }
        const ch = await resolveUserPrimaryChannel(r.userId, teamId);
        if ('skipReason' in ch) {
          skipped.push({ recipientId: r.id, reason: ch.skipReason });
          continue;
        }
        resolved.push({
          recipientId: r.id,
          channelId: ch.id,
          channelType: ch.type,
          channelConfig: ch.config,
          viaUser: true,
          userId: r.userId,
        });
        continue;
      }

      // Neither channelId nor userId nor removedAt — shouldn't happen given the
      // DB CHECK constraint, but treat defensively.
      skipped.push({ recipientId: r.id, reason: 'channel_missing' });
    }

    return { resolved, skipped };
  },
};

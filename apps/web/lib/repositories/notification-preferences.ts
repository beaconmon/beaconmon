import { prisma, type Prisma } from '@beaconmon/db';

export interface PersonalChannelRow {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface NotificationPreferenceRow {
  primaryChannelId: string | null;
  channels: PersonalChannelRow[];
}

/**
 * Ensures the user has a personal email alert channel within this team that
 * targets their account email, creating it if missing. The first personal
 * channel becomes the user's primary if they have not already set one.
 *
 * This is idempotent: a `findFirst → create` race is acceptable (worst case is
 * a duplicate row, both pointing at the same email — alert idempotency dedupes
 * sends per-channel, so no duplicate user-visible alerts result).
 */
async function ensurePersonalEmailChannel(
  userId: string,
  teamId: string
): Promise<{ id: string; name: string; type: string; isActive: boolean }> {
  const existing = await prisma.alertChannel.findFirst({
    where: { userId, teamId, type: 'email' },
    select: { id: true, name: true, type: true, isActive: true },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    throw new Error(`User ${userId} not found while seeding personal channel`);
  }

  const created = await prisma.alertChannel.create({
    data: {
      teamId,
      userId,
      type: 'email',
      name: 'My email',
      config: { recipients: [user.email] } as unknown as Prisma.InputJsonValue,
    },
    select: { id: true, name: true, type: true, isActive: true },
  });
  return created;
}

export const notificationPreferenceRepository = {
  /**
   * Returns the user's notification preference for the team along with the full
   * list of their personal channels (currently always exactly the one
   * auto-created email channel; reserved for SMS/Slack-DM in a later PR).
   * Auto-seeds the email channel + preference row on first call.
   */
  async getOrSeedForUser(
    userId: string,
    teamId: string
  ): Promise<NotificationPreferenceRow> {
    const channel = await ensurePersonalEmailChannel(userId, teamId);

    const pref = await prisma.userNotificationPreference.findUnique({
      where: { userId_teamId: { userId, teamId } },
      select: { primaryChannelId: true },
    });

    if (!pref) {
      await prisma.userNotificationPreference.create({
        data: { userId, teamId, primaryChannelId: channel.id },
      });
    }

    const channels = await prisma.alertChannel.findMany({
      where: { userId, teamId },
      select: { id: true, name: true, type: true, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      primaryChannelId: pref?.primaryChannelId ?? channel.id,
      channels,
    };
  },

  /**
   * Set the user's primary channel. The channel must be one of their personal
   * channels in this team (or null to clear). Returns true on success, false
   * if the channel does not belong to the user.
   */
  async setPrimaryChannel(
    userId: string,
    teamId: string,
    primaryChannelId: string | null
  ): Promise<boolean> {
    if (primaryChannelId !== null) {
      const owns = await prisma.alertChannel.findFirst({
        where: { id: primaryChannelId, userId, teamId },
        select: { id: true },
      });
      if (!owns) return false;
    }

    await prisma.userNotificationPreference.upsert({
      where: { userId_teamId: { userId, teamId } },
      create: { userId, teamId, primaryChannelId },
      update: { primaryChannelId },
    });
    return true;
  },

  /**
   * Admin/owner-only summary: every member's primary-channel choice plus the
   * channel name, so admins can see at a glance who routes where without being
   * able to mutate it.
   */
  async findTeamSummary(teamId: string): Promise<
    {
      userId: string;
      userName: string;
      userEmail: string;
      role: string;
      primaryChannelId: string | null;
      primaryChannelName: string | null;
    }[]
  > {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      select: {
        userId: true,
        role: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = members.map((m) => m.userId);
    if (userIds.length === 0) return [];

    const prefs = await prisma.userNotificationPreference.findMany({
      where: { teamId, userId: { in: userIds } },
      select: {
        userId: true,
        primaryChannelId: true,
        primaryChannel: { select: { name: true } },
      },
    });
    const byUser = new Map(prefs.map((p) => [p.userId, p]));

    return members.map((m) => {
      const p = byUser.get(m.userId);
      return {
        userId: m.userId,
        userName: m.user.name,
        userEmail: m.user.email,
        role: m.role,
        primaryChannelId: p?.primaryChannelId ?? null,
        primaryChannelName: p?.primaryChannel?.name ?? null,
      };
    });
  },
};

export { ensurePersonalEmailChannel };

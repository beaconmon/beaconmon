import { prisma } from '@beaconmon/db';

export interface EscalationStepInput {
  stepOrder: number;
  delayMinutes: number;
  channelIds: string[];
  userIds: string[];
}

export interface CreateEscalationPolicyInput {
  name: string;
  steps: EscalationStepInput[];
}

export type EscalationRecipientKind = 'channel' | 'user' | 'removed_user';

export interface EscalationStepRecipientRow {
  id: string;
  kind: EscalationRecipientKind;
  channelId: string | null;
  userId: string | null;
  channelName: string | null;
  userName: string | null;
  userEmail: string | null;
}

export interface EscalationPolicyRow {
  id: string;
  teamId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  steps: {
    id: string;
    stepOrder: number;
    delayMinutes: number;
    recipients: EscalationStepRecipientRow[];
  }[];
}

export class EscalationValidationError extends Error {
  constructor(
    message: string,
    public reason:
      | 'unknown_channel'
      | 'unknown_user'
      | 'viewer_not_assignable'
      | 'empty_step'
  ) {
    super(message);
  }
}

interface RawRecipient {
  id: string;
  channelId: string | null;
  userId: string | null;
  removedAt: Date | null;
  channel: { name: string } | null;
  user: { name: string; email: string } | null;
}

function mapRecipient(r: RawRecipient): EscalationStepRecipientRow {
  if (r.channelId && r.channel) {
    return {
      id: r.id,
      kind: 'channel',
      channelId: r.channelId,
      userId: null,
      channelName: r.channel.name,
      userName: null,
      userEmail: null,
    };
  }
  if (r.userId && r.user) {
    return {
      id: r.id,
      kind: 'user',
      channelId: null,
      userId: r.userId,
      channelName: null,
      userName: r.user.name,
      userEmail: r.user.email,
    };
  }
  return {
    id: r.id,
    kind: 'removed_user',
    channelId: null,
    userId: null,
    channelName: null,
    userName: null,
    userEmail: null,
  };
}

const policyInclude = {
  steps: {
    orderBy: { stepOrder: 'asc' as const },
    select: {
      id: true,
      stepOrder: true,
      delayMinutes: true,
      recipients: {
        select: {
          id: true,
          channelId: true,
          userId: true,
          removedAt: true,
          channel: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      },
    },
  },
};

interface RawPolicy {
  id: string;
  teamId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  steps: {
    id: string;
    stepOrder: number;
    delayMinutes: number;
    recipients: RawRecipient[];
  }[];
}

function mapPolicy(p: RawPolicy): EscalationPolicyRow {
  return {
    id: p.id,
    teamId: p.teamId,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    steps: p.steps.map((s) => ({
      id: s.id,
      stepOrder: s.stepOrder,
      delayMinutes: s.delayMinutes,
      recipients: s.recipients.map(mapRecipient),
    })),
  };
}

/**
 * Verifies that every channelId/userId across all steps is a legal recipient
 * for this team:
 *   - channelIds must be team channels (userId IS NULL) belonging to teamId
 *   - userIds must be non-viewer members of teamId
 * Throws EscalationValidationError on any violation.
 */
async function validateRecipients(
  teamId: string,
  steps: EscalationStepInput[]
): Promise<void> {
  for (const s of steps) {
    if (s.channelIds.length === 0 && s.userIds.length === 0) {
      throw new EscalationValidationError(
        `Step ${s.stepOrder + 1} has no recipients`,
        'empty_step'
      );
    }
  }

  const allChannelIds = Array.from(new Set(steps.flatMap((s) => s.channelIds)));
  const allUserIds = Array.from(new Set(steps.flatMap((s) => s.userIds)));

  if (allChannelIds.length > 0) {
    const found = await prisma.alertChannel.findMany({
      where: { id: { in: allChannelIds }, teamId, userId: null },
      select: { id: true },
    });
    const foundSet = new Set(found.map((c) => c.id));
    const missing = allChannelIds.find((id) => !foundSet.has(id));
    if (missing) {
      throw new EscalationValidationError(
        `Channel ${missing} not found for this team`,
        'unknown_channel'
      );
    }
  }

  if (allUserIds.length > 0) {
    const members = await prisma.teamMember.findMany({
      where: { teamId, userId: { in: allUserIds } },
      select: { userId: true, role: true },
    });
    const byUser = new Map(members.map((m) => [m.userId, m.role]));
    for (const userId of allUserIds) {
      const role = byUser.get(userId);
      if (!role) {
        throw new EscalationValidationError(
          `User ${userId} is not a member of this team`,
          'unknown_user'
        );
      }
      if (role === 'viewer') {
        throw new EscalationValidationError(
          `Viewers cannot be assigned to escalation steps`,
          'viewer_not_assignable'
        );
      }
    }
  }
}

function recipientCreates(step: EscalationStepInput) {
  return [
    ...step.channelIds.map((channelId) => ({ channelId })),
    ...step.userIds.map((userId) => ({ userId })),
  ];
}

export const escalationPolicyRepository = {
  async findAll(teamId: string): Promise<EscalationPolicyRow[]> {
    const policies = await prisma.escalationPolicy.findMany({
      where: { teamId },
      include: policyInclude,
      orderBy: { createdAt: 'desc' },
    });
    return (policies as RawPolicy[]).map(mapPolicy);
  },

  async findById(teamId: string, policyId: string): Promise<EscalationPolicyRow | null> {
    const policy = await prisma.escalationPolicy.findFirst({
      where: { id: policyId, teamId },
      include: policyInclude,
    });
    return policy ? mapPolicy(policy as RawPolicy) : null;
  },

  /**
   * Create a policy. If the team has no defaultEscalationPolicyId set, the new
   * policy is promoted to default in the same transaction so monitors without an
   * explicit policy fall back to it. Returns wasSetAsDefault so the caller can
   * surface that to the user.
   */
  async create(
    teamId: string,
    data: CreateEscalationPolicyInput
  ): Promise<{ policy: EscalationPolicyRow; wasSetAsDefault: boolean }> {
    await validateRecipients(teamId, data.steps);

    return prisma.$transaction(async (tx) => {
      const policy = await tx.escalationPolicy.create({
        data: {
          teamId,
          name: data.name,
          steps: {
            create: data.steps.map((s) => ({
              stepOrder: s.stepOrder,
              delayMinutes: s.delayMinutes,
              recipients: { create: recipientCreates(s) },
            })),
          },
        },
        include: policyInclude,
      });

      const team = await tx.team.findUnique({
        where: { id: teamId },
        select: { defaultEscalationPolicyId: true },
      });

      let wasSetAsDefault = false;
      if (team && team.defaultEscalationPolicyId === null) {
        await tx.team.update({
          where: { id: teamId },
          data: { defaultEscalationPolicyId: policy.id },
        });
        wasSetAsDefault = true;
      }

      return { policy: mapPolicy(policy as RawPolicy), wasSetAsDefault };
    });
  },

  /** Replace the policy name and all its steps atomically. */
  async update(
    teamId: string,
    policyId: string,
    data: Partial<CreateEscalationPolicyInput>
  ): Promise<EscalationPolicyRow | null> {
    if (data.steps !== undefined) {
      await validateRecipients(teamId, data.steps);
    }

    const existing = await prisma.escalationPolicy.findFirst({
      where: { id: policyId, teamId },
    });
    if (!existing) return null;

    const policy = await prisma.escalationPolicy.update({
      where: { id: policyId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.steps !== undefined && {
          steps: {
            deleteMany: {},
            create: data.steps.map((s) => ({
              stepOrder: s.stepOrder,
              delayMinutes: s.delayMinutes,
              recipients: { create: recipientCreates(s) },
            })),
          },
        }),
      },
      include: policyInclude,
    });
    return mapPolicy(policy as RawPolicy);
  },

  async delete(teamId: string, policyId: string): Promise<boolean> {
    const result = await prisma.escalationPolicy.deleteMany({
      where: { id: policyId, teamId },
    });
    return result.count > 0;
  },

  /**
   * Called when a user is removed from a team. Marks every recipient row
   * targeting that user (across all of the team's policies) as removed,
   * preserving the row for UI continuity ("Removed user").
   */
  async markUserRemovedFromTeam(teamId: string, userId: string): Promise<number> {
    const result = await prisma.escalationStepRecipient.updateMany({
      where: {
        userId,
        step: { policy: { teamId } },
      },
      data: { userId: null, removedAt: new Date() },
    });
    return result.count;
  },
};

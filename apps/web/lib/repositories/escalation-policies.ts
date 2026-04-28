import { prisma } from '@beaconmon/db';

export interface EscalationStepInput {
  stepOrder: number;
  delayMinutes: number;
  channelId: string;
}

export interface CreateEscalationPolicyInput {
  name: string;
  steps: EscalationStepInput[];
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
    channelId: string;
  }[];
}

export const escalationPolicyRepository = {
  async findAll(teamId: string): Promise<EscalationPolicyRow[]> {
    const policies = await prisma.escalationPolicy.findMany({
      where: { teamId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: { id: true, stepOrder: true, delayMinutes: true, channelId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return policies as EscalationPolicyRow[];
  },

  async findById(teamId: string, policyId: string): Promise<EscalationPolicyRow | null> {
    const policy = await prisma.escalationPolicy.findFirst({
      where: { id: policyId, teamId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: { id: true, stepOrder: true, delayMinutes: true, channelId: true },
        },
      },
    });
    return policy as EscalationPolicyRow | null;
  },

  async create(teamId: string, data: CreateEscalationPolicyInput): Promise<EscalationPolicyRow> {
    const policy = await prisma.escalationPolicy.create({
      data: {
        teamId,
        name: data.name,
        steps: {
          create: data.steps.map((s) => ({
            id: crypto.randomUUID(),
            stepOrder: s.stepOrder,
            delayMinutes: s.delayMinutes,
            channelId: s.channelId,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: { id: true, stepOrder: true, delayMinutes: true, channelId: true },
        },
      },
    });
    return policy as EscalationPolicyRow;
  },

  /** Replace the policy name and all its steps atomically. */
  async update(
    teamId: string,
    policyId: string,
    data: Partial<CreateEscalationPolicyInput>
  ): Promise<EscalationPolicyRow | null> {
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
              id: crypto.randomUUID(),
              stepOrder: s.stepOrder,
              delayMinutes: s.delayMinutes,
              channelId: s.channelId,
            })),
          },
        }),
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: { id: true, stepOrder: true, delayMinutes: true, channelId: true },
        },
      },
    });
    return policy as EscalationPolicyRow;
  },

  async delete(teamId: string, policyId: string): Promise<boolean> {
    const result = await prisma.escalationPolicy.deleteMany({
      where: { id: policyId, teamId },
    });
    return result.count > 0;
  },
};

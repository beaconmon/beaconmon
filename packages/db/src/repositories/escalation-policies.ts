import { prisma } from '../index.js';

export const escalationPoliciesRepository = {
  async findWithSteps(policyId: string) {
    return prisma.escalationPolicy.findUnique({
      where: { id: policyId },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
  },

  async getDefaultPolicyId(teamId: string): Promise<string | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { defaultEscalationPolicyId: true },
    });
    return team?.defaultEscalationPolicyId ?? null;
  },
};

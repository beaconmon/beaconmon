import { prisma } from '@beaconmon/db';

export interface SubscriptionRow {
  teamId: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  paddleCustomerId: string | null;
}

export const subscriptionRepository: {
  findByTeamId(teamId: string): Promise<SubscriptionRow | null>;
} = {
  async findByTeamId(teamId) {
    const row = await prisma.subscription.findUnique({
      where: { teamId },
      select: {
        teamId: true,
        plan: true,
        status: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        paddleCustomerId: true,
      },
    });
    return row as SubscriptionRow | null;
  },
};
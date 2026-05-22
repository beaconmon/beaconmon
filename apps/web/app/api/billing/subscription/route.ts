import { prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';

export const GET = withAuth(async (_req, { teamId }) => {
  const subscription = await subscriptionRepository.findByTeamId(teamId);

  if (!subscription) {
    // Team is on trial — no Freemius subscription row yet. Read trial date from team.
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { trialEndsAt: true },
    });
    return Response.json({
      plan: 'growth',
      status: 'trialing',
      billingPeriod: 'monthly',
      currentPeriodEnd: null,
      trialEndsAt: team?.trialEndsAt?.toISOString() ?? null,
      hasFreemiusCustomer: false,
      freemiusSubscriptionId: null,
    });
  }

  return Response.json({
    plan: subscription.plan,
    status: subscription.status,
    billingPeriod: subscription.billingPeriod,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    hasFreemiusCustomer: Boolean(subscription.freemiusUserId),
    freemiusSubscriptionId: subscription.freemiusSubscriptionId,
  });
});

import { withAuth } from '@/lib/api/with-auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';

export const GET = withAuth(async (_req, { teamId }) => {
  const subscription = await subscriptionRepository.findByTeamId(teamId);

  if (!subscription) {
    return Response.json(null);
  }

  return Response.json({
    plan: subscription.plan,
    status: subscription.status,
    billingPeriod: subscription.billingPeriod,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    hasPaddleCustomer: Boolean(subscription.paddleCustomerId),
    paddleSubscriptionId: subscription.paddleSubscriptionId,
  });
});

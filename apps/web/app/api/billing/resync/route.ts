export const dynamic = 'force-dynamic';

import { withAuth } from '@/lib/api/with-auth';
import { ForbiddenError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import type { UserSubscriptionWithDiscounts } from '@freemius/sdk';
import { getFreemiusSdk, planFromFreemiusPlanId, billingPeriodFromFreemiusCycle } from '@/lib/freemius';

export const POST = withAuth(async (_req, { teamId, role }) => {
  if (role !== 'owner') {
    throw new ForbiddenError('Only team owners can resync billing');
  }

  const subscription = await subscriptionRepository.findByTeamId(teamId);
  if (!subscription?.freemiusUserId) {
    return Response.json({ error: 'No Freemius subscription found' }, { status: 404 });
  }

  const freemius = getFreemiusSdk();
  const subscriptions = await freemius.api.user.retrieveSubscriptions(subscription.freemiusUserId);

  if (subscriptions.length === 0) {
    return Response.json({ error: 'No subscriptions found in Freemius' }, { status: 404 });
  }

  // Prefer an active subscription (no canceled_at); fall back to the most recent.
  const active = subscriptions.find((s: UserSubscriptionWithDiscounts) => !s.canceled_at) ?? subscriptions[0]!;

  let status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
  if (active.canceled_at) {
    status = 'canceled';
  } else if (active.failed_payments && active.failed_payments > 0) {
    status = 'past_due';
  } else {
    status = 'active';
  }

  const result = await subscriptionRepository.updateFromFreemiusEvent(subscription.freemiusUserId, {
    plan: planFromFreemiusPlanId(active.plan_id ? String(active.plan_id) : undefined),
    billingPeriod: billingPeriodFromFreemiusCycle(active.billing_cycle),
    status,
    currentPeriodEnd: active.next_payment ? new Date(active.next_payment) : null,
    freemiusSubscriptionId: active.id ? String(active.id) : subscription.freemiusSubscriptionId ?? '',
  });

  if (!result) {
    return Response.json({ error: 'Failed to update subscription' }, { status: 500 });
  }

  logger.info({ service: 'web', teamId, status }, 'Subscription resynced from Freemius');
  return Response.json({ ok: true });
});

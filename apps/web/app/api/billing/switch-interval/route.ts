import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { logger } from '@/lib/logger';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { paddle, getPriceId } from '@/lib/paddle';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

const bodySchema = z.object({
  period: z.enum(['monthly', 'annual']),
});

export const POST = withAuth(async (req, { teamId }) => {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Invalid request body', parsed.error.issues);

  const { period } = parsed.data;

  const subscription = await subscriptionRepository.findByTeamId(teamId);
  if (!subscription?.paddleSubscriptionId) throw new NotFoundError('No active subscription');

  if (subscription.billingPeriod === period) {
    return Response.json({ billingPeriod: period });
  }

  const { plan } = subscription;
  if (plan !== 'pro' && plan !== 'business') {
    throw new ValidationError(`Cannot switch billing interval for plan: ${plan}`);
  }

  const newPriceId = getPriceId(plan, period);

  logger.info(
    { service: 'web', teamId, paddleSubscriptionId: subscription.paddleSubscriptionId, plan, period },
    'switch-interval requested'
  );

  await paddle.subscriptions.update(subscription.paddleSubscriptionId, {
    items: [{ priceId: newPriceId, quantity: 1 }],
    prorationBillingMode: 'prorated_immediately',
  });

  await subscriptionRepository.updateBillingPeriod(teamId, period);

  logger.info(
    { service: 'web', teamId, paddleSubscriptionId: subscription.paddleSubscriptionId, plan, period },
    'switch-interval completed'
  );

  return Response.json({ billingPeriod: period });
});

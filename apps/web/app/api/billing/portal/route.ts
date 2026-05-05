export const dynamic = 'force-dynamic';

import { withAuth } from '@/lib/api/with-auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { createPortalSession } from '@/lib/paddle';
import { NotFoundError } from '@/lib/api/errors';

export const POST = withAuth(async (_req, { teamId }) => {
  const subscription = await subscriptionRepository.findByTeamId(teamId);

  if (!subscription?.paddleCustomerId) {
    throw new NotFoundError('No active subscription');
  }

  const url = await createPortalSession(subscription.paddleCustomerId);
  return Response.redirect(url, 303);
});

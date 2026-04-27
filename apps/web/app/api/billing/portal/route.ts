export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { createPortalSession } from '@/lib/paddle';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.teamId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await subscriptionRepository.findByTeamId(session.user.teamId);

    if (!subscription?.paddleCustomerId) {
      return Response.json({ error: 'No active subscription' }, { status: 404 });
    }

    const url = await createPortalSession(subscription.paddleCustomerId);
    return Response.redirect(url, 303);
  } catch (err) {
    logger.error({ service: 'web', err, teamId: session.user.teamId }, 'Failed to create billing portal session');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

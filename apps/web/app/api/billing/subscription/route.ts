import { auth } from '@/lib/auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.teamId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await subscriptionRepository.findByTeamId(session.user.teamId);

    if (!subscription) {
      return Response.json(null);
    }

    return Response.json({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    });
  } catch (err) {
    logger.error({ service: 'web', err, teamId: session.user.teamId }, 'Failed to fetch subscription');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

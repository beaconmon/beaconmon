export const dynamic = 'force-dynamic';

import { withAuth } from '@/lib/api/with-auth';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { createPortalSession } from '@/lib/freemius';
import { NotFoundError } from '@/lib/api/errors';
import { prisma } from '@beaconmon/db';

export const POST = withAuth(async (_req, { teamId, userId }) => {
  const subscription = await subscriptionRepository.findByTeamId(teamId);

  if (!subscription?.freemiusUserId) {
    throw new NotFoundError('No active subscription');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const url = await createPortalSession(subscription.freemiusUserId, user?.email ?? undefined);
  return Response.json({ url });
});

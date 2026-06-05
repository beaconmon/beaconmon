import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { prisma } from '@beaconmon/db';
import { NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const competitor = await competitorRepository.findById(teamId, params.id);
  if (!competitor) throw new NotFoundError();

  const productCount = await prisma.competitorProduct.count({
    where: { competitorId: params.id, teamId },
  });

  return Response.json({
    state: competitor.discoveryState,
    productCount,
    lastSyncedAt: competitor.discoverySyncedAt,
    error: competitor.discoveryError,
  });
});

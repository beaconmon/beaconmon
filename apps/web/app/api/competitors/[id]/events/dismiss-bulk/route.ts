import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@beaconmon/db';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const POST = withAuth<Params>(async (_req, { teamId, userId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const competitor = await prisma.competitor.findFirst({
    where: { id: params.id, teamId, deletedAt: null },
    select: { id: true },
  });
  if (!competitor) throw new NotFoundError();

  const undecided = await prisma.competitorEvent.findMany({
    where: { teamId, competitorId: params.id, decision: { is: null } },
    select: { id: true },
  });

  if (undecided.length === 0) {
    return Response.json({ count: 0 });
  }

  await prisma.competitorDecision.createMany({
    data: undecided.map((e) => ({
      teamId,
      eventId: e.id,
      response: 'ignore',
      decidedBy: userId,
      note: null,
    })),
    skipDuplicates: true,
  });

  return Response.json({ count: undecided.length });
});

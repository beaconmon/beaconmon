import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@beaconmon/db';
import { NotFoundError } from '@/lib/api/errors';

type Params = { id: string; productId: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const product = await prisma.competitorProduct.findFirst({
    where: { id: params.productId, competitorId: params.id, teamId },
    select: { id: true },
  });
  if (!product) throw new NotFoundError();

  const events = await prisma.competitorEvent.findMany({
    where: { competitorId: params.id, productId: params.productId, teamId, type: 'price_changed' },
    select: { payload: true, detectedAt: true },
    orderBy: { detectedAt: 'asc' },
    take: 90,
  });

  const points = events.map((e) => ({
    price: ((e.payload as Record<string, unknown>).newPrice as string) ?? '0',
    detectedAt: e.detectedAt,
  }));

  return Response.json(points);
});

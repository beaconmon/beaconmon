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
    where: {
      competitorId: params.id,
      productId: params.productId,
      teamId,
      type: { in: ['product_added', 'price_changed'] },
    },
    select: { payload: true, detectedAt: true, type: true },
    orderBy: { detectedAt: 'asc' },
    take: 90,
  });

  const points = events.map((e) => {
    const p = e.payload as Record<string, unknown>;
    const price = e.type === 'product_added'
      ? (p.price as string) ?? '0'
      : (p.newPrice as string) ?? '0';
    return { price, detectedAt: e.detectedAt };
  });

  return Response.json(points);
});

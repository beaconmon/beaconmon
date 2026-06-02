import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const products = await competitorRepository.findProducts(teamId, params.id);
  return Response.json(products);
});

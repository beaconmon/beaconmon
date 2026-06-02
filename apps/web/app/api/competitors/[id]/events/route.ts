import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (req, { teamId }, params) => {
  const url = new URL(req.url);
  const rawLimit = url.searchParams.get('limit');
  const before = url.searchParams.get('before') ?? undefined;

  const limit = rawLimit ? parseInt(rawLimit, 10) : 50;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('limit must be between 1 and 100');
  }

  if (before !== undefined) {
    const pipeIdx = before.indexOf('|');
    const datePart = pipeIdx !== -1 ? before.slice(0, pipeIdx) : before;
    if (isNaN(new Date(datePart).getTime())) {
      throw new ValidationError('before must be a valid cursor');
    }
  }

  const result = await competitorRepository.findEvents(teamId, params.id, { limit, before });
  return Response.json(result);
});

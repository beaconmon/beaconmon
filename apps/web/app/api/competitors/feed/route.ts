import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ValidationError } from '@/lib/api/errors';

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  before: z.string().datetime().optional(),
});

export const GET = withAuth(async (req, { teamId }) => {
  const url = new URL(req.url);
  const parsed = feedQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ValidationError('Invalid query parameters', parsed.error.issues);

  const { limit, before } = parsed.data;

  const [rawItems, activeCount] = await Promise.all([
    competitorRepository.findFeed(teamId, {
      limit: limit + 1,
      before: before ? new Date(before) : undefined,
    }),
    competitorRepository.countActive(teamId),
  ]);

  const hasMore = rawItems.length > limit;
  const items = rawItems.slice(0, limit);

  return Response.json({ items, hasMore, activeCount });
});

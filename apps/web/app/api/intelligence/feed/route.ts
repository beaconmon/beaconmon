import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { intelligenceRepository } from '@/lib/repositories/intelligence';
import { ValidationError } from '@/lib/api/errors';

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  before: z.string().datetime().optional(),
  monitorId: z.string().optional(),
  type: z.string().optional(),
  range: z.enum(['7d', '30d', '90d']).default('30d'),
});

export const GET = withAuth(async (req, { teamId, plan }) => {
  const url = new URL(req.url);
  const parsed = feedQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) throw new ValidationError('Invalid query parameters', parsed.error.issues);

  const { limit, before, monitorId, type, range } = parsed.data;
  const types = type ? type.split(',').map((t) => t.trim()).filter(Boolean) : undefined;

  const result = await intelligenceRepository.findFeed(teamId, plan, {
    limit,
    before: before ? new Date(before) : undefined,
    monitorId,
    types,
    range,
  });

  return Response.json(result);
});

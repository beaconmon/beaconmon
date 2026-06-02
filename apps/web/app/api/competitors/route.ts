import { z } from 'zod';
import { PLAN_LIMITS } from '@beaconmon/types';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';

export const GET = withAuth(async (_req, { teamId }) => {
  const competitors = await competitorRepository.findAll(teamId);
  return Response.json(competitors);
});

const createCompetitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  platform: z.enum(['shopify', 'woocommerce', 'other']).default('other'),
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  if (limit !== -1) {
    const count = await competitorRepository.countActive(teamId);
    if (count >= limit) {
      throw new PlanLimitError(`Your plan allows a maximum of ${limit} competitors`);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createCompetitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const competitor = await competitorRepository.create(teamId, parsed.data);
  return Response.json(competitor, { status: 201 });
});

import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const competitor = await competitorRepository.findById(teamId, params.id);
  if (!competitor) throw new NotFoundError();
  return Response.json(competitor);
});

const updateCompetitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  platform: z.enum(['shopify', 'woocommerce', 'other']).optional(),
});

export const PATCH = withAuth<Params>(async (req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateCompetitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const competitor = await competitorRepository.update(teamId, params.id, parsed.data);
  if (!competitor) throw new NotFoundError();
  return Response.json(competitor);
});

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const deleted = await competitorRepository.softDelete(teamId, params.id);
  if (!deleted) throw new NotFoundError();

  return new Response(null, { status: 204 });
});

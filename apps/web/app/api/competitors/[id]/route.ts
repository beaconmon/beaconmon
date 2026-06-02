import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const { id } = params as { id: string };
  const deleted = await competitorRepository.deleteById(teamId, id);
  if (!deleted) throw new NotFoundError();

  return new Response(null, { status: 204 });
});

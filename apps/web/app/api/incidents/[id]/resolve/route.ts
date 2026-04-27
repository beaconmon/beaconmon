import { withAuth } from '@/lib/api/with-auth';
import { incidentRepository } from '@/lib/repositories/incidents';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const PATCH = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const result = await incidentRepository.resolve(teamId, params.id);
  if (result.count === 0) throw new NotFoundError('Not found or already resolved');

  logger.info({ service: 'web', teamId, incidentId: params.id }, 'Incident manually resolved');
  return Response.json({ resolved: true });
});

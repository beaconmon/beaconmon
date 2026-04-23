import { withAuth } from '@/lib/api/with-auth';
import { incidentRepository } from '@/lib/repositories/incidents';
import { ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

type Params = { id: string; [key: string]: string };

export const PATCH = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const result = await incidentRepository.resolve(teamId, params.id);
  if (result.count === 0) {
    return Response.json(
      { error: 'Not found or already resolved', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }

  logger.info({ service: 'web', teamId, incidentId: params.id }, 'Incident manually resolved');
  return Response.json({ resolved: true });
});

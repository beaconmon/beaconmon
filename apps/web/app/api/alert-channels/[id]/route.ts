import { withAuth } from '@/lib/api/with-auth';
import { alertChannelRepository } from '@/lib/repositories/alert-channels';
import { ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

type Params = { id: string; [key: string]: string };

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const count = await alertChannelRepository.softDelete(teamId, params.id);

  if (count === 0) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  logger.info({ service: 'web', teamId, channelId: params.id }, 'Alert channel deleted');
  return new Response(null, { status: 204 });
});

import { withAuth } from '@/lib/api/with-auth';
import { alertChannelRepository } from '@/lib/repositories/alert-channels';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const count = await alertChannelRepository.softDelete(teamId, params.id);
  if (count === 0) throw new NotFoundError();

  logger.info({ service: 'web', teamId, channelId: params.id }, 'Alert channel deleted');
  return new Response(null, { status: 204 });
});

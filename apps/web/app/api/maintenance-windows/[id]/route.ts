import { withAuth } from '@/lib/api/with-auth';
import { maintenanceWindowRepository } from '@/lib/repositories/maintenance-windows';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const { id } = params as { id: string };
  const deleted = await maintenanceWindowRepository.delete(teamId, id);
  if (!deleted) throw new NotFoundError();

  logger.info({ service: 'web', teamId, windowId: id }, 'Maintenance window deleted');
  return new Response(null, { status: 204 });
});

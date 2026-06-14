import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { deployEventRepository } from '@/lib/repositories/deploy-events';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, PlanLimitError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const POST = withAuth<Params>(async (_req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') throw new PlanLimitError('Update-aware alerts require a Starter plan or higher');

  const monitor = await monitorRepository.findById(teamId, params.id);
  if (!monitor) throw new NotFoundError();

  const deploy = await deployEventRepository.endActiveDeploy(teamId, params.id);
  if (!deploy) throw new NotFoundError('No active deploy to end');

  logger.info(
    { service: 'web', teamId, monitorId: params.id, deployId: deploy.id },
    'Deploy event ended'
  );

  return Response.json(deploy);
});

import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { deployEventRepository } from '@/lib/repositories/deploy-events';
import { createDeployEventSchema } from '@/lib/validations/deploy-events';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { getPostHogClient } from '@/lib/posthog-server';

type Params = { id: string; [key: string]: string };

export const POST = withAuth<Params>(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') throw new PlanLimitError('Deploy-aware monitoring requires a Pro or Business plan');

  const monitor = await monitorRepository.findById(teamId, params.id);
  if (!monitor) throw new NotFoundError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = createDeployEventSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const deploy = await deployEventRepository.create(teamId, params.id, parsed.data);

  logger.info(
    { service: 'web', teamId, monitorId: params.id, deployId: deploy.id },
    'Deploy event created'
  );

  getPostHogClient().capture({
    distinctId: teamId,
    event: 'deploy_event_started',
    properties: { monitor_id: params.id, deploy_id: deploy.id },
  });

  return Response.json(deploy, { status: 201 });
});

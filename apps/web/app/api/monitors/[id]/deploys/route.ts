import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { deployEventRepository } from '@/lib/repositories/deploy-events';
import { listDeployEventsQuerySchema } from '@/lib/validations/deploy-events';
import { NotFoundError, PlanLimitError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (req, { teamId, plan }, params) => {
  if (plan === 'free') throw new PlanLimitError('Update-aware alerts require a Starter plan or higher');

  const monitor = await monitorRepository.findById(teamId, params.id);
  if (!monitor) throw new NotFoundError();

  const url = new URL(req.url);
  const raw = {
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  };

  const parsed = listDeployEventsQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const deploys = await deployEventRepository.list(teamId, params.id, {
    from: parsed.data.from ? new Date(parsed.data.from) : undefined,
    to: parsed.data.to ? new Date(parsed.data.to) : undefined,
    limit: parsed.data.limit,
  });

  return Response.json(deploys);
});

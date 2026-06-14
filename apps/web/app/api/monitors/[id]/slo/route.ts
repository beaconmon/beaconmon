import { withAuth } from '@/lib/api/with-auth';
import { sloRepository } from '@/lib/repositories/slo';
import { updateSloSchema } from '@/lib/validations/slo';
import { ForbiddenError, NotFoundError, PlanLimitError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId, plan }, params) => {
  if (plan === 'free') throw new PlanLimitError('Uptime goals require a Starter plan or higher');

  const data = await sloRepository.getSloData(teamId, params.id, plan);
  if (!data) throw new NotFoundError();

  return Response.json(data);
});

export const PATCH = withAuth<Params>(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') throw new PlanLimitError('Uptime goals require a Starter plan or higher');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }
  const parsed = updateSloSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  // Starter plan: only 1 SLO per monitor (can update existing, but can't add if another monitor has one)
  if (plan === 'starter' && parsed.data.sloTarget !== null) {
    const existingCount = await sloRepository.countSlosByTeam(teamId);
    // Check if this monitor already has an SLO — if so, update is fine
    const current = await sloRepository.getSloData(teamId, params.id, plan);
    if (!current) throw new NotFoundError();

    const isNewSlo = current.config.sloTarget === null;
    if (isNewSlo && existingCount >= 1) {
      throw new PlanLimitError('Starter plan allows 1 uptime goal. Upgrade to Growth for unlimited.');
    }
  }

  // Scale plan: custom thresholds allowed; Starter/Growth: only default thresholds
  if (plan === 'starter' || plan === 'growth') {
    if (parsed.data.sloBurnRateFastThreshold !== undefined || parsed.data.sloBurnRateSlowThreshold !== undefined) {
      throw new PlanLimitError('Custom alert thresholds require a Scale plan');
    }
  }

  const result = await sloRepository.updateSlo(teamId, params.id, parsed.data);
  if (result.count === 0) throw new NotFoundError();

  const updated = await sloRepository.getSloData(teamId, params.id, plan);
  return Response.json(updated);
});

import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { competitorRepository } from '@/lib/repositories/competitors';
import { updateMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError, PlanLimitError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const monitor = await monitorRepository.findById(teamId, params.id);
  if (!monitor) throw new NotFoundError();
  return Response.json(monitor);
});

export const PATCH = withAuth<Params>(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateMonitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const data = parsed.data;

  // Enforce minimum check interval when updating
  if (data.intervalSeconds !== undefined) {
    const minInterval = PLAN_LIMITS[plan].checkIntervalSeconds;
    if (data.intervalSeconds < minInterval) {
      throw new PlanLimitError(`Your plan minimum check interval is ${minInterval}s`);
    }
  }

  // Check competitor monitor quota when enabling isCompetitor
  if (data.isCompetitor) {
    const existing = await monitorRepository.findById(teamId, params.id);
    if (existing && !existing.isCompetitor) {
      const limits = PLAN_LIMITS[plan];
      const competitorLimit = limits.competitorMonitors;
      if (competitorLimit !== -1) {
        const competitorCount = await competitorRepository.countActive(teamId);
        if (competitorCount >= competitorLimit) {
          throw new PlanLimitError(
            `Your plan allows a maximum of ${competitorLimit} competitor monitor${competitorLimit !== 1 ? 's' : ''}`
          );
        }
      }
    }
  }

  const result = await monitorRepository.update(teamId, params.id, data);
  if (result.count === 0) throw new NotFoundError();

  const monitor = await monitorRepository.findById(teamId, params.id);
  logger.info({ service: 'web', teamId, monitorId: params.id }, 'Monitor updated');
  return Response.json(monitor);
});

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const result = await monitorRepository.softDelete(teamId, params.id);
  if (result.count === 0) throw new NotFoundError();

  logger.info({ service: 'web', teamId, monitorId: params.id }, 'Monitor soft-deleted');
  return new Response(null, { status: 204 });
});

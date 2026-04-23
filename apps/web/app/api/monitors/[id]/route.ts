import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { updateMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const monitor = await monitorRepository.findById(teamId, params.id);
  if (!monitor) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }
  return Response.json(monitor);
});

export const PATCH = withAuth<Params>(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const parsed = updateMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Enforce minimum check interval when updating
  if (data.intervalSeconds !== undefined) {
    const minInterval = PLAN_LIMITS[plan].checkIntervalSeconds;
    if (data.intervalSeconds < minInterval) {
      return Response.json(
        {
          error: `Your plan minimum check interval is ${minInterval}s`,
          code: ErrorCode.PLAN_LIMIT_REACHED,
        },
        { status: 422 }
      );
    }
  }

  const result = await monitorRepository.update(teamId, params.id, data);
  if (result.count === 0) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  const monitor = await monitorRepository.findById(teamId, params.id);
  logger.info({ service: 'web', teamId, monitorId: params.id }, 'Monitor updated');
  return Response.json(monitor);
});

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const result = await monitorRepository.softDelete(teamId, params.id);
  if (result.count === 0) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  logger.info({ service: 'web', teamId, monitorId: params.id }, 'Monitor soft-deleted');
  return new Response(null, { status: 204 });
});

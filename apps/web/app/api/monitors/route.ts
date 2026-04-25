import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { createMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

export const GET = withAuth(async (_req, { teamId }) => {
  const monitors = await monitorRepository.findAll(teamId);
  return Response.json(monitors);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  // 20 monitor creates per hour per team — prevents bulk abuse / accidental loops
  // Fail-open on Redis unavailability so monitor creation still works
  try {
    const rl = await rateLimit(`monitors:create:${teamId}`, 20, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Monitor create rate limit exceeded');
      return rateLimitResponse(rl.reset);
    }
  } catch {
    logger.warn({ service: 'web', teamId }, 'Rate limit Redis unavailable — failing open');
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

  const parsed = createMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const limits = PLAN_LIMITS[plan];

  // Check monitor count limit
  if (limits.monitors !== -1) {
    const count = await monitorRepository.countByTeam(teamId);
    if (count >= limits.monitors) {
      return Response.json(
        {
          error: `Your plan allows a maximum of ${limits.monitors} monitors`,
          code: ErrorCode.PLAN_LIMIT_REACHED,
        },
        { status: 422 }
      );
    }
  }

  // Enforce minimum check interval for the plan
  if (data.intervalSeconds < limits.checkIntervalSeconds) {
    return Response.json(
      {
        error: `Your plan minimum check interval is ${limits.checkIntervalSeconds}s`,
        code: ErrorCode.PLAN_LIMIT_REACHED,
      },
      { status: 422 }
    );
  }

  const monitor = await monitorRepository.create(teamId, data);
  logger.info({ service: 'web', teamId, monitorId: monitor.id }, 'Monitor created');
  return Response.json(monitor, { status: 201 });
});

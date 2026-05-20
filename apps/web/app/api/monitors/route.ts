import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { competitorRepository } from '@/lib/repositories/competitors';
import { createMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';

export const GET = withAuth(async (req, { teamId }) => {
  const tag = new URL(req.url).searchParams.get('tag');
  const monitors = await monitorRepository.findAll(teamId, tag ? { tag } : undefined);
  return Response.json(monitors);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

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
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createMonitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const data = parsed.data;
  const limits = PLAN_LIMITS[plan];

  // Check monitor count limit
  if (limits.monitors !== -1) {
    const count = await monitorRepository.countByTeam(teamId);
    if (count >= limits.monitors) {
      throw new PlanLimitError(`Your plan allows a maximum of ${limits.monitors} monitors`);
    }
  }

  // Check competitor monitor quota when creating a competitor monitor
  if (data.isCompetitor) {
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

  if (data.type === 'heartbeat' && plan === 'free') {
    throw new PlanLimitError('Heartbeat monitoring requires a Pro or Business plan');
  }

  // Enforce minimum check interval for the plan
  if (data.intervalSeconds < limits.checkIntervalSeconds) {
    throw new PlanLimitError(`Your plan minimum check interval is ${limits.checkIntervalSeconds}s`);
  }

  const monitor = await monitorRepository.create(teamId, data);
  logger.info({ service: 'web', teamId, monitorId: monitor.id }, 'Monitor created');
  return Response.json(monitor, { status: 201 });
});

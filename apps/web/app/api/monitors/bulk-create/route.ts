import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { createMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';

const bulkCreateSchema = z.object({
  monitors: z.array(createMonitorSchema).min(1).max(20),
  source: z.enum(['discovery', 'template', 'import']).optional(),
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  try {
    const rl = await rateLimit(`monitors:bulk-create:${teamId}`, 20, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Bulk-create rate limit exceeded');
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

  const parsed = bulkCreateSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { monitors: inputs, source } = parsed.data;
  const limits = PLAN_LIMITS[plan];

  if (limits.monitors !== -1) {
    const existing = await monitorRepository.countByTeam(teamId);
    if (existing + inputs.length > limits.monitors) {
      throw new PlanLimitError(
        `Your plan allows ${limits.monitors} monitors — you have ${existing} and tried to add ${inputs.length}.`
      );
    }
  }

  for (const input of inputs) {
    if (input.intervalSeconds < limits.checkIntervalSeconds) {
      throw new PlanLimitError(
        `Your plan minimum check interval is ${limits.checkIntervalSeconds}s`
      );
    }
  }

  const created = await monitorRepository.bulkCreate(teamId, inputs);

  logger.info(
    { service: 'web', teamId, count: created.length, source },
    'Monitors bulk-created'
  );

  try {
    getPostHogClient().capture({
      distinctId: teamId,
      event: 'monitors_bulk_created',
      properties: { count: created.length, source: source ?? 'manual' },
    });
  } catch {
    // PostHog not configured locally — non-fatal
  }

  return Response.json({ created }, { status: 201 });
});

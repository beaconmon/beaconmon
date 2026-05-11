import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { tagSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';

const bulkSchema = z.discriminatedUnion('action', [
  z.object({
    monitorIds: z.array(z.string().min(1)).min(1).max(200),
    action: z.literal('pause'),
  }),
  z.object({
    monitorIds: z.array(z.string().min(1)).min(1).max(200),
    action: z.literal('resume'),
  }),
  z.object({
    monitorIds: z.array(z.string().min(1)).min(1).max(200),
    action: z.literal('delete'),
  }),
  z.object({
    monitorIds: z.array(z.string().min(1)).min(1).max(200),
    action: z.literal('set-interval'),
    intervalSeconds: z.number().int().positive(),
  }),
  z.object({
    monitorIds: z.array(z.string().min(1)).min(1).max(200),
    action: z.literal('add-tag'),
    tag: tagSchema,
  }),
]);

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const data = parsed.data;
  const limits = PLAN_LIMITS[plan];

  let result: { count: number };
  switch (data.action) {
    case 'pause':
      result = await monitorRepository.bulkSetActive(teamId, data.monitorIds, false);
      break;
    case 'resume':
      result = await monitorRepository.bulkSetActive(teamId, data.monitorIds, true);
      break;
    case 'delete':
      result = await monitorRepository.bulkSoftDelete(teamId, data.monitorIds);
      break;
    case 'set-interval':
      if (data.intervalSeconds < limits.checkIntervalSeconds) {
        throw new PlanLimitError(`Your plan minimum check interval is ${limits.checkIntervalSeconds}s`);
      }
      result = await monitorRepository.bulkSetInterval(teamId, data.monitorIds, data.intervalSeconds);
      break;
    case 'add-tag':
      result = await monitorRepository.bulkAddTag(teamId, data.monitorIds, data.tag);
      break;
  }

  logger.info(
    { service: 'web', teamId, action: data.action, count: result.count },
    'Bulk monitor action'
  );

  getPostHogClient().capture({
    distinctId: teamId,
    event: 'monitors_bulk_actioned',
    properties: { action: data.action, monitor_count: result.count },
  });

  return Response.json({ updated: result.count });
});

import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { maintenanceWindowRepository } from '@/lib/repositories/maintenance-windows';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const createMaintenanceWindowSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
  monitorIds: z.array(z.string()).optional(),
}).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
  message: 'endsAt must be after startsAt',
  path: ['endsAt'],
});

export const GET = withAuth(async (_req, { teamId }) => {
  const windows = await maintenanceWindowRepository.findAll(teamId);
  return Response.json(windows);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') {
    throw new PlanLimitError('Maintenance windows require a Starter plan or higher');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createMaintenanceWindowSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const window = await maintenanceWindowRepository.create(teamId, {
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
    reason: parsed.data.reason,
    monitorIds: parsed.data.monitorIds,
  });

  logger.info({ service: 'web', teamId, windowId: window.id }, 'Maintenance window created');
  return Response.json(window, { status: 201 });
});

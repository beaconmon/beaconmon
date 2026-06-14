import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { maintenanceWindowRepository } from '@/lib/repositories/maintenance-windows';
import {
  ForbiddenError,
  NotFoundError,
  PlanLimitError,
  ValidationError,
} from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const updateMaintenanceWindowSchema = z
  .object({
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    reason: z.string().max(500).nullable().optional(),
    monitorIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt);
      }
      return true;
    },
    { message: 'endsAt must be after startsAt', path: ['endsAt'] }
  );

export const PATCH = withAuth(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') {
    throw new PlanLimitError('Maintenance windows require a Starter plan or higher');
  }

  const { id } = params as { id: string };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateMaintenanceWindowSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const newStartsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined;
  const newEndsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined;

  // For partial updates, validate the merged dates against the stored record so a
  // payload with only one of startsAt/endsAt cannot leave the row in an invalid state.
  if (newStartsAt !== undefined || newEndsAt !== undefined) {
    const existing = await maintenanceWindowRepository.findById(teamId, id);
    if (!existing) throw new NotFoundError();

    const effectiveStartsAt = newStartsAt ?? existing.startsAt;
    const effectiveEndsAt = newEndsAt ?? existing.endsAt;
    if (effectiveEndsAt <= effectiveStartsAt) {
      throw new ValidationError('endsAt must be after startsAt');
    }
  }

  const updated = await maintenanceWindowRepository.update(teamId, id, {
    startsAt: newStartsAt,
    endsAt: newEndsAt,
    reason: parsed.data.reason,
    monitorIds: parsed.data.monitorIds,
  });

  if (!updated) throw new NotFoundError();

  logger.info({ service: 'web', teamId, windowId: id }, 'Maintenance window updated');
  return Response.json(updated);
});

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const { id } = params as { id: string };
  const deleted = await maintenanceWindowRepository.delete(teamId, id);
  if (!deleted) throw new NotFoundError();

  logger.info({ service: 'web', teamId, windowId: id }, 'Maintenance window deleted');
  return new Response(null, { status: 204 });
});

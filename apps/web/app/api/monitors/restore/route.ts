import { z } from 'zod';
import { prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { PLAN_LIMITS } from '@beaconmon/types';
import { ForbiddenError, ValidationError, PlanLimitError, NotFoundError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const bodySchema = z.object({
  monitorId: z.string(),
});

/**
 * POST /api/monitors/restore
 * Manually restore a single monitor that was paused due to trial-end enforcement.
 * Requires free cap to have room (for the relevant monitor type).
 * Upgrade-based full restore happens automatically via the Freemius webhook.
 */
export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { monitorId } = parsed.data;

  const monitor = await prisma.monitor.findFirst({
    where: { id: monitorId, teamId, deletedAt: null },
    select: { id: true, isCompetitor: true, pausedReason: true, pausedAt: true },
  });

  if (!monitor) throw new NotFoundError('Monitor not found');
  if (monitor.pausedReason !== 'trial_end') {
    throw new ValidationError('Monitor was not paused by trial-end enforcement');
  }
  if (!monitor.pausedAt || Date.now() - monitor.pausedAt.getTime() > THIRTY_DAYS_MS) {
    throw new ValidationError('Recovery window has expired (30 days)');
  }

  const limits = PLAN_LIMITS[plan];

  await prisma.$transaction(async (tx) => {
    if (monitor.isCompetitor) {
      const activeCompetitorCount = await tx.monitor.count({
        where: { teamId, isCompetitor: true, isActive: true, deletedAt: null },
      });
      if (limits.competitorMonitors !== -1 && activeCompetitorCount >= limits.competitorMonitors) {
        throw new PlanLimitError(
          `Your plan allows ${limits.competitorMonitors} competitor monitor${limits.competitorMonitors !== 1 ? 's' : ''}. Upgrade to restore more.`
        );
      }
    } else {
      const activeCount = await tx.monitor.count({
        where: { teamId, isCompetitor: false, isActive: true, deletedAt: null },
      });
      if (limits.monitors !== -1 && activeCount >= limits.monitors) {
        throw new PlanLimitError(
          `Your plan allows ${limits.monitors} monitors. Upgrade to restore more.`
        );
      }
    }

    await tx.monitor.update({
      where: { id: monitorId },
      data: { isActive: true, pausedReason: null, pausedAt: null, nextCheckAt: new Date() },
    });
  });

  logger.info({ service: 'web', teamId, monitorId }, 'Monitor manually restored after trial-end pause');

  return Response.json({ restored: true });
});

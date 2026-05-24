import { prisma, alertChannelRepository } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

const PAST_DUE_GRACE_DAYS = 10;

export const pastDueDowngradeTask: SchedulerTask = {
  name: 'past-due-downgrade',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const cutoff = new Date(Date.now() - PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000);

    try {
      const overdue = await prisma.subscription.findMany({
        where: { status: 'past_due', updatedAt: { lt: cutoff } },
        select: { id: true, teamId: true },
      });

      if (overdue.length === 0) return;

      for (const sub of overdue) {
        try {
          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'canceled', plan: 'free' },
            }),
            prisma.team.update({
              where: { id: sub.teamId },
              data: { plan: 'free' },
            }),
          ]);

          try {
            await alertChannelRepository.disableSurplusForPlan(sub.teamId, 'free');
          } catch (alertErr) {
            logger.error(
              { service: 'scheduler', teamId: sub.teamId, err: alertErr },
              'past_due downgrade: failed to disable surplus alert channels'
            );
            Sentry.captureException(alertErr);
          }

          logger.info(
            { service: 'scheduler', teamId: sub.teamId, subscriptionId: sub.id },
            'past_due subscription auto-downgraded to free after grace period'
          );
        } catch (err) {
          logger.error(
            { service: 'scheduler', teamId: sub.teamId, subscriptionId: sub.id, err },
            'past_due downgrade: failed to downgrade subscription, skipping'
          );
          Sentry.captureException(err);
        }
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'past_due downgrade job failed');
      Sentry.captureException(err);
    }
  },
};

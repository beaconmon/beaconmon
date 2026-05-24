import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { getEffectivePlan } from '@beaconmon/billing';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { SchedulerTask } from './types.js';

export const retentionCleanupTask: SchedulerTask = {
  name: 'retention-cleanup',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    logger.info({ service: 'scheduler' }, 'Starting per-plan retention cleanup');

    try {
      const teams = await prisma.team.findMany({
        select: {
          id: true,
          plan: true,
          trialEndsAt: true,
          subscription: { select: { status: true } },
          monitors: { select: { id: true } },
        },
      });

      let totalDeleted = 0;

      for (const team of teams) {
        if (team.monitors.length === 0) continue;

        const effectivePlan = getEffectivePlan(team);
        const historyDays = PLAN_LIMITS[effectivePlan].historyDays;
        if (historyDays >= 365) continue;

        const cutoff = new Date(Date.now() - historyDays * 24 * 60 * 60 * 1000);
        const monitorIds = team.monitors.map((m) => m.id);

        let batchDeleted: number;
        do {
          const result = await prisma.$executeRaw`
            DELETE FROM check_results
            WHERE ctid IN (
              SELECT ctid FROM check_results
              WHERE monitor_id = ANY(${monitorIds})
                AND checked_at < ${cutoff}
              LIMIT 10000
            )
          `;
          batchDeleted = result as unknown as number;
          totalDeleted += batchDeleted;
        } while (batchDeleted > 0);
      }

      logger.info({ service: 'scheduler', totalDeleted }, 'Per-plan retention cleanup complete');
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Retention cleanup failed');
      Sentry.captureException(err);
    }

    try {
      const webhookCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deleted = await prisma.processedWebhookEvent.deleteMany({
        where: { processedAt: { lt: webhookCutoff } },
      });
      if (deleted.count > 0) {
        logger.info({ service: 'scheduler', deleted: deleted.count }, 'Purged old processed_webhook_events');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'processed_webhook_events purge failed');
    }
  },
};

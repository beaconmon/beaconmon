import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

const PRUNE_DAYS = 35;

export const monitoringRunPruneTask: SchedulerTask = {
  name: 'monitoring-run-prune',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: false,
  async run(): Promise<void> {
    const cutoff = new Date(Date.now() - PRUNE_DAYS * 24 * 60 * 60 * 1000);
    try {
      const { count } = await prisma.monitoringRun.deleteMany({
        where: { finishedAt: { lt: cutoff } },
      });
      if (count > 0) {
        logger.info({ service: 'scheduler', count }, 'Pruned old monitoring_runs');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'monitoring_run prune failed');
      Sentry.captureException(err);
    }
  },
};

import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

export const partitionPurgeTask: SchedulerTask = {
  name: 'partition-purge',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const year = cutoff.getFullYear();
    const month = String(cutoff.getMonth() + 1).padStart(2, '0');
    const partitionName = `check_results_${year}_${month}`;

    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${partitionName}"`);
      logger.info({ service: 'scheduler', partitionName }, 'Purged old partition');
    } catch (err) {
      logger.error({ service: 'scheduler', partitionName, err }, 'Failed to purge partition');
      Sentry.captureException(err);
    }
  },
};

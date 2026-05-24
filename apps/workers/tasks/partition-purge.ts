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
    // Step back one more month so we only drop partitions where every row is
    // older than 365 days. Without this, a partition for the cutoff month would
    // be dropped while the second half of that month is still within 365 days.
    cutoff.setMonth(cutoff.getMonth() - 1);

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

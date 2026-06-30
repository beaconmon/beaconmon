import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

// Number of months ahead to maintain partitions. Kept modest so DROP later
// does not need to scan huge ranges on index rebuilds.
const LOOKAHEAD_MONTHS = 6;

export const partitionCreateTask: SchedulerTask = {
  name: 'partition-create',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const rows = await prisma.$queryRawUnsafe<{ partition_name: string; upper_bound: string }[]>(
      `SELECT
        c.relname AS partition_name,
        pg_get_expr(c.relpartbound, c.oid) AS upper_bound
      FROM pg_inherits i
      JOIN pg_class c ON c.oid = i.inhrelid
      WHERE i.inhparent = 'check_results'::regclass
      ORDER BY c.relname DESC
      LIMIT 1`,
    );

    if (rows.length === 0) {
      logger.warn({ service: 'scheduler' }, 'No check_results partitions found; cannot create future partitions');
      return;
    }

    // Parse the upper bound of the latest partition e.g. FOR VALUES FROM ('2026-06-01') TO ('2026-07-01')
    const match = rows[0]!.upper_bound.match(/TO\s+\('(\d{4}-\d{2}-\d{2})'/);
    if (!match) {
      logger.warn({ service: 'scheduler', bound: rows[0]!.upper_bound }, 'Could not parse partition upper bound');
      return;
    }

    const latestBound = new Date(match[1]!);
    const now = new Date();
    const targetEnd = new Date(now.getFullYear(), now.getMonth() + LOOKAHEAD_MONTHS, 1);

    // Walk month by month from the latest bound to the target end
    const cursor = new Date(latestBound);
    let created = 0;

    while (cursor < targetEnd) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, '0');
      const partitionName = `check_results_${year}_${month}`;

      const nextMonth = new Date(cursor);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextYear = nextMonth.getFullYear();
      const nextMonthStr = String(nextMonth.getMonth() + 1).padStart(2, '0');

      const fromStr = `${year}-${month}-01`;
      const toStr = `${nextYear}-${nextMonthStr}-01`;

      try {
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${partitionName}" PARTITION OF "check_results" FOR VALUES FROM ($1::date) TO ($2::date)`,
          fromStr,
          toStr,
        );
        logger.info({ service: 'scheduler', partitionName, from: fromStr, to: toStr }, 'Created partition');
        created++;
      } catch (err) {
        logger.error({ service: 'scheduler', partitionName, err }, 'Failed to create partition');
        Sentry.captureException(err);
      }

      cursor.setMonth(cursor.getMonth() + 1);
    }

    if (created > 0) {
      logger.info({ service: 'scheduler', created }, 'Partition creation complete');
    }
  },
};

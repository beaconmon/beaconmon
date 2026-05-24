import { prisma, statusPageWorkerRepository } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection } from '../lib/redis.js';
import type { SchedulerTask } from './types.js';

export const uptimeComputeTask: SchedulerTask = {
  name: 'uptime-compute',
  runIntervalMs: 5 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    try {
      const monitorIds = await statusPageWorkerRepository.findAllMonitorIdsOnStatusPages();
      if (monitorIds.length === 0) return;

      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      type UptimeRow = { monitor_id: string; uptime: number };
      const rows = await prisma.$queryRaw<UptimeRow[]>`
        SELECT
          monitor_id,
          ROUND(
            (SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0)::float * 100)::numeric,
            2
          )::float AS uptime
        FROM check_results
        WHERE monitor_id = ANY(${monitorIds})
          AND checked_at >= ${cutoff}
          AND maintenance = false
        GROUP BY monitor_id
      `;

      if (rows.length === 0) return;

      const args: string[] = [];
      for (const row of rows) {
        args.push(row.monitor_id, String(row.uptime ?? 100));
      }
      await connection.hset('uptime:90d', ...args);

      logger.info({ service: 'scheduler', count: rows.length }, 'Uptime percentages computed');
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Failed to compute uptime percentages');
      Sentry.captureException(err);
    }
  },
};

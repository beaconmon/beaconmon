import { prisma, Prisma } from '../index.js';
import type { CheckResult, DailyUptimeStat } from '@beaconmon/types';

export const checkResultRepository = {
  async create(result: CheckResult): Promise<void> {
    await prisma.checkResult.create({
      data: {
        monitorId: result.monitorId,
        checkedAt: result.checkedAt,
        success: result.success,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        errorType: result.errorType,
        errorMessage: result.errorMessage,
        region: result.region ?? null,
        maintenance: result.maintenance ?? false,
      },
    });
  },

  /**
   * Returns N DailyUptimeStat entries per monitor (oldest first).
   * Days with no data are filled as { state: 'nodata', uptimePercent: 0 }.
   * Used for the per-service uptime bar chart on public status pages.
   * No teamId scoping — called from worker context with trusted monitorIds.
   */
  async getDailyUptimeStats(
    monitorIds: string[],
    days: number
  ): Promise<Map<string, DailyUptimeStat[]>> {
    const result = new Map<string, DailyUptimeStat[]>();
    if (monitorIds.length === 0) return result;

    interface DailyRow {
      monitor_id: string;
      day: Date;
      total: bigint;
      successes: bigint;
    }

    const idList = Prisma.join(monitorIds.map((id) => Prisma.sql`${id}`));

    const cutoff = new Date();
    cutoff.setUTCHours(0, 0, 0, 0);
    cutoff.setUTCDate(cutoff.getUTCDate() - days);

    const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
      SELECT
        monitor_id,
        DATE_TRUNC('day', checked_at AT TIME ZONE 'UTC') AS day,
        COUNT(*)::bigint AS total,
        SUM(CASE WHEN success THEN 1 ELSE 0 END)::bigint AS successes
      FROM check_results
      WHERE monitor_id IN (${idList})
        AND checked_at >= ${cutoff}
      GROUP BY monitor_id, DATE_TRUNC('day', checked_at AT TIME ZONE 'UTC')
      ORDER BY monitor_id, day
    `);

    // Build a map of rows per monitor: dateStr → { total, successes }
    const rowsByMonitor = new Map<string, Map<string, { total: number; successes: number }>>();
    for (const row of rows) {
      const dateStr = row.day.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      if (!rowsByMonitor.has(row.monitor_id)) {
        rowsByMonitor.set(row.monitor_id, new Map());
      }
      rowsByMonitor.get(row.monitor_id)!.set(dateStr, {
        total: Number(row.total),
        successes: Number(row.successes),
      });
    }

    // Generate the full date array (oldest → today) for each monitor
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const monitorId of monitorIds) {
      const stats: DailyUptimeStat[] = [];
      const monitorRows = rowsByMonitor.get(monitorId) ?? new Map();

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const row = monitorRows.get(dateStr);

        if (!row) {
          stats.push({ date: dateStr, state: 'nodata', uptimePercent: 0 });
        } else {
          const uptimePercent = row.total > 0 ? (row.successes / row.total) * 100 : 0;
          let state: DailyUptimeStat['state'];
          if (uptimePercent === 100) state = 'up';
          else if (uptimePercent === 0) state = 'outage';
          else state = 'degraded';
          stats.push({ date: dateStr, state, uptimePercent });
        }
      }

      result.set(monitorId, stats);
    }

    return result;
  },

  /**
   * Latest responseTimeMs per monitor, looking back 24h so the query stays
   * inside the recent check_results partitions (range-partitioned by month).
   * Returns a Map of monitorId to ms, or null when the latest check had no
   * timing. No teamId scoping: called with trusted monitorIds.
   */
  async getLatestResponseTimes(
    monitorIds: string[]
  ): Promise<Map<string, number | null>> {
    const result = new Map<string, number | null>();
    if (monitorIds.length === 0) return result;

    const idList = Prisma.join(monitorIds.map((id) => Prisma.sql`${id}`));
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    interface Row {
      monitor_id: string;
      response_time_ms: number | null;
    }

    const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
      SELECT DISTINCT ON (monitor_id) monitor_id, response_time_ms
      FROM check_results
      WHERE monitor_id IN (${idList})
        AND checked_at >= ${since}
      ORDER BY monitor_id, checked_at DESC
    `);

    for (const row of rows) {
      result.set(
        row.monitor_id,
        row.response_time_ms === null ? null : Number(row.response_time_ms)
      );
    }

    return result;
  },
};

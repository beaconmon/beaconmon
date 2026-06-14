import { prisma } from '@beaconmon/db';
import { Prisma } from '@beaconmon/db';
import { clampToPlanRetention, PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier, DailyUptimeStat } from '@beaconmon/types';

interface CheckResultsOptions {
  from: Date;
  to: Date;
  limit: number;
}

interface SummaryRawRow {
  monitor_id: string;
  total: bigint;
  success_count: bigint;
  recent_rts: (number | null)[] | null;
}

export const checkResultRepository = {
  async findByMonitor(
    teamId: string,
    monitorId: string,
    plan: PlanTier,
    options: CheckResultsOptions
  ) {
    // Clamp `from` to the plan's retention window — never expose data beyond plan limits.
    const from = clampToPlanRetention(options.from, plan);

    // Verify the monitor belongs to this team (authorization check).
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, teamId, deletedAt: null },
      select: { id: true },
    });

    if (!monitor) return null;

    return prisma.checkResult.findMany({
      where: {
        monitorId,
        checkedAt: { gte: from, lte: options.to },
      },
      select: {
        id: true,
        checkedAt: true,
        success: true,
        statusCode: true,
        responseTimeMs: true,
        errorType: true,
        errorMessage: true,
        region: true,
      },
      orderBy: { checkedAt: 'desc' },
      take: options.limit,
    });
  },

  // Returns uptime % + last 15 response times per monitor in a single DB query.
  // Used on the monitors list page for sparklines and 30d uptime indicators.
  async getMonitorSummaries(
    teamId: string,
    monitorIds: string[],
    plan: PlanTier
  ): Promise<Map<string, { uptime30d: number | null; recentRts: number[]; lastSnapshotAt: Date | null }>> {
    const result = new Map<string, { uptime30d: number | null; recentRts: number[]; lastSnapshotAt: Date | null }>();

    if (monitorIds.length === 0) return result;

    for (const id of monitorIds) {
      result.set(id, { uptime30d: null, recentRts: [], lastSnapshotAt: null });
    }

    const clampedDays = Math.min(30, PLAN_LIMITS[plan].historyDays);
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - clampedDays);
    from.setUTCHours(0, 0, 0, 0);

    const idList = Prisma.join(monitorIds.map((id) => Prisma.sql`${id}`));

    const rows = await prisma.$queryRaw<SummaryRawRow[]>(Prisma.sql`
      WITH recent AS (
        SELECT
          cr.monitor_id,
          cr.success,
          cr.response_time_ms,
          cr.checked_at,
          ROW_NUMBER() OVER (PARTITION BY cr.monitor_id ORDER BY cr.checked_at DESC) AS rn
        FROM check_results cr
        JOIN monitors m ON m.id = cr.monitor_id
        WHERE
          cr.monitor_id IN (${idList})
          AND cr.checked_at >= ${from}
          AND m.team_id = ${teamId}
          AND m.deleted_at IS NULL
      )
      SELECT
        monitor_id,
        COUNT(*)::bigint                                                           AS total,
        COUNT(*) FILTER (WHERE success = true)::bigint                            AS success_count,
        ARRAY_AGG(response_time_ms ORDER BY rn DESC) FILTER (WHERE rn <= 15)      AS recent_rts
      FROM recent
      GROUP BY monitor_id
    `);

    for (const row of rows) {
      const total = Number(row.total);
      const success = Number(row.success_count);
      const uptime30d = total > 0 ? Math.round((success / total) * 10000) / 100 : null;
      const recentRts = (row.recent_rts ?? []).filter((v): v is number => v != null);
      result.set(row.monitor_id, { uptime30d, recentRts, lastSnapshotAt: null });
    }

    // Fetch the most recent content snapshot timestamp per monitor.
    // Intentionally not clamped to the plan retention window: this powers the
    // "Last change" column, where surfacing the most recent change ever is the
    // useful signal. The retention clamp applies to check_results (the
    // partitioned table) above, not to this lightweight MAX over content_snapshots.
    interface SnapshotRow { monitor_id: string; last_snapshot_at: Date }
    const snapshotRows = await prisma.$queryRaw<SnapshotRow[]>(Prisma.sql`
      SELECT monitor_id, MAX(captured_at) AS last_snapshot_at
      FROM content_snapshots
      WHERE monitor_id IN (${idList})
      GROUP BY monitor_id
    `);
    for (const row of snapshotRows) {
      const existing = result.get(row.monitor_id);
      if (existing) existing.lastSnapshotAt = row.last_snapshot_at;
    }

    return result;
  },

  /**
   * Returns 90 DailyUptimeStat entries per monitor (oldest first).
   * Days with no data are filled as { state: 'nodata', uptimePercent: 0 }.
   * Used for the per-service uptime bar chart on public status pages.
   * Called from the status page cache layer on a cache miss.
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
};

import { prisma, Prisma } from '../index.js';

export interface SloMetrics {
  monitorId: string;
  uptimePercent: number;
  errorBudgetTotalMinutes: number;
  errorBudgetRemainingMinutes: number;
  errorBudgetConsumedPercent: number;
  burnRate: number;
  windowDays: number;
  sloTarget: number;
  totalChecks: number;
  failedChecks: number;
}

interface BurnRateRow {
  monitor_id: string;
  total: bigint;
  failures: bigint;
}

export const sloRepository = {
  /**
   * Computes uptime %, error budget, and burn rate for a single monitor
   * over its configured SLO window. No teamId scoping — worker context.
   */
  async computeMetrics(
    monitorId: string,
    sloTarget: number,
    windowDays: number
  ): Promise<SloMetrics> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - windowDays);
    cutoff.setUTCHours(0, 0, 0, 0);

    const rows = await prisma.$queryRaw<BurnRateRow[]>(Prisma.sql`
      SELECT
        monitor_id,
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE success = false)::bigint AS failures
      FROM check_results
      WHERE monitor_id = ${monitorId}
        AND checked_at >= ${cutoff}
      GROUP BY monitor_id
    `);

    const row = rows[0];
    const totalChecks = row ? Number(row.total) : 0;
    const failedChecks = row ? Number(row.failures) : 0;

    const uptimePercent = totalChecks > 0
      ? ((totalChecks - failedChecks) / totalChecks) * 100
      : 100;

    const windowMinutes = windowDays * 24 * 60;
    const errorBudgetTotalMinutes = (1 - sloTarget) * windowMinutes;
    const downtimeMinutes = totalChecks > 0
      ? (failedChecks / totalChecks) * windowMinutes
      : 0;
    const errorBudgetRemainingMinutes = Math.max(0, errorBudgetTotalMinutes - downtimeMinutes);
    const errorBudgetConsumedPercent = errorBudgetTotalMinutes > 0
      ? Math.min(100, (downtimeMinutes / errorBudgetTotalMinutes) * 100)
      : 0;

    // burn_rate = (observed error rate) / (allowed error rate)
    // burn_rate > 1 means consuming budget faster than sustainable
    const observedErrorRate = totalChecks > 0 ? failedChecks / totalChecks : 0;
    const allowedErrorRate = 1 - sloTarget;
    const burnRate = allowedErrorRate > 0 ? observedErrorRate / allowedErrorRate : 0;

    return {
      monitorId,
      uptimePercent,
      errorBudgetTotalMinutes,
      errorBudgetRemainingMinutes,
      errorBudgetConsumedPercent,
      burnRate,
      windowDays,
      sloTarget,
      totalChecks,
      failedChecks,
    };
  },

  /**
   * Computes burn rate over a short window (e.g. 5 minutes or 1 hour)
   * for fast/slow burn alerting. Returns the burn rate relative to the
   * monitor's SLO target.
   */
  async computeShortWindowBurnRate(
    monitorId: string,
    sloTarget: number,
    windowMinutes: number
  ): Promise<{ burnRate: number; totalChecks: number; failedChecks: number }> {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

    const rows = await prisma.$queryRaw<BurnRateRow[]>(Prisma.sql`
      SELECT
        monitor_id,
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE success = false)::bigint AS failures
      FROM check_results
      WHERE monitor_id = ${monitorId}
        AND checked_at >= ${cutoff}
      GROUP BY monitor_id
    `);

    const row = rows[0];
    const totalChecks = row ? Number(row.total) : 0;
    const failedChecks = row ? Number(row.failures) : 0;

    const observedErrorRate = totalChecks > 0 ? failedChecks / totalChecks : 0;
    const allowedErrorRate = 1 - sloTarget;
    const burnRate = allowedErrorRate > 0 ? observedErrorRate / allowedErrorRate : 0;

    return { burnRate, totalChecks, failedChecks };
  },

  /**
   * Loads all monitors that have an SLO configured.
   * Used by the scheduler to evaluate burn rates periodically.
   */
  async findMonitorsWithSlo(): Promise<Array<{
    id: string;
    teamId: string;
    name: string;
    url: string;
    sloTarget: number;
    sloWindowDays: number;
    sloBurnRateFastThreshold: number;
    sloBurnRateSlowThreshold: number;
  }>> {
    const monitors = await prisma.monitor.findMany({
      where: {
        sloTarget: { not: null },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        teamId: true,
        name: true,
        url: true,
        sloTarget: true,
        sloWindowDays: true,
        sloBurnRateFastThreshold: true,
        sloBurnRateSlowThreshold: true,
      },
    });

    return monitors.map((m) => ({
      id: m.id,
      teamId: m.teamId,
      name: m.name,
      url: m.url,
      sloTarget: Number(m.sloTarget!),
      sloWindowDays: m.sloWindowDays ?? 30,
      sloBurnRateFastThreshold: m.sloBurnRateFastThreshold ?? 14.4,
      sloBurnRateSlowThreshold: m.sloBurnRateSlowThreshold ?? 3.0,
    }));
  },
};

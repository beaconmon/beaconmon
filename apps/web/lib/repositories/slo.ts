import { prisma, Prisma } from '@beaconmon/db';
import { clampToPlanRetention } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import type { UpdateSloInput } from '@/lib/validations/slo';

export interface SloConfig {
  sloTarget: number | null;
  sloWindowDays: number | null;
  sloBurnRateFastThreshold: number | null;
  sloBurnRateSlowThreshold: number | null;
}

export interface SloData {
  config: SloConfig;
  metrics: {
    uptimePercent: number;
    errorBudgetTotalMinutes: number;
    errorBudgetRemainingMinutes: number;
    errorBudgetConsumedPercent: number;
    burnRate: number;
    totalChecks: number;
    failedChecks: number;
  } | null;
}

interface AggRow {
  total: bigint;
  failures: bigint;
}

export const sloRepository = {
  async getSloData(
    teamId: string,
    monitorId: string,
    plan: PlanTier
  ): Promise<SloData | null> {
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, teamId, deletedAt: null },
      select: {
        id: true,
        sloTarget: true,
        sloWindowDays: true,
        sloBurnRateFastThreshold: true,
        sloBurnRateSlowThreshold: true,
      },
    });

    if (!monitor) return null;

    const config: SloConfig = {
      sloTarget: monitor.sloTarget ? Number(monitor.sloTarget) : null,
      sloWindowDays: monitor.sloWindowDays,
      sloBurnRateFastThreshold: monitor.sloBurnRateFastThreshold,
      sloBurnRateSlowThreshold: monitor.sloBurnRateSlowThreshold,
    };

    if (!config.sloTarget) {
      return { config, metrics: null };
    }

    const windowDays = config.sloWindowDays ?? 30;
    const sloTarget = config.sloTarget;

    // Clamp query window to plan retention limits
    const windowCutoff = new Date();
    windowCutoff.setUTCDate(windowCutoff.getUTCDate() - windowDays);
    windowCutoff.setUTCHours(0, 0, 0, 0);
    const cutoff = clampToPlanRetention(windowCutoff, plan);

    const rows = await prisma.$queryRaw<AggRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE success = false)::bigint AS failures
      FROM check_results
      WHERE monitor_id = ${monitorId}
        AND checked_at >= ${cutoff}
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

    const observedErrorRate = totalChecks > 0 ? failedChecks / totalChecks : 0;
    const allowedErrorRate = 1 - sloTarget;
    const burnRate = allowedErrorRate > 0 ? observedErrorRate / allowedErrorRate : 0;

    return {
      config,
      metrics: {
        uptimePercent,
        errorBudgetTotalMinutes,
        errorBudgetRemainingMinutes,
        errorBudgetConsumedPercent,
        burnRate,
        totalChecks,
        failedChecks,
      },
    };
  },

  async updateSlo(
    teamId: string,
    monitorId: string,
    data: UpdateSloInput
  ): Promise<{ count: number }> {
    return prisma.monitor.updateMany({
      where: { id: monitorId, teamId, deletedAt: null },
      data: {
        sloTarget: data.sloTarget,
        sloWindowDays: data.sloWindowDays,
        ...(data.sloBurnRateFastThreshold !== undefined && {
          sloBurnRateFastThreshold: data.sloBurnRateFastThreshold,
        }),
        ...(data.sloBurnRateSlowThreshold !== undefined && {
          sloBurnRateSlowThreshold: data.sloBurnRateSlowThreshold,
        }),
      },
    });
  },

  async countSlosByTeam(teamId: string): Promise<number> {
    return prisma.monitor.count({
      where: {
        teamId,
        deletedAt: null,
        sloTarget: { not: null },
      },
    });
  },
};

import { prisma } from '@beaconmon/db';
import { clampToPlanRetention, type Result, ok, err } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';

export interface PerformanceAlertRow {
  id: string;
  checkedAt: string;
  responseTimeMs: number;
  meanMs: number;
  stdDevMs: number;
  zScore: number;
  notifiedAt: string | null;
  createdAt: string;
}

interface FindOptions {
  from: Date;
  to: Date;
  limit: number;
}

export const performanceAlertRepository = {
  async findByMonitor(
    teamId: string,
    monitorId: string,
    plan: PlanTier,
    options: FindOptions
  ): Promise<Result<PerformanceAlertRow[], string>> {
    const from = clampToPlanRetention(options.from, plan);

    try {
      const monitor = await prisma.monitor.findFirst({
        where: { id: monitorId, teamId, deletedAt: null },
        select: { id: true },
      });

      if (!monitor) return err('monitor_not_found');

      const rows = await prisma.performanceAlert.findMany({
        where: {
          teamId,
          monitorId,
          checkedAt: { gte: from, lte: options.to },
        },
        select: {
          id: true,
          checkedAt: true,
          responseTimeMs: true,
          meanMs: true,
          stdDevMs: true,
          zScore: true,
          notifiedAt: true,
          createdAt: true,
        },
        orderBy: { checkedAt: 'desc' },
        take: options.limit,
      });

      return ok(
        rows.map((r) => ({
          id: r.id,
          checkedAt: r.checkedAt.toISOString(),
          responseTimeMs: r.responseTimeMs,
          meanMs: r.meanMs,
          stdDevMs: r.stdDevMs,
          zScore: r.zScore,
          notifiedAt: r.notifiedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
        }))
      );
    } catch (e) {
      return err(e instanceof Error ? e.message : 'unknown_error');
    }
  },
};

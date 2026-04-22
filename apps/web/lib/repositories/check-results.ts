import { prisma } from '@beaconmon/db';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';

interface CheckResultsOptions {
  from: Date;
  to: Date;
  limit: number;
}

export const checkResultRepository = {
  async findByMonitor(
    teamId: string,
    monitorId: string,
    plan: PlanTier,
    options: CheckResultsOptions
  ) {
    // Clamp `from` to the plan's retention window — never expose data beyond plan limits.
    const retentionDays = PLAN_LIMITS[plan].historyDays;
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - retentionDays);

    const from = options.from < retentionCutoff ? retentionCutoff : options.from;

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
      },
      orderBy: { checkedAt: 'desc' },
      take: options.limit,
    });
  },
};

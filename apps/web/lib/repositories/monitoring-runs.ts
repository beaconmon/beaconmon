import { prisma } from '@beaconmon/db';

export interface ReliabilityStats {
  totalRuns: number;
  successRuns: number;
  successRate: number;
  windowStart: Date;
  windowEnd: Date;
}

export const monitoringRunRepository = {
  async reliability30d(teamId: string): Promise<ReliabilityStats> {
    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalRuns, successRuns] = await Promise.all([
      prisma.monitoringRun.count({
        where: { teamId, finishedAt: { gte: windowStart, lte: windowEnd } },
      }),
      prisma.monitoringRun.count({
        where: { teamId, status: 'success', finishedAt: { gte: windowStart, lte: windowEnd } },
      }),
    ]);

    return {
      totalRuns,
      successRuns,
      successRate: totalRuns === 0 ? 100 : (successRuns / totalRuns) * 100,
      windowStart,
      windowEnd,
    };
  },
};

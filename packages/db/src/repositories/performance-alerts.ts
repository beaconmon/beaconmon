import { prisma } from '../index.js';

export interface CreatePerformanceAlertData {
  id: string;
  teamId: string;
  monitorId: string;
  checkedAt: Date;
  responseTimeMs: number;
  meanMs: number;
  stdDevMs: number;
  zScore: number;
}

export const performanceAlertRepository = {
  async create(data: CreatePerformanceAlertData): Promise<void> {
    await prisma.performanceAlert.create({
      data: {
        id: data.id,
        teamId: data.teamId,
        monitorId: data.monitorId,
        checkedAt: data.checkedAt,
        responseTimeMs: data.responseTimeMs,
        meanMs: data.meanMs,
        stdDevMs: data.stdDevMs,
        zScore: data.zScore,
      },
    });
  },

  /** Mark an alert as notified (idempotency: skip re-sending within 30 minutes) */
  async markNotified(id: string, notifiedAt: Date): Promise<void> {
    await prisma.performanceAlert.update({
      where: { id },
      data: { notifiedAt },
    });
  },

  /**
   * Returns the most recent performance alert for this monitor that was notified,
   * used for the 30-minute cooldown check.
   */
  async findLastNotified(monitorId: string): Promise<{ notifiedAt: Date | null } | null> {
    return prisma.performanceAlert.findFirst({
      where: { monitorId, notifiedAt: { not: null } },
      orderBy: { notifiedAt: 'desc' },
      select: { notifiedAt: true },
    });
  },

  /**
   * Fetch the last N response times for a monitor (for Z-score computation).
   * Only returns successful checks with non-null response times.
   */
  async getRecentResponseTimes(
    monitorId: string,
    since: Date
  ): Promise<number[]> {
    const rows = await prisma.$queryRaw<{ response_time_ms: number }[]>`
      SELECT response_time_ms
      FROM check_results
      WHERE monitor_id = ${monitorId}
        AND checked_at >= ${since}
        AND success = true
        AND response_time_ms IS NOT NULL
      ORDER BY checked_at DESC
    `;
    return rows.map((r) => r.response_time_ms);
  },
};

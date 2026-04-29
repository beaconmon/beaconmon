import { prisma } from '../index.js';

export const deployEventRepository = {
  /**
   * Check if a monitor has an active deploy event right now.
   * Active = started_at <= now AND (ended_at IS NULL OR ended_at >= now) AND suppress_alerts = true.
   * Used by the alert worker to suppress alerts during deploys.
   */
  async hasActiveDeployWithSuppression(monitorId: string): Promise<boolean> {
    const now = new Date();
    const count = await prisma.deployEvent.count({
      where: {
        monitorId,
        suppressAlerts: true,
        startedAt: { lte: now },
        OR: [
          { endedAt: null },
          { endedAt: { gte: now } },
        ],
      },
    });
    return count > 0;
  },

  /**
   * Auto-expire deploy events older than `maxMinutes` that were never ended.
   * Called by the scheduler as a safety net.
   */
  async expireStaleDeployEvents(maxMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - maxMinutes * 60 * 1000);
    const result = await prisma.deployEvent.updateMany({
      where: {
        endedAt: null,
        startedAt: { lt: cutoff },
      },
      data: {
        endedAt: cutoff,
      },
    });
    return result.count;
  },
};

import { prisma } from '../index.js';

export interface ContentSnapshotRecord {
  id: string;
  monitorId: string;
  content: string;
  capturedAt: Date;
  diffSummary: string | null;
}

export const contentSnapshotWorkerRepository = {
  /**
   * Record a new snapshot for a content monitor and update the monitor's hot
   * snapshot column atomically. Workers call this on every detected change.
   */
  async recordChange(
    monitorId: string,
    teamId: string,
    content: string,
    capturedAt: Date
  ): Promise<ContentSnapshotRecord> {
    const [snapshot] = await prisma.$transaction([
      prisma.contentSnapshot.create({
        data: { monitorId, teamId, content, capturedAt },
        select: {
          id: true,
          monitorId: true,
          content: true,
          capturedAt: true,
          diffSummary: true,
        },
      }),
      prisma.monitor.update({
        where: { id: monitorId },
        data: { contentSnapshot: content, contentLastChangedAt: capturedAt },
        select: { id: true },
      }),
    ]);

    return snapshot;
  },

  /**
   * Delete snapshots beyond the retention limit per monitor.
   * Keeps the latest `keepCount` snapshots and drops the rest.
   * Returns the number of rows deleted.
   */
  async pruneToLimit(monitorId: string, keepCount: number): Promise<number> {
    if (keepCount < 0) return 0;

    const survivors = await prisma.contentSnapshot.findMany({
      where: { monitorId },
      select: { id: true },
      orderBy: { capturedAt: 'desc' },
      take: keepCount,
    });

    if (survivors.length === 0) {
      // No survivors == nothing to keep; only delete if there is anything at all.
      const result = await prisma.contentSnapshot.deleteMany({ where: { monitorId } });
      return result.count;
    }

    const result = await prisma.contentSnapshot.deleteMany({
      where: {
        monitorId,
        id: { notIn: survivors.map((s) => s.id) },
      },
    });
    return result.count;
  },

  /**
   * Returns all monitors that have any content snapshots stored, paired with the
   * effective plan (free/pro/business) so the scheduler can prune per-team limits.
   * `Team` plan is returned raw — caller resolves trial expiry to an effective tier.
   */
  async findContentMonitorsWithTeamPlan(): Promise<
    Array<{
      monitorId: string;
      teamId: string;
      plan: string;
      trialEndsAt: Date | null;
      subscriptionStatus: string | null;
    }>
  > {
    const rows = await prisma.monitor.findMany({
      where: {
        type: 'content',
        deletedAt: null,
      },
      select: {
        id: true,
        teamId: true,
        team: {
          select: {
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    return rows.map((r) => ({
      monitorId: r.id,
      teamId: r.teamId,
      plan: r.team.plan,
      trialEndsAt: r.team.trialEndsAt,
      subscriptionStatus: r.team.subscription?.status ?? null,
    }));
  },
};

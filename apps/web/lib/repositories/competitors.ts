import { prisma } from '@beaconmon/db';

export interface CompetitorFeedItem {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  snapshotId: string;
  capturedAt: Date;
}

export const competitorRepository = {
  async countActive(teamId: string): Promise<number> {
    return prisma.monitor.count({
      where: { teamId, isCompetitor: true, isActive: true, deletedAt: null },
    });
  },

  async findFeed(
    teamId: string,
    opts: { limit: number; before?: Date }
  ): Promise<CompetitorFeedItem[]> {
    const rows = await prisma.contentSnapshot.findMany({
      where: {
        teamId,
        monitor: { isCompetitor: true, deletedAt: null },
        ...(opts.before ? { capturedAt: { lt: opts.before } } : {}),
      },
      select: {
        id: true,
        monitorId: true,
        capturedAt: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { capturedAt: 'desc' },
      take: opts.limit,
    });

    return rows.map((r) => ({
      monitorId: r.monitorId,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
      snapshotId: r.id,
      capturedAt: r.capturedAt,
    }));
  },
};

import { prisma } from '@beaconmon/db';

export interface CompetitorFeedItem {
  competitorPageId: string;
  competitorName: string;
  pageUrl: string;
  snapshotId: string;
  capturedAt: Date;
}

export const competitorRepository = {
  async countActive(teamId: string): Promise<number> {
    return prisma.competitor.count({
      where: { teamId, isActive: true },
    });
  },

  async findFeed(
    teamId: string,
    opts: { limit: number; before?: Date }
  ): Promise<CompetitorFeedItem[]> {
    const rows = await prisma.contentSnapshot.findMany({
      where: {
        teamId,
        competitorPageId: { not: null },
        ...(opts.before ? { capturedAt: { lt: opts.before } } : {}),
      },
      select: {
        id: true,
        competitorPageId: true,
        capturedAt: true,
        competitorPage: { select: { url: true, competitor: { select: { name: true } } } },
      },
      orderBy: { capturedAt: 'desc' },
      take: opts.limit,
    });

    return rows.map((r) => ({
      competitorPageId: r.competitorPageId!,
      competitorName: r.competitorPage!.competitor.name,
      pageUrl: r.competitorPage!.url,
      snapshotId: r.id,
      capturedAt: r.capturedAt,
    }));
  },
};

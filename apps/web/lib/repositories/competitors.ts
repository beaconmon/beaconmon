import { prisma } from '@beaconmon/db';
import { NotFoundError } from '@/lib/api/errors';

export interface CompetitorFeedItem {
  competitorPageId: string;
  competitorName: string;
  pageUrl: string;
  snapshotId: string;
  capturedAt: Date;
}

export interface CompetitorListItem {
  id: string;
  name: string;
  domain: string;
  platform: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CompetitorRow {
  id: string;
  teamId: string;
  name: string;
  domain: string;
  platform: string;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorEventRow {
  id: string;
  teamId: string;
  competitorId: string;
  productId: string | null;
  pageId: string | null;
  type: string;
  payload: unknown;
  detectedAt: Date;
  createdAt: Date;
}

export interface CompetitorProductRow {
  id: string;
  competitorId: string;
  teamId: string;
  shopifyProductId: string;
  title: string;
  handle: string;
  sku: string | null;
  gtin: string | null;
  vendor: string | null;
  productType: string | null;
  isAvailable: boolean;
  variants: unknown;
  currentPrice: unknown;
  compareAtPrice: unknown;
  currency: string;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorPageRow {
  id: string;
  competitorId: string;
  teamId: string;
  label: string;
  url: string;
  selector: string | null;
  intervalSeconds: number;
  isActive: boolean;
  lastSnapshotHash: string | null;
  lastCheckedAt: Date | null;
  nextCheckAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorChannelRow {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

async function assertOwnership(teamId: string, competitorId: string): Promise<void> {
  const row = await prisma.competitor.findFirst({
    where: { id: competitorId, teamId, deletedAt: null },
    select: { id: true },
  });
  if (!row) throw new NotFoundError();
}

export const competitorRepository = {
  async countActive(teamId: string): Promise<number> {
    return prisma.competitor.count({
      where: { teamId, isActive: true, deletedAt: null },
    });
  },

  async findAll(teamId: string): Promise<CompetitorListItem[]> {
    return prisma.competitor.findMany({
      where: { teamId, deletedAt: null },
      select: { id: true, name: true, domain: true, platform: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  },

  async findById(teamId: string, id: string): Promise<CompetitorRow | null> {
    return prisma.competitor.findFirst({
      where: { id, teamId, deletedAt: null },
    });
  },

  async create(
    teamId: string,
    data: { name: string; url: string; platform: string }
  ): Promise<CompetitorRow> {
    const domain = new URL(data.url).hostname;
    return prisma.competitor.create({
      data: {
        teamId,
        name: data.name,
        domain,
        platform: data.platform,
        pages: {
          create: { teamId, label: data.name, url: data.url },
        },
      },
    });
  },

  async update(
    teamId: string,
    id: string,
    data: Partial<{ name: string; platform: string }>
  ): Promise<CompetitorRow | null> {
    const result = await prisma.competitor.updateMany({
      where: { id, teamId, deletedAt: null },
      data,
    });
    if (result.count === 0) return null;
    return prisma.competitor.findFirst({ where: { id, teamId, deletedAt: null } });
  },

  async softDelete(teamId: string, id: string): Promise<boolean> {
    const result = await prisma.competitor.updateMany({
      where: { id, teamId },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  },

  async findEvents(
    teamId: string,
    competitorId: string,
    opts: { limit: number; before?: string }
  ): Promise<{ events: CompetitorEventRow[]; nextCursor: string | null }> {
    await assertOwnership(teamId, competitorId);
    const rows = await prisma.competitorEvent.findMany({
      where: {
        teamId,
        competitorId,
        ...(opts.before ? { detectedAt: { lt: new Date(opts.before) } } : {}),
      },
      orderBy: { detectedAt: 'desc' },
      take: opts.limit + 1,
    });
    const hasMore = rows.length > opts.limit;
    const events = rows.slice(0, opts.limit);
    const lastEvent = events[events.length - 1];
    return {
      events,
      nextCursor: hasMore && lastEvent ? lastEvent.detectedAt.toISOString() : null,
    };
  },

  async findProducts(teamId: string, competitorId: string): Promise<CompetitorProductRow[]> {
    await assertOwnership(teamId, competitorId);
    return prisma.competitorProduct.findMany({
      where: { teamId, competitorId },
      orderBy: { title: 'asc' },
    });
  },

  async findPages(teamId: string, competitorId: string): Promise<CompetitorPageRow[]> {
    await assertOwnership(teamId, competitorId);
    return prisma.competitorPage.findMany({
      where: { teamId, competitorId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async addPage(
    teamId: string,
    competitorId: string,
    data: { label: string; url: string; selector?: string; intervalSeconds?: number }
  ): Promise<CompetitorPageRow> {
    await assertOwnership(teamId, competitorId);
    return prisma.competitorPage.create({
      data: {
        competitorId,
        teamId,
        label: data.label,
        url: data.url,
        selector: data.selector,
        ...(data.intervalSeconds !== undefined ? { intervalSeconds: data.intervalSeconds } : {}),
      },
    });
  },

  async findChannels(teamId: string, competitorId: string): Promise<CompetitorChannelRow[]> {
    await assertOwnership(teamId, competitorId);
    const rows = await prisma.competitorNotificationChannel.findMany({
      where: { competitorId, teamId },
      include: {
        channel: { select: { id: true, name: true, type: true, isActive: true } },
      },
    });
    return rows.map((r) => r.channel);
  },

  async addChannel(teamId: string, competitorId: string, channelId: string): Promise<void> {
    await assertOwnership(teamId, competitorId);
    const channel = await prisma.alertChannel.findFirst({
      where: { id: channelId, teamId },
      select: { id: true },
    });
    if (!channel) throw new NotFoundError();
    await prisma.competitorNotificationChannel.create({
      data: { competitorId, channelId, teamId },
    });
  },

  async removeChannel(teamId: string, competitorId: string, channelId: string): Promise<void> {
    await assertOwnership(teamId, competitorId);
    await prisma.competitorNotificationChannel.deleteMany({
      where: { competitorId, channelId, teamId },
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

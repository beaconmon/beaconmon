import { prisma } from '@beaconmon/db';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

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
  dataTier: string;
  discoveryState: string;
  isActive: boolean;
  createdAt: Date;
}

export type DiscoveryState = 'pending' | 'syncing' | 'ready' | 'failed' | 'not_applicable';

export interface CompetitorRow {
  id: string;
  teamId: string;
  name: string;
  domain: string;
  platform: string;
  discoveryState: DiscoveryState;
  discoverySyncedAt: Date | null;
  discoveryError: string | null;
  dataTier: string;
  sitemapUrl: string | null;
  trackedProductUrls: unknown;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorDecisionRow {
  id: string;
  eventId: string;
  response: string;
  note: string | null;
  decidedBy: string;
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
  decision?: CompetitorDecisionRow | null;
}

export interface CompetitorProductRow {
  id: string;
  competitorId: string;
  teamId: string;
  externalId: string;
  source: string;
  sourceUrl: string | null;
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
  consecutiveFailures: number;
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

export interface CompetitorProductExportRow extends CompetitorProductRow {
  competitorName: string;
  competitorDomain: string;
}

export interface CompetitorEventExportRow {
  id: string;
  type: string;
  payload: unknown;
  detectedAt: Date;
  productTitle: string | null;
}

async function updateDiscoveryState(
  teamId: string,
  competitorId: string,
  patch: { discoveryState: DiscoveryState; discoverySyncedAt?: Date | null; discoveryError?: string | null }
): Promise<boolean> {
  const result = await prisma.competitor.updateMany({
    where: { id: competitorId, teamId, deletedAt: null },
    data: patch,
  });
  return result.count > 0;
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
      select: { id: true, name: true, domain: true, platform: true, dataTier: true, discoveryState: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  },

  async findById(teamId: string, id: string): Promise<CompetitorRow | null> {
    const row = await prisma.competitor.findFirst({
      where: { id, teamId, deletedAt: null },
    });
    return row as CompetitorRow | null;
  },

  async create(
    teamId: string,
    data: { name: string; url: string; platform: string }
  ): Promise<CompetitorRow> {
    const domain = new URL(data.url).hostname;
    const row = await prisma.competitor.create({
      data: {
        teamId,
        name: data.name,
        domain,
        platform: data.platform,
        // Non-Shopify competitors start limited; the worker's probe ladder upgrades them
        dataTier: data.platform === 'shopify' ? 'full_catalog' : 'limited',
        pages: {
          create: { teamId, label: data.name, url: data.url },
        },
      },
    });
    return row as CompetitorRow;
  },

  async update(
    teamId: string,
    id: string,
    data: Partial<{ name: string; platform: string; trackedProductUrls: string[] }>
  ): Promise<CompetitorRow | null> {
    const result = await prisma.competitor.updateMany({
      where: { id, teamId, deletedAt: null },
      data,
    });
    if (result.count === 0) return null;
    const row = await prisma.competitor.findFirst({ where: { id, teamId, deletedAt: null } });
    return row as CompetitorRow | null;
  },

  updateDiscoveryState,

  async softDelete(teamId: string, id: string): Promise<boolean> {
    // Also clear isActive and deactivate child pages: the scheduler's due-page
    // and Shopify feed queries key off isActive, so deletedAt alone would keep
    // the backend checking and syncing a deleted competitor forever.
    const [result] = await prisma.$transaction([
      prisma.competitor.updateMany({
        where: { id, teamId, deletedAt: null },
        data: { deletedAt: new Date(), isActive: false },
      }),
      prisma.competitorPage.updateMany({
        where: { competitorId: id, teamId },
        data: { isActive: false },
      }),
    ]);
    return result.count > 0;
  },

  async findEvents(
    teamId: string,
    competitorId: string,
    opts: { limit: number; before?: string }
  ): Promise<{ events: CompetitorEventRow[]; nextCursor: string | null }> {
    await assertOwnership(teamId, competitorId);

    let beforeFilter: object = {};
    if (opts.before) {
      const pipeIdx = opts.before.indexOf('|');
      if (pipeIdx !== -1) {
        const beforeDate = new Date(opts.before.slice(0, pipeIdx));
        if (Number.isNaN(beforeDate.getTime())) throw new ValidationError('Invalid before cursor');
        const beforeId = opts.before.slice(pipeIdx + 1);
        beforeFilter = {
          OR: [
            { detectedAt: { lt: beforeDate } },
            { detectedAt: { equals: beforeDate }, id: { lt: beforeId } },
          ],
        };
      } else {
        const beforeDate = new Date(opts.before);
        if (Number.isNaN(beforeDate.getTime())) throw new ValidationError('Invalid before cursor');
        beforeFilter = { detectedAt: { lt: beforeDate } };
      }
    }

    const rows = await prisma.competitorEvent.findMany({
      where: { teamId, competitorId, ...beforeFilter },
      orderBy: [{ detectedAt: 'desc' }, { id: 'desc' }],
      take: opts.limit + 1,
      include: { decision: true },
    });
    const hasMore = rows.length > opts.limit;
    const events = rows.slice(0, opts.limit);
    const lastEvent = events[events.length - 1];
    return {
      events,
      nextCursor: hasMore && lastEvent ? `${lastEvent.detectedAt.toISOString()}|${lastEvent.id}` : null,
    };
  },

  async upsertDecision(
    teamId: string,
    eventId: string,
    response: string,
    note: string | undefined,
    decidedBy: string
  ): Promise<CompetitorDecisionRow> {
    return prisma.competitorDecision.upsert({
      where: { eventId },
      create: { teamId, eventId, response, note: note ?? null, decidedBy },
      update: { response, note: note ?? null, decidedBy },
    });
  },

  async deleteDecision(teamId: string, eventId: string): Promise<void> {
    await prisma.competitorDecision.deleteMany({ where: { eventId, teamId } });
  },

  async findProducts(teamId: string, competitorId: string): Promise<CompetitorProductRow[]> {
    await assertOwnership(teamId, competitorId);
    return prisma.competitorProduct.findMany({
      where: { teamId, competitorId },
      orderBy: { title: 'asc' },
      take: 25_001,
    });
  },

  async countActivePages(teamId: string, competitorId: string): Promise<number> {
    await assertOwnership(teamId, competitorId);
    return prisma.competitorPage.count({
      where: { teamId, competitorId, isActive: true },
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
    await prisma.competitorNotificationChannel.upsert({
      where: { competitorId_channelId: { competitorId, channelId } },
      create: { competitorId, channelId, teamId },
      update: {},
    });
  },

  async removeChannel(teamId: string, competitorId: string, channelId: string): Promise<void> {
    await assertOwnership(teamId, competitorId);
    await prisma.competitorNotificationChannel.deleteMany({
      where: { competitorId, channelId, teamId },
    });
  },

  async findEventsForExport(
    teamId: string,
    competitorId: string,
    opts: { days: number; types?: string[] }
  ): Promise<CompetitorEventExportRow[]> {
    await assertOwnership(teamId, competitorId);
    const since = new Date(Date.now() - opts.days * 24 * 60 * 60 * 1000);
    const rows = await prisma.competitorEvent.findMany({
      where: {
        teamId,
        competitorId,
        detectedAt: { gte: since },
        ...(opts.types && opts.types.length > 0 ? { type: { in: opts.types } } : {}),
      },
      orderBy: [{ detectedAt: 'desc' }, { id: 'desc' }],
      take: 25_001,
      select: {
        id: true,
        type: true,
        payload: true,
        detectedAt: true,
        product: { select: { title: true } },
      },
    });
    return rows.map((r) => ({ ...r, productTitle: r.product?.title ?? null }));
  },

  async findLatestPriceEventsByProduct(
    teamId: string,
    competitorId?: string
  ): Promise<Map<string, unknown>> {
    const rows = await prisma.competitorEvent.findMany({
      where: {
        teamId,
        type: 'price_changed',
        productId: { not: null },
        ...(competitorId ? { competitorId } : {}),
      },
      orderBy: [{ productId: 'asc' }, { detectedAt: 'desc' }, { id: 'desc' }],
      distinct: ['productId'],
      select: { productId: true, payload: true },
      take: 25_001,
    });
    const map = new Map<string, unknown>();
    for (const row of rows) {
      if (row.productId) {
        map.set(row.productId, (row.payload as Record<string, unknown>).oldPrice ?? null);
      }
    }
    return map;
  },

  async findAllProductsForExport(teamId: string): Promise<CompetitorProductExportRow[]> {
    const rows = await prisma.competitorProduct.findMany({
      where: { teamId, competitor: { deletedAt: null } },
      orderBy: [{ competitorId: 'asc' }, { title: 'asc' }],
      include: { competitor: { select: { name: true, domain: true } } },
      take: 25_001,
    });
    return rows.map((r) => ({
      ...(r as unknown as CompetitorProductRow),
      competitorName: r.competitor.name,
      competitorDomain: r.competitor.domain,
    }));
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

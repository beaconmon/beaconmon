import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { CompetitorNotifyJob } from '@beaconmon/queue';

vi.mock('@beaconmon/db', () => ({
  prisma: {
    competitorNotificationChannel: { count: vi.fn().mockResolvedValue(0) },
  },
  competitorProductRepository: {
    findByCompetitorId: vi.fn(),
    upsertProduct: vi.fn().mockResolvedValue('product-id'),
    markUnavailable: vi.fn(),
  },
  competitorEventRepository: {
    createEvent: vi.fn().mockResolvedValue({ id: 'event-id' }),
  },
  getCompetitorSyncInfo: vi.fn(),
  updateCompetitorDiscoveryState: vi.fn(),
  updateCompetitorTier: vi.fn(),
}));

vi.mock('./lib/polite-fetch.js', () => ({
  fetchWithRetry: vi.fn(),
  validateCompetitorDomain: vi.fn(),
  assertUrlOnDomain: vi.fn(),
  politeJitter: vi.fn(),
  isBlockedStatus: vi.fn().mockReturnValue(false),
}));

vi.mock('./lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('./lib/sitemap-discovery.js', () => ({
  probeCompetitor: vi.fn(),
  discoverProductUrls: vi.fn(),
  MAX_TRACKED_URLS: 100,
  AUTO_SELECT_URLS: 20,
}));

vi.mock('./lib/extract-jsonld.js', () => ({
  extractProductFromHtml: vi.fn(),
}));

const mockProduct = {
  id: 1,
  title: 'Air Max 2024',
  handle: 'air-max-2024',
  vendor: 'Nike',
  product_type: 'shoes',
  variants: [{ id: 101, price: '100.00', compare_at_price: null, available: true, sku: 'AM2024', title: 'Default' }],
};

function makeFeedResponse(products: unknown[]) {
  return {
    ok: true,
    json: async () => ({ products }),
    headers: { get: () => null },
  };
}

function existingProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'existing-id',
    externalId: '1',
    source: 'shopify_feed',
    sourceUrl: null,
    handle: 'air-max-2024',
    title: 'Air Max 2024',
    isAvailable: true,
    currentPrice: '100.00',
    compareAtPrice: null,
    currency: 'USD',
    lastSeenAt: new Date(),
    variants: [],
    ...overrides,
  };
}

describe('processCatalogSyncJob — stock change', () => {
  let redis: Partial<Redis>;
  let notifyQueue: Partial<Queue<CompetitorNotifyJob>>;
  let competitorEventRepository: { createEvent: ReturnType<typeof vi.fn> };
  let processCatalogSyncJob: (
    data: { competitorId: string; teamId: string; domain: string },
    redis: Redis,
    notifyQueue: Queue<CompetitorNotifyJob>
  ) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    redis = {
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      eval: vi.fn().mockResolvedValue(1),
    } as unknown as Partial<Redis>;
    notifyQueue = { add: vi.fn() };

    const db = await import('@beaconmon/db');
    (db.getCompetitorSyncInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'comp-1',
      teamId: 'team-1',
      domain: 'nike.com',
      platform: 'shopify',
      dataTier: 'full_catalog',
      sitemapUrl: null,
      trackedProductUrls: [],
      discoverySyncedAt: new Date('2026-01-01'),
    });
    competitorEventRepository = db.competitorEventRepository as unknown as { createEvent: ReturnType<typeof vi.fn> };

    const mod = await import('./process-catalog-sync-job.js');
    processCatalogSyncJob = mod.processCatalogSyncJob;
  });

  it('emits out_of_stock without a duplicate stock_changed when product goes unavailable', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      existingProduct({ isAvailable: true }),
    ]);

    const { fetchWithRetry } = await import('./lib/polite-fetch.js');
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeFeedResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: false }] }])
    );

    await processCatalogSyncJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = competitorEventRepository.createEvent.mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).not.toContain('stock_changed');
    expect(types).toContain('out_of_stock');
  });

  it('emits back_in_stock without a duplicate stock_changed when product becomes available', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      existingProduct({ isAvailable: false }),
    ]);

    const { fetchWithRetry } = await import('./lib/polite-fetch.js');
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeFeedResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: true }] }])
    );

    await processCatalogSyncJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = competitorEventRepository.createEvent.mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).not.toContain('stock_changed');
    expect(types).toContain('back_in_stock');
  });

  it('does not emit granular events when availability is unchanged', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      existingProduct({ isAvailable: true }),
    ]);

    const { fetchWithRetry } = await import('./lib/polite-fetch.js');
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeFeedResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: true }] }])
    );

    await processCatalogSyncJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = competitorEventRepository.createEvent.mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).not.toContain('out_of_stock');
    expect(types).not.toContain('back_in_stock');
    expect(types).not.toContain('stock_changed');
  });

  it('enqueues notify exactly once for the granular stock event', async () => {
    const { competitorProductRepository, prisma } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      existingProduct({ isAvailable: true }),
    ]);
    (prisma.competitorNotificationChannel.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    let callIndex = 0;
    (competitorEventRepository.createEvent as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve({ id: `event-${callIndex++}` })
    );

    const { fetchWithRetry } = await import('./lib/polite-fetch.js');
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeFeedResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: false }] }])
    );

    await processCatalogSyncJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    // Should be called exactly once — for the out_of_stock event, not for stock_changed
    expect(notifyQueue.add).toHaveBeenCalledTimes(1);
  });

  it('suppresses events and notifications on the baseline (first) sync', async () => {
    const db = await import('@beaconmon/db');
    (db.getCompetitorSyncInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'comp-1',
      teamId: 'team-1',
      domain: 'nike.com',
      platform: 'shopify',
      dataTier: 'full_catalog',
      sitemapUrl: null,
      trackedProductUrls: [],
      discoverySyncedAt: null,
    });

    const { competitorProductRepository, prisma } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.competitorNotificationChannel.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const { fetchWithRetry } = await import('./lib/polite-fetch.js');
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue(makeFeedResponse([mockProduct]));

    await processCatalogSyncJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    expect(competitorProductRepository.upsertProduct).toHaveBeenCalledTimes(1);
    expect(competitorEventRepository.createEvent).not.toHaveBeenCalled();
    expect(notifyQueue.add).not.toHaveBeenCalled();
  });
});

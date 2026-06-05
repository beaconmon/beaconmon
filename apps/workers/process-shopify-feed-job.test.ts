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
  updateCompetitorDiscoveryState: vi.fn(),
}));

vi.mock('./lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockProduct = {
  id: 1,
  title: 'Air Max 2024',
  handle: 'air-max-2024',
  vendor: 'Nike',
  product_type: 'shoes',
  variants: [{ id: 101, price: '100.00', compare_at_price: null, available: false, sku: 'AM2024', title: 'Default' }],
};

function makeFetchResponse(products: unknown[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ products }),
    headers: { get: () => null },
  });
}

describe('processShopifyFeedJob — stock change', () => {
  let redis: Partial<Redis>;
  let notifyQueue: Partial<Queue<CompetitorNotifyJob>>;
  let competitorEventRepository: { createEvent: ReturnType<typeof vi.fn> };
  let processShopifyFeedJob: (
    data: { competitorId: string; teamId: string; domain: string },
    redis: Redis,
    notifyQueue: Queue<CompetitorNotifyJob>
  ) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    redis = {
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
    };
    notifyQueue = { add: vi.fn() };

    const db = await import('@beaconmon/db');
    competitorEventRepository = db.competitorEventRepository as unknown as { createEvent: ReturnType<typeof vi.fn> };

    const mod = await import('./process-shopify-feed-job.js');
    processShopifyFeedJob = mod.processShopifyFeedJob;
  });

  it('emits stock_changed then out_of_stock when product goes unavailable', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'existing-id',
        shopifyProductId: '1',
        handle: 'air-max-2024',
        title: 'Air Max 2024',
        isAvailable: true,
        currentPrice: '100.00',
        compareAtPrice: null,
        currency: 'USD',
        lastSeenAt: new Date(),
      },
    ]);

    vi.stubGlobal('fetch', makeFetchResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: false }] }]));

    await processShopifyFeedJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = (competitorEventRepository.createEvent as ReturnType<typeof vi.fn>).mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).toContain('stock_changed');
    expect(types).toContain('out_of_stock');
    expect(types.indexOf('stock_changed')).toBeLessThan(types.indexOf('out_of_stock'));
  });

  it('emits stock_changed then back_in_stock when product becomes available', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'existing-id',
        shopifyProductId: '1',
        handle: 'air-max-2024',
        title: 'Air Max 2024',
        isAvailable: false,
        currentPrice: '100.00',
        compareAtPrice: null,
        currency: 'USD',
        lastSeenAt: new Date(),
      },
    ]);

    vi.stubGlobal('fetch', makeFetchResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: true }] }]));

    await processShopifyFeedJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = (competitorEventRepository.createEvent as ReturnType<typeof vi.fn>).mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).toContain('stock_changed');
    expect(types).toContain('back_in_stock');
  });

  it('does not emit granular events when availability is unchanged', async () => {
    const { competitorProductRepository } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'existing-id',
        shopifyProductId: '1',
        handle: 'air-max-2024',
        title: 'Air Max 2024',
        isAvailable: true,
        currentPrice: '100.00',
        compareAtPrice: null,
        currency: 'USD',
        lastSeenAt: new Date(),
      },
    ]);

    vi.stubGlobal('fetch', makeFetchResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: true }] }]));

    await processShopifyFeedJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    const calls = (competitorEventRepository.createEvent as ReturnType<typeof vi.fn>).mock.calls;
    const types = calls.map((c: unknown[]) => (c[0] as { type: string }).type);

    expect(types).not.toContain('out_of_stock');
    expect(types).not.toContain('back_in_stock');
    expect(types).not.toContain('stock_changed');
  });

  it('enqueues notify only for granular event, not stock_changed', async () => {
    const { competitorProductRepository, prisma } = await import('@beaconmon/db');
    (competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'existing-id',
        shopifyProductId: '1',
        handle: 'air-max-2024',
        title: 'Air Max 2024',
        isAvailable: true,
        currentPrice: '100.00',
        compareAtPrice: null,
        currency: 'USD',
        lastSeenAt: new Date(),
      },
    ]);
    (prisma.competitorNotificationChannel.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    let callIndex = 0;
    (competitorEventRepository.createEvent as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve({ id: `event-${callIndex++}` })
    );

    vi.stubGlobal('fetch', makeFetchResponse([{ ...mockProduct, variants: [{ ...mockProduct.variants[0], available: false }] }]));

    await processShopifyFeedJob(
      { competitorId: 'comp-1', teamId: 'team-1', domain: 'nike.com' },
      redis as Redis,
      notifyQueue as Queue<CompetitorNotifyJob>
    );

    // Should be called exactly once — for the out_of_stock event, not for stock_changed
    expect(notifyQueue.add).toHaveBeenCalledTimes(1);
  });
});

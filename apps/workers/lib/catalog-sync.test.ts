import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Queue } from 'bullmq';
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
}));

vi.mock('./logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { competitorProductRepository, competitorEventRepository } from '@beaconmon/db';
import { syncCatalog, isMaterialPriceMove, isNonProductItem, priceEventMinPct } from './catalog-sync.js';
import type { ExtractedProduct } from './catalog-sync.js';

const upsertProduct = competitorProductRepository.upsertProduct as ReturnType<typeof vi.fn>;
const findByCompetitorId = competitorProductRepository.findByCompetitorId as ReturnType<typeof vi.fn>;
const createEvent = competitorEventRepository.createEvent as ReturnType<typeof vi.fn>;

const notifyQueue = { add: vi.fn() } as unknown as Queue<CompetitorNotifyJob>;

function existingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'row-1',
    externalId: 'p1',
    source: 'shopify_feed',
    sourceUrl: null,
    title: 'Widget',
    handle: 'widget',
    isAvailable: true,
    variants: [],
    currentPrice: '100.00',
    compareAtPrice: null,
    currency: 'USD',
    lastSeenAt: new Date(),
    ...overrides,
  };
}

function product(overrides: Partial<ExtractedProduct> = {}): ExtractedProduct {
  return {
    externalId: 'p1',
    title: 'Widget',
    handle: 'widget',
    price: '100.00',
    available: true,
    currency: 'USD',
    ...overrides,
  };
}

function eventTypes(): string[] {
  return createEvent.mock.calls.map((c) => c[0].type);
}

async function run(existing: unknown[], products: ExtractedProduct[]) {
  findByCompetitorId.mockResolvedValue(existing);
  return syncCatalog({
    competitorId: 'c1',
    teamId: 't1',
    source: 'shopify_feed',
    products,
    isBaselineSync: false,
    markMissingUnavailable: false,
    notifyQueue,
  });
}

describe('syncCatalog price/product event gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertProduct.mockResolvedValue('product-id');
    createEvent.mockResolvedValue({ id: 'event-id' });
    delete process.env.PRICE_EVENT_MIN_PCT;
  });

  afterEach(() => {
    delete process.env.PRICE_EVENT_MIN_PCT;
  });

  it('(a) sub-threshold price move does not emit price_changed but still updates the product', async () => {
    // 100.00 -> 100.50 is a 0.5% move, below the 2% default.
    await run([existingRow({ currentPrice: '100.00' })], [product({ price: '100.50' })]);

    expect(upsertProduct).toHaveBeenCalledTimes(1);
    expect(upsertProduct.mock.calls[0]?.[0].currentPrice).toBe('100.50');
    expect(eventTypes()).not.toContain('price_changed');
  });

  it('(b) at/above threshold move emits price_changed', async () => {
    // 100.00 -> 105.00 is a 5% move, above the 2% default.
    await run([existingRow({ currentPrice: '100.00' })], [product({ price: '105.00' })]);

    expect(upsertProduct).toHaveBeenCalledTimes(1);
    expect(eventTypes()).toContain('price_changed');
  });

  it('(c) currency flip with a numeric difference does not emit price_changed', async () => {
    // USD 100.00 -> EUR 92.00 is a large numeric move but a locale artifact.
    await run(
      [existingRow({ currentPrice: '100.00', currency: 'USD' })],
      [product({ price: '92.00', currency: 'EUR' })]
    );

    expect(upsertProduct).toHaveBeenCalledTimes(1);
    expect(upsertProduct.mock.calls[0]?.[0].currency).toBe('EUR');
    expect(eventTypes()).not.toContain('price_changed');
  });

  it('(d) a gift-card new product does not emit product_added but still upserts', async () => {
    await run(
      [],
      [product({ externalId: 'gc1', handle: 'gift-card', title: 'Gift Card', price: '50.00' })]
    );

    expect(upsertProduct).toHaveBeenCalledTimes(1);
    expect(eventTypes()).not.toContain('product_added');
  });

  it('(e) a normal new product still emits product_added', async () => {
    await run([], [product({ externalId: 'new1', handle: 'super-widget', title: 'Super Widget' })]);

    expect(upsertProduct).toHaveBeenCalledTimes(1);
    expect(eventTypes()).toContain('product_added');
  });
});

describe('isMaterialPriceMove', () => {
  it('treats unpriced -> priced as material (old price 0)', () => {
    expect(isMaterialPriceMove('0', '50.00', 0.02)).toBe(true);
  });

  it('treats unparseable old price as material', () => {
    expect(isMaterialPriceMove('abc', '50.00', 0.02)).toBe(true);
  });

  it('rejects a sub-threshold move', () => {
    expect(isMaterialPriceMove('100.00', '100.50', 0.02)).toBe(false);
  });

  it('accepts a move exactly at the threshold', () => {
    expect(isMaterialPriceMove('100.00', '102.00', 0.02)).toBe(true);
  });
});

describe('isNonProductItem', () => {
  it('matches gift cards and samples case-insensitively', () => {
    expect(isNonProductItem(['gift-card', 'Gift Card'])).toBe(true);
    expect(isNonProductItem([undefined, 'Free SAMPLE Pack'])).toBe(true);
    expect(isNonProductItem(['my-product', undefined, 'Digital Download'])).toBe(true);
  });

  it('does not match ordinary products', () => {
    expect(isNonProductItem(['super-widget', 'Super Widget', 'Widgets'])).toBe(false);
  });
});

describe('priceEventMinPct', () => {
  afterEach(() => {
    delete process.env.PRICE_EVENT_MIN_PCT;
  });

  it('defaults to 0.02', () => {
    delete process.env.PRICE_EVENT_MIN_PCT;
    expect(priceEventMinPct()).toBe(0.02);
  });

  it('reads a valid override from the env var', () => {
    process.env.PRICE_EVENT_MIN_PCT = '0.1';
    expect(priceEventMinPct()).toBe(0.1);
  });

  it('falls back to the default on a bad value', () => {
    process.env.PRICE_EVENT_MIN_PCT = 'nonsense';
    expect(priceEventMinPct()).toBe(0.02);
  });
});

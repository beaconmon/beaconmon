import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildSnapshot } from './snapshot';

function variant(overrides: Partial<{ price: string; compare_at_price: string | null; available: boolean }> = {}) {
  return {
    id: 1,
    price: '50.00',
    compare_at_price: null as string | null,
    available: true,
    sku: 'SKU',
    title: 'Default',
    ...overrides,
  };
}

function product(id: number, variants: ReturnType<typeof variant>[]) {
  return { id, title: `Product ${id}`, handle: `product-${id}`, vendor: 'Acme', product_type: 'widget', variants };
}

/** Mock global fetch: products.json returns the given products on page 1 and an
 * empty page after; meta.json returns the currency. */
function mockStorefront(products: unknown[], currency = 'USD') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/meta.json')) {
        return { ok: true, json: async () => ({ currency }) } as unknown as Response;
      }
      if (url.includes('page=1')) {
        return { ok: true, json: async () => ({ products }) } as unknown as Response;
      }
      return { ok: true, json: async () => ({ products: [] }) } as unknown as Response;
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildSnapshot', () => {
  it('summarizes a Shopify catalog with currency and counts', async () => {
    mockStorefront([product(1, [variant()]), product(2, [variant({ available: false })])], 'GBP');

    const result = await buildSnapshot('shop.example');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.platform).toBe('shopify');
    expect(result.snapshot.currency).toBe('GBP');
    expect(result.snapshot.productCount).toBe(2);
    expect(result.snapshot.availableCount).toBe(1);
    expect(result.snapshot.countIsFloor).toBe(false);
    expect(result.snapshot.sample[0]?.url).toBe('https://shop.example/products/product-1');
  });

  it('flags on-sale products when compare-at price exceeds price', async () => {
    mockStorefront([
      product(1, [variant({ price: '30.00', compare_at_price: '50.00' })]),
      product(2, [variant({ price: '20.00', compare_at_price: null })]),
    ]);

    const result = await buildSnapshot('shop.example');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.onSaleCount).toBe(1);
    expect(result.snapshot.onSale[0]?.handle).toBe('product-1');
    expect(result.snapshot.onSale[0]?.onSale).toBe(true);
  });

  it('uses the lowest-priced variant as the representative price', async () => {
    mockStorefront([
      product(1, [variant({ price: '90.00' }), variant({ price: '40.00', compare_at_price: '60.00' })]),
    ]);

    const result = await buildSnapshot('shop.example');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.sample[0]?.price).toBe('40.00');
    expect(result.snapshot.onSaleCount).toBe(1);
  });

  it('returns not_shopify when products.json is blocked on the first page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403 }) as unknown as Response)
    );

    const result = await buildSnapshot('shop.example');
    expect(result).toEqual({ ok: false, reason: 'not_shopify' });
  });

  it('returns unreachable when the network fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    const result = await buildSnapshot('shop.example');
    expect(result).toEqual({ ok: false, reason: 'unreachable' });
  });
});

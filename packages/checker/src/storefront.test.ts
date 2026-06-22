import { describe, it, expect, vi } from 'vitest';
import {
  fetchShopifyCatalog,
  fetchStoreCurrency,
  FeedUnusableError,
  FEED_NETWORK_ERROR_STATUS,
  PRODUCTS_PER_PAGE,
} from './storefront.js';
import type { ShopifyProduct } from './storefront.js';

function makeProduct(id: number): ShopifyProduct {
  return {
    id,
    title: `Product ${id}`,
    handle: `product-${id}`,
    vendor: 'Acme',
    product_type: 'widget',
    variants: [{ id: id * 10, price: '9.99', compare_at_price: null, available: true, sku: `SKU${id}`, title: 'Default' }],
  };
}

function okJson(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

const noJitter = () => Promise.resolve();

describe('fetchShopifyCatalog', () => {
  it('returns a single short page without paginating further', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue(okJson({ products: [makeProduct(1)] }));
    const result = await fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter });

    expect(result.partial).toBe(false);
    expect(result.products).toHaveLength(1);
    expect(fetchWithRetry).toHaveBeenCalledTimes(1);
    expect(fetchWithRetry).toHaveBeenCalledWith('https://shop.example/products.json?limit=250&page=1');
  });

  it('paginates until a page shorter than the limit', async () => {
    const fullPage = { products: Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => makeProduct(i + 1)) };
    const shortPage = { products: [makeProduct(9999)] };
    const fetchWithRetry = vi
      .fn()
      .mockResolvedValueOnce(okJson(fullPage))
      .mockResolvedValueOnce(okJson(shortPage));

    const result = await fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter });

    expect(result.partial).toBe(false);
    expect(result.products).toHaveLength(PRODUCTS_PER_PAGE + 1);
    expect(fetchWithRetry).toHaveBeenCalledTimes(2);
  });

  it('stops at the maxPages cap when every page is full', async () => {
    const fullPage = { products: Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => makeProduct(i + 1)) };
    const fetchWithRetry = vi.fn().mockResolvedValue(okJson(fullPage));

    const result = await fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter }, { maxPages: 2 });

    expect(fetchWithRetry).toHaveBeenCalledTimes(2);
    expect(result.products).toHaveLength(PRODUCTS_PER_PAGE * 2);
  });

  it('throws FeedUnusableError with the status when page 1 is not ok', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue({ ok: false, status: 403 } as unknown as Response);
    await expect(fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter })).rejects.toMatchObject({
      name: 'FeedUnusableError',
      status: 403,
    });
  });

  it('throws FeedUnusableError with the network sentinel when page 1 fetch rejects', async () => {
    const fetchWithRetry = vi.fn().mockRejectedValue(new Error('redirect count exceeded'));
    await expect(
      fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter })
    ).rejects.toMatchObject({ status: FEED_NETWORK_ERROR_STATUS });
  });

  it('throws FeedUnusableError when page 1 returns non-JSON', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response);
    await expect(fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter })).rejects.toBeInstanceOf(
      FeedUnusableError
    );
  });

  it('returns a partial result when a mid-pagination page errors', async () => {
    const fullPage = { products: Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => makeProduct(i + 1)) };
    const fetchWithRetry = vi
      .fn()
      .mockResolvedValueOnce(okJson(fullPage))
      .mockResolvedValueOnce({ ok: false, status: 500 } as unknown as Response);

    const result = await fetchShopifyCatalog('shop.example', { fetchWithRetry, politeJitter: noJitter });

    expect(result.partial).toBe(true);
    expect(result.products).toHaveLength(PRODUCTS_PER_PAGE);
  });
});

describe('fetchStoreCurrency', () => {
  it('returns the currency from meta.json when valid', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue(okJson({ currency: 'GBP' }));
    await expect(fetchStoreCurrency('shop.example', { fetchWithRetry })).resolves.toBe('GBP');
    expect(fetchWithRetry).toHaveBeenCalledWith('https://shop.example/meta.json', { maxAttempts: 2, timeoutMs: 10_000 });
  });

  it('falls back to USD on a malformed currency value', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue(okJson({ currency: 'pounds' }));
    await expect(fetchStoreCurrency('shop.example', { fetchWithRetry })).resolves.toBe('USD');
  });

  it('falls back to USD when meta.json is not ok', async () => {
    const fetchWithRetry = vi.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response);
    await expect(fetchStoreCurrency('shop.example', { fetchWithRetry })).resolves.toBe('USD');
  });

  it('falls back to USD when the fetch throws', async () => {
    const fetchWithRetry = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(fetchStoreCurrency('shop.example', { fetchWithRetry })).resolves.toBe('USD');
  });
});

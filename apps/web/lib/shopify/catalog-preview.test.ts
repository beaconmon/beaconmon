import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/discovery/ssrf-guard', () => ({
  isHostnameSafe: vi.fn().mockResolvedValue({ allowed: true }),
}));

import { fetchCatalogPreview, fetchCatalogPreviews } from './catalog-preview';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';

const now = new Date('2024-06-15T12:00:00Z').getTime();

function daysAgo(n: number): string {
  return new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
}

function mockFetch(pages: Array<Array<{ updated_at: string }>>) {
  let call = 0;
  global.fetch = vi.fn().mockImplementation(() => {
    const products = pages[call] ?? [];
    call++;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ products }),
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

describe('fetchCatalogPreview', () => {
  it('counts products and 30d changes from a single page', async () => {
    mockFetch([
      [
        { updated_at: daysAgo(5) },
        { updated_at: daysAgo(20) },
        { updated_at: daysAgo(35) },
        { updated_at: daysAgo(60) },
      ],
    ]);

    const result = await fetchCatalogPreview('example.com');
    expect(result.productCount).toBe(4);
    expect(result.recentChanges30d).toBe(2);
    expect(result.error).toBeUndefined();
  });

  it('paginates up to 4 pages', async () => {
    const fullPage = Array.from({ length: 250 }, () => ({ updated_at: daysAgo(1) }));
    const lastPage = [{ updated_at: daysAgo(1) }];
    mockFetch([fullPage, fullPage, fullPage, lastPage]);

    const result = await fetchCatalogPreview('example.com');
    expect(result.productCount).toBe(751);
    expect(result.recentChanges30d).toBe(751);
  });

  it('stops at exactly 4 pages even if last page is full', async () => {
    const fullPage = Array.from({ length: 250 }, () => ({ updated_at: daysAgo(1) }));
    mockFetch([fullPage, fullPage, fullPage, fullPage, fullPage]);

    const result = await fetchCatalogPreview('example.com');
    expect(result.productCount).toBe(1000);
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  it('stops pagination when page returns fewer than 250 products', async () => {
    const fullPage = Array.from({ length: 250 }, () => ({ updated_at: daysAgo(1) }));
    const partialPage = Array.from({ length: 100 }, () => ({ updated_at: daysAgo(1) }));
    mockFetch([fullPage, partialPage]);

    const result = await fetchCatalogPreview('example.com');
    expect(result.productCount).toBe(350);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns error when SSRF check blocks the domain', async () => {
    vi.mocked(isHostnameSafe).mockResolvedValueOnce({ allowed: false, reason: 'Private IPv4 address' });

    const result = await fetchCatalogPreview('192.168.1.1');
    expect(result.error).toBe('Private IPv4 address');
    expect(result.productCount).toBe(0);
  });

  it('returns error on non-ok HTTP response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await fetchCatalogPreview('example.com');
    expect(result.error).toBe('HTTP 403');
  });

  it('returns error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;

    const result = await fetchCatalogPreview('example.com');
    expect(result.error).toBe('network error');
  });

  it('handles missing products key gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch;

    const result = await fetchCatalogPreview('example.com');
    expect(result.productCount).toBe(0);
    expect(result.error).toBeUndefined();
  });
});

describe('fetchCatalogPreviews', () => {
  it('processes up to 5 domains in parallel', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [{ updated_at: daysAgo(1) }] }),
    }) as unknown as typeof fetch;

    const domains = ['a.com', 'b.com', 'c.com', 'd.com', 'e.com', 'f.com'];
    const results = await fetchCatalogPreviews(domains);
    expect(results).toHaveLength(5);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./polite-fetch.js', () => ({
  fetchWithRetry: vi.fn(),
  assertUrlOnDomain: vi.fn((rawUrl: string, domain: string) => {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
    const bare = domain.toLowerCase().replace(/^www\./, '');
    if (host !== bare && !host.endsWith(`.${bare}`)) {
      throw new Error(`URL ${rawUrl} is not on domain ${domain}`);
    }
  }),
  isBlockedStatus: vi.fn((status: number) => [401, 403, 429, 430].includes(status)),
  politeJitter: vi.fn().mockResolvedValue(undefined),
}));

import { parseSitemapXml, isLikelyProductUrl, discoverProductUrls, probeCompetitor } from './sitemap-discovery.js';
import { fetchWithRetry } from './polite-fetch.js';

const mockFetch = fetchWithRetry as ReturnType<typeof vi.fn>;

function xmlResponse(xml: string): Partial<Response> {
  return { ok: true, status: 200, text: async () => xml, json: async () => null };
}

function htmlResponse(html: string): Partial<Response> {
  return { ok: true, status: 200, text: async () => html, json: async () => null };
}

function errorResponse(status: number): Partial<Response> {
  return { ok: false, status, text: async () => '', json: async () => null };
}

const URLSET_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://acme.com/products/red-shirt</loc></url>
  <url><loc>https://acme.com/products/blue-shirt</loc></url>
  <url><loc>https://acme.com/pages/about</loc></url>
</urlset>`;

const INDEX_XML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://acme.com/sitemap_blog.xml</loc></sitemap>
  <sitemap><loc>https://acme.com/sitemap_products_1.xml</loc></sitemap>
</sitemapindex>`;

const PRODUCT_JSONLD_HTML = `<html><head>
<script type="application/ld+json">{"@type":"Product","name":"Red Shirt","sku":"RS-1","offers":{"@type":"Offer","price":"19.00"}}</script>
</head><body></body></html>`;

describe('parseSitemapXml', () => {
  it('parses page URLs from a urlset', () => {
    const { childSitemaps, pageUrls } = parseSitemapXml(URLSET_XML);
    expect(childSitemaps).toEqual([]);
    expect(pageUrls).toEqual([
      'https://acme.com/products/red-shirt',
      'https://acme.com/products/blue-shirt',
      'https://acme.com/pages/about',
    ]);
  });

  it('parses child sitemaps from a sitemapindex', () => {
    const { childSitemaps, pageUrls } = parseSitemapXml(INDEX_XML);
    expect(pageUrls).toEqual([]);
    expect(childSitemaps).toEqual([
      'https://acme.com/sitemap_blog.xml',
      'https://acme.com/sitemap_products_1.xml',
    ]);
  });

  it('returns empty results for malformed XML', () => {
    const { childSitemaps, pageUrls } = parseSitemapXml('not xml at all');
    expect(childSitemaps).toEqual([]);
    expect(pageUrls).toEqual([]);
  });
});

describe('isLikelyProductUrl', () => {
  it('matches common product URL shapes', () => {
    expect(isLikelyProductUrl('https://acme.com/products/red-shirt')).toBe(true);
    expect(isLikelyProductUrl('https://acme.com/product/red-shirt')).toBe(true);
    expect(isLikelyProductUrl('https://acme.com/shop/red-shirt')).toBe(true);
    expect(isLikelyProductUrl('https://acme.com/item/12345')).toBe(true);
  });

  it('rejects non-product pages and invalid URLs', () => {
    expect(isLikelyProductUrl('https://acme.com/pages/about')).toBe(false);
    expect(isLikelyProductUrl('https://acme.com/blog/new-products-coming')).toBe(false);
    expect(isLikelyProductUrl('https://acme.com/products/')).toBe(false);
    expect(isLikelyProductUrl('not a url')).toBe(false);
  });
});

describe('discoverProductUrls', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns product URLs from a flat urlset sitemap', async () => {
    mockFetch.mockResolvedValueOnce(xmlResponse(URLSET_XML));

    const { sitemapUrl, productUrls } = await discoverProductUrls('acme.com');
    expect(sitemapUrl).toBe('https://acme.com/sitemap.xml');
    expect(productUrls).toEqual([
      'https://acme.com/products/red-shirt',
      'https://acme.com/products/blue-shirt',
    ]);
  });

  it('prefers product child sitemaps in a sitemap index', async () => {
    mockFetch
      .mockResolvedValueOnce(xmlResponse(INDEX_XML))
      .mockResolvedValueOnce(xmlResponse(URLSET_XML));

    const { sitemapUrl, productUrls } = await discoverProductUrls('acme.com');
    expect(sitemapUrl).toBe('https://acme.com/sitemap.xml');
    // The product child sitemap is fetched first because its URL mentions products
    expect(mockFetch.mock.calls[1]![0]).toBe('https://acme.com/sitemap_products_1.xml');
    expect(productUrls).toContain('https://acme.com/products/red-shirt');
  });

  it('filters out product URLs on other domains', async () => {
    const crossDomainXml = `<?xml version="1.0"?>
<urlset><url><loc>https://evil.com/products/phish</loc></url></urlset>`;
    mockFetch
      .mockResolvedValueOnce(xmlResponse(crossDomainXml))
      .mockResolvedValue(errorResponse(404));

    const { sitemapUrl, productUrls } = await discoverProductUrls('acme.com');
    expect(sitemapUrl).toBeNull();
    expect(productUrls).toEqual([]);
  });

  it('tries the next sitemap candidate when the first 404s', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(404))
      .mockResolvedValueOnce(xmlResponse(URLSET_XML));

    const { sitemapUrl } = await discoverProductUrls('acme.com');
    expect(sitemapUrl).toBe('https://acme.com/sitemap_index.xml');
  });
});

describe('probeCompetitor', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns full_catalog when products.json works', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ products: [{ id: 1 }] }),
      text: async () => '',
    });

    const outcome = await probeCompetitor('acme.com');
    expect(outcome).toEqual({ tier: 'full_catalog' });
  });

  it('returns limited immediately when products.json is blocked, without probing the sitemap', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(403));

    const outcome = await probeCompetitor('acme.com');
    expect(outcome.tier).toBe('limited');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns selected_products when the sitemap has product URLs with JSON-LD', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(404)) // products.json
      .mockResolvedValueOnce(xmlResponse(URLSET_XML)) // sitemap.xml
      .mockResolvedValueOnce(htmlResponse(PRODUCT_JSONLD_HTML)); // sample PDP

    const outcome = await probeCompetitor('acme.com');
    expect(outcome.tier).toBe('selected_products');
    if (outcome.tier === 'selected_products') {
      expect(outcome.sitemapUrl).toBe('https://acme.com/sitemap.xml');
      expect(outcome.productUrls).toHaveLength(2);
    }
  });

  it('still returns selected_products when the sample page has no JSON-LD but loads fine', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(404))
      .mockResolvedValueOnce(xmlResponse(URLSET_XML))
      .mockResolvedValueOnce(htmlResponse('<html><body>no structured data</body></html>'));

    const outcome = await probeCompetitor('acme.com');
    expect(outcome.tier).toBe('selected_products');
  });

  it('returns limited when nothing on the ladder works', async () => {
    mockFetch.mockResolvedValue(errorResponse(404));

    const outcome = await probeCompetitor('acme.com');
    expect(outcome.tier).toBe('limited');
  });
});

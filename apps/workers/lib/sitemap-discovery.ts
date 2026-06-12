// Sitemap-based product discovery for fallback-tier competitors.
// Probe ladder: products.json, then sitemap product URLs, then limited.

import * as cheerio from 'cheerio';
import { fetchWithRetry, assertUrlOnDomain, isBlockedStatus, politeJitter } from './polite-fetch.js';
import { htmlHasProductJsonLd } from './extract-jsonld.js';

const SITEMAP_CANDIDATES = ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml'];
const MAX_CHILD_SITEMAPS = 5;
export const MAX_DISCOVERED_URLS = 500;
export const MAX_TRACKED_URLS = 50;
export const AUTO_SELECT_URLS = 20;

export interface SitemapParseResult {
  childSitemaps: string[];
  pageUrls: string[];
}

export function parseSitemapXml(xml: string): SitemapParseResult {
  const $ = cheerio.load(xml, { xmlMode: true });
  const childSitemaps = $('sitemapindex > sitemap > loc')
    .toArray()
    .map((el) => $(el).text().trim())
    .filter(Boolean);
  const pageUrls = $('urlset > url > loc')
    .toArray()
    .map((el) => $(el).text().trim())
    .filter(Boolean);
  return { childSitemaps, pageUrls };
}

export function isLikelyProductUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\/(products?|shop|item)\/[^/]+/.test(path);
  } catch {
    return false;
  }
}

/**
 * Fetch the competitor's sitemap(s) and return product-looking page URLs.
 * Child sitemaps whose URL mentions products are preferred so one fetch
 * budget is not wasted on blog or page sitemaps.
 */
export async function discoverProductUrls(
  domain: string
): Promise<{ sitemapUrl: string | null; productUrls: string[] }> {
  for (const candidate of SITEMAP_CANDIDATES) {
    const sitemapUrl = `https://${domain}${candidate}`;
    let res: Response;
    try {
      res = await fetchWithRetry(sitemapUrl, { maxAttempts: 2, timeoutMs: 15_000 });
    } catch {
      continue;
    }
    if (!res.ok) continue;

    const { childSitemaps, pageUrls } = parseSitemapXml(await res.text());
    const collected: string[] = pageUrls.filter(isLikelyProductUrl);

    if (collected.length === 0 && childSitemaps.length > 0) {
      const prioritized = [
        ...childSitemaps.filter((u) => u.toLowerCase().includes('product')),
        ...childSitemaps.filter((u) => !u.toLowerCase().includes('product')),
      ].slice(0, MAX_CHILD_SITEMAPS);

      for (const child of prioritized) {
        if (collected.length >= MAX_DISCOVERED_URLS) break;
        try {
          assertUrlOnDomain(child, domain);
          await politeJitter();
          const childRes = await fetchWithRetry(child, { maxAttempts: 2, timeoutMs: 15_000 });
          if (!childRes.ok) continue;
          const parsed = parseSitemapXml(await childRes.text());
          collected.push(...parsed.pageUrls.filter(isLikelyProductUrl));
        } catch {
          continue;
        }
      }
    }

    const sameDomain = collected.filter((u) => {
      try {
        assertUrlOnDomain(u, domain);
        return true;
      } catch {
        return false;
      }
    });

    if (sameDomain.length > 0) {
      return { sitemapUrl, productUrls: [...new Set(sameDomain)].slice(0, MAX_DISCOVERED_URLS) };
    }
  }
  return { sitemapUrl: null, productUrls: [] };
}

export type ProbeOutcome =
  | { tier: 'full_catalog' }
  | { tier: 'selected_products'; sitemapUrl: string; productUrls: string[] }
  | { tier: 'limited'; reason: string };

/**
 * The extraction fallback ladder. One cheap products.json request, then
 * sitemap discovery with JSON-LD verification of a sample URL, then limited.
 */
export async function probeCompetitor(domain: string): Promise<ProbeOutcome> {
  // Rung 1: Shopify-style products.json
  try {
    const res = await fetchWithRetry(`https://${domain}/products.json?limit=1`, { maxAttempts: 2, timeoutMs: 15_000 });
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as { products?: unknown[] } | null;
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return { tier: 'full_catalog' };
      }
    } else if (isBlockedStatus(res.status)) {
      // Feed exists but blocks us; do not probe the sitemap aggressively either
      return { tier: 'limited', reason: `products.json returned ${res.status}` };
    }
  } catch {
    // fall through to sitemap rung
  }

  // Rung 2: sitemap product URLs, verified by JSON-LD on a sample page
  const { sitemapUrl, productUrls } = await discoverProductUrls(domain);
  if (sitemapUrl && productUrls.length > 0) {
    const sample = productUrls[0]!;
    try {
      await politeJitter();
      const res = await fetchWithRetry(sample, { maxAttempts: 2, timeoutMs: 15_000 });
      if (res.ok && htmlHasProductJsonLd(await res.text())) {
        return { tier: 'selected_products', sitemapUrl, productUrls };
      }
      if (!res.ok && isBlockedStatus(res.status)) {
        return { tier: 'limited', reason: `product page returned ${res.status}` };
      }
      // Pages exist but carry no JSON-LD; OG/microdata extraction may still work
      if (res.ok) {
        return { tier: 'selected_products', sitemapUrl, productUrls };
      }
    } catch {
      // fall through
    }
  }

  return { tier: 'limited', reason: 'no usable products.json or sitemap product pages' };
}

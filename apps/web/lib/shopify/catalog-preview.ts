import 'server-only';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';

export interface CatalogPreviewResult {
  domain: string;
  productCount: number;
  recentChanges30d: number;
  error?: string;
}

interface ShopifyProduct {
  updated_at: string;
}

const FETCH_TIMEOUT_MS = 5_000;
const MAX_PAGES = 4;
const PAGE_LIMIT = 250;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function fetchCatalogPreview(domain: string): Promise<CatalogPreviewResult> {
  const ssrfCheck = await isHostnameSafe(domain);
  if (!ssrfCheck.allowed) {
    return { domain, productCount: 0, recentChanges30d: 0, error: ssrfCheck.reason ?? 'Blocked' };
  }

  const cutoff = Date.now() - THIRTY_DAYS_MS;
  let productCount = 0;
  let recentChanges30d = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    let products: ShopifyProduct[];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(
          `https://${domain}/products.json?limit=${PAGE_LIMIT}&page=${page}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'Beaconmon/1.0 (+https://beaconmon.com)' },
          }
        );
        if (!res.ok) {
          return { domain, productCount, recentChanges30d, error: `HTTP ${res.status}` };
        }
        const data = (await res.json()) as { products?: ShopifyProduct[] };
        products = Array.isArray(data?.products) ? data.products : [];
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      return { domain, productCount, recentChanges30d, error: msg };
    }

    for (const product of products) {
      productCount++;
      const updatedAt = Date.parse(product.updated_at);
      if (!isNaN(updatedAt) && updatedAt >= cutoff) {
        recentChanges30d++;
      }
    }

    if (products.length < PAGE_LIMIT) break;
  }

  return { domain, productCount, recentChanges30d };
}

export async function fetchCatalogPreviews(domains: string[]): Promise<CatalogPreviewResult[]> {
  return Promise.all(domains.slice(0, 5).map(fetchCatalogPreview));
}

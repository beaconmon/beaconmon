// Shopify storefront protocol logic shared by the worker catalog-sync job and
// the public competitor-snapshot tool: paginate products.json, resolve the
// store currency, and surface the raw product shape. Transport (the actual
// fetch, retry, and politeness jitter) is injected so each caller keeps its own
// policy: the worker reuses its polite-fetch, the web tool wraps its SSRF guard.

export interface ShopifyVariant {
  id: number;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  sku: string | null;
  title: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  variants: ShopifyVariant[];
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

/** Thrown when products.json exists but is blocked or gone; lets the worker
 * descend its fallback ladder and the web tool fall back to HTML extraction
 * instead of treating the store as a hard error. */
export class FeedUnusableError extends Error {
  constructor(public readonly status: number) {
    super(`Shopify feed unusable: status ${status}`);
    this.name = 'FeedUnusableError';
  }
}

// Sentinel value for FeedUnusableError when the feed is unreachable due to a network
// error (e.g. redirect loop) rather than an HTTP error response.
export const FEED_NETWORK_ERROR_STATUS = 0;

// Max products per products.json page; also the public endpoint's hard ceiling.
export const PRODUCTS_PER_PAGE = 250;
// Safety cap on pages so a misbehaving or unbounded catalog cannot loop forever.
// 40 pages * 250 = 10k products, well beyond a typical tracked competitor.
export const MAX_FEED_PAGES = 40;

export interface ShopifyCatalogResult {
  products: ShopifyProduct[];
  /** True when a mid-pagination error stopped the fetch early; callers must not
   * mark missing products unavailable on a partial result set. */
  partial: boolean;
}

/** Transport injected by the caller so politeness and SSRF policy stay caller-owned. */
export interface StorefrontFetchDeps {
  fetchWithRetry: (
    url: string,
    opts?: { maxAttempts?: number; timeoutMs?: number }
  ) => Promise<Response>;
  politeJitter: () => Promise<void>;
  logger?: { warn: (obj: unknown, msg: string) => void };
}

/**
 * Paginate the public products.json feed.
 *
 * The public storefront endpoint does NOT emit rel="next" Link headers (that is
 * the authenticated Admin API); it paginates via ?page=N and returns a short or
 * empty page at the end. Relying on a Link header silently truncated every
 * catalog at 250 products, which then surfaced as false product_removed/stock
 * events when items shuffled in and out of the first page. We page until a page
 * shorter than the limit, with a hard cap.
 */
export async function fetchShopifyCatalog(
  domain: string,
  deps: StorefrontFetchDeps,
  opts: { maxPages?: number } = {}
): Promise<ShopifyCatalogResult> {
  const { fetchWithRetry, politeJitter, logger } = deps;
  // Public callers (the snapshot tool) cap pages to bound per-request cost; the
  // worker omits this and uses the full MAX_FEED_PAGES safety ceiling.
  const maxPages = Math.min(opts.maxPages ?? MAX_FEED_PAGES, MAX_FEED_PAGES);
  const allProducts: ShopifyProduct[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `https://${domain}/products.json?limit=${PRODUCTS_PER_PAGE}&page=${page}`;
    let res: Response;
    try {
      res = await fetchWithRetry(url);
    } catch {
      if (page === 1) throw new FeedUnusableError(FEED_NETWORK_ERROR_STATUS);
      logger?.warn({ domain, page }, 'Shopify feed pagination stopped early on network error');
      return { products: allProducts, partial: true };
    }

    if (!res.ok) {
      // A failure on the first page means the feed itself is unusable, so the
      // caller can descend the fallback ladder. A failure mid-pagination keeps
      // the pages already collected rather than discarding a partial catalog.
      if (page === 1) {
        throw new FeedUnusableError(res.status);
      }
      logger?.warn({ domain, page, status: res.status }, 'Shopify feed pagination stopped early on error');
      return { products: allProducts, partial: true };
    }

    let data: ShopifyProductsResponse;
    try {
      data = (await res.json()) as ShopifyProductsResponse;
    } catch {
      // Non-JSON body (HTML error page, CF challenge, WAF block returning 200) means the feed is unusable.
      if (page === 1) throw new FeedUnusableError(res.status);
      logger?.warn({ domain, page }, 'Shopify feed pagination returned non-JSON; stopping early');
      return { products: allProducts, partial: true };
    }
    if (!Array.isArray(data.products)) {
      // Valid JSON but missing products array (e.g. rate-limit error body like {"errors":"..."}).
      if (page === 1) throw new FeedUnusableError(res.status);
      logger?.warn({ domain, page }, 'Shopify feed returned unexpected shape; stopping early');
      return { products: allProducts, partial: true };
    }
    allProducts.push(...data.products);

    // A page shorter than the limit (including empty) is the last page.
    if (data.products.length < PRODUCTS_PER_PAGE) break;

    // Be polite between sequential page fetches against one storefront IP.
    await politeJitter();
  }

  return { products: allProducts, partial: false };
}

/**
 * Resolve a Shopify store's base currency. products.json carries no currency,
 * so prices would otherwise be mislabeled (a UK store's £49 reported as $49).
 * meta.json exposes it; fall back to USD when missing or unparseable.
 */
export async function fetchStoreCurrency(
  domain: string,
  deps: Pick<StorefrontFetchDeps, 'fetchWithRetry' | 'logger'>
): Promise<string> {
  const logger = deps.logger;
  try {
    const res = await deps.fetchWithRetry(`https://${domain}/meta.json`, { maxAttempts: 2, timeoutMs: 10_000 });
    if (!res.ok) {
      logger?.warn({ domain, status: res.status }, 'Currency fetch returned non-OK, falling back to USD');
      return 'USD';
    }
    const data = (await res.json()) as { currency?: unknown };
    if (typeof data.currency === 'string' && /^[A-Z]{3}$/.test(data.currency)) {
      return data.currency;
    }
    logger?.warn({ domain, currency: data.currency }, 'Currency fetch returned unexpected shape, falling back to USD');
    return 'USD';
  } catch (err) {
    logger?.warn({ domain, err }, 'Currency fetch failed, falling back to USD');
    return 'USD';
  }
}

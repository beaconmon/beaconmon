import 'server-only';
import {
  fetchShopifyCatalog,
  fetchStoreCurrency,
  FeedUnusableError,
  FEED_NETWORK_ERROR_STATUS,
  PRODUCTS_PER_PAGE,
  type ShopifyProduct,
  type ShopifyVariant,
} from '@beaconmon/checker';

const EMPTY_LOGGER = { warn: (_obj: unknown, _msg: string) => {} };

// Public tool: bound per-request cost. Five pages (up to 1,250 products) is a
// strong snapshot while keeping outbound fetches and latency in check. A larger
// catalog reports its count as a floor ("1250+") rather than fetching the rest.
const TOOL_MAX_PAGES = 5;
const SAMPLE_LIMIT = 12;
const ON_SALE_LIMIT = 12;
const FETCH_TIMEOUT_MS = 10_000;
const TOOL_USER_AGENT = 'Beaconmon/1.0 (+https://beaconmon.com)';

/** Honest, timed fetch for the public tool. No retries on the storefront feed:
 * a public visitor should get a fast answer, and the result is cached upstream. */
async function toolFetch(url: string, opts: { timeoutMs?: number } = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': TOOL_USER_AGENT },
    });
  } finally {
    clearTimeout(timer);
  }
}

const noJitter = () => Promise.resolve();

export interface SnapshotProduct {
  title: string;
  handle: string;
  url: string;
  price: string;
  compareAtPrice: string | null;
  onSale: boolean;
  available: boolean;
}

export interface Snapshot {
  domain: string;
  platform: 'shopify';
  currency: string;
  /** True when the catalog is larger than what the tool fetched; productCount is a floor. */
  countIsFloor: boolean;
  productCount: number;
  onSaleCount: number;
  availableCount: number;
  onSale: SnapshotProduct[];
  sample: SnapshotProduct[];
  takenAt: string;
}

export type SnapshotResult =
  | { ok: true; snapshot: Snapshot }
  | { ok: false; reason: 'not_shopify' | 'unreachable' };

function parsePrice(value: string | null | undefined): number {
  if (!value) return NaN;
  return Number.parseFloat(value);
}

/** Pick the lowest-priced variant as the product's representative price, matching
 * the worker's catalog adapter so the tool and the paid product agree. */
function representativeVariant(product: ShopifyProduct): ShopifyVariant | undefined {
  if (product.variants.length === 0) return undefined;
  return product.variants.reduce(
    (min, v) => (parsePrice(v.price) < parsePrice(min.price) ? v : min),
    product.variants[0]!
  );
}

function toSnapshotProduct(domain: string, product: ShopifyProduct): SnapshotProduct {
  const variant = representativeVariant(product);
  const price = variant?.price ?? '0';
  const compareAtPrice = variant?.compare_at_price ?? null;
  const compareNum = parsePrice(compareAtPrice);
  const priceNum = parsePrice(price);
  const onSale = Number.isFinite(compareNum) && Number.isFinite(priceNum) && compareNum > priceNum;
  return {
    title: product.title,
    handle: product.handle,
    url: `https://${domain}/products/${product.handle}`,
    price,
    compareAtPrice,
    onSale,
    available: product.variants.some((v) => v.available),
  };
}

/**
 * Build a point-in-time snapshot of a Shopify storefront's public catalog.
 * Shopify-first: a store whose products.json is blocked or absent returns a
 * not_shopify result rather than a hard error, so the UI can degrade gracefully.
 * Callers must SSRF-guard the domain before calling this.
 */
export async function buildSnapshot(domain: string): Promise<SnapshotResult> {
  let catalog;
  try {
    catalog = await fetchShopifyCatalog(
      domain,
      { fetchWithRetry: toolFetch, politeJitter: noJitter },
      { maxPages: TOOL_MAX_PAGES }
    );
  } catch (err) {
    if (err instanceof FeedUnusableError) {
      // status 0 is a network failure (host down, DNS, timeout) — treat as
      // unreachable; an HTTP status or non-JSON body means the feed exists but
      // is blocked or absent, i.e. not a readable Shopify storefront.
      return { ok: false, reason: err.status === FEED_NETWORK_ERROR_STATUS ? 'unreachable' : 'not_shopify' };
    }
    return { ok: false, reason: 'unreachable' };
  }

  const currency = await fetchStoreCurrency(domain, { fetchWithRetry: toolFetch, logger: EMPTY_LOGGER });
  const products = catalog.products.map((p) => toSnapshotProduct(domain, p));

  const onSale = products.filter((p) => p.onSale);
  const available = products.filter((p) => p.available);
  // We stopped at the page cap with full pages, so more products exist upstream.
  const countIsFloor = catalog.partial || products.length >= TOOL_MAX_PAGES * PRODUCTS_PER_PAGE;

  return {
    ok: true,
    snapshot: {
      domain,
      platform: 'shopify',
      currency,
      countIsFloor,
      productCount: products.length,
      onSaleCount: onSale.length,
      availableCount: available.length,
      onSale: onSale.slice(0, ON_SALE_LIMIT),
      sample: products.slice(0, SAMPLE_LIMIT),
      takenAt: new Date().toISOString(),
    },
  };
}

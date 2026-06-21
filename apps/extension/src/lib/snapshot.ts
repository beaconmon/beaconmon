// Client-side promo X-ray. Mirrors apps/web/lib/tools/snapshot.ts so the
// extension and the paid product report identical numbers, but runs in the
// service worker against the checker parser's browser transport. No server hit.
import {
  fetchShopifyCatalog,
  fetchStoreCurrency,
  FeedUnusableError,
  FEED_NETWORK_ERROR_STATUS,
  PRODUCTS_PER_PAGE,
  type ShopifyProduct,
  type ShopifyVariant,
} from '@beaconmon/checker/storefront';
import { MAX_SNAPSHOT_PAGES } from './config.js';
import { storefrontDeps } from './transport.js';

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
  /** True when the catalog is larger than what we fetched; productCount is a floor. */
  countIsFloor: boolean;
  productCount: number;
  onSaleCount: number;
  availableCount: number;
  /** Headline badge number: share of fetched catalog currently discounted, 0-100. */
  onSalePct: number;
  onSale: SnapshotProduct[];
  sample: SnapshotProduct[];
  takenAt: string;
}

export type SnapshotResult =
  | { ok: true; snapshot: Snapshot }
  // 'not_shopify' = feed blocked/absent (detected Shopify but unreadable);
  // 'unreachable' = network failure reaching the host.
  | { ok: false; reason: 'not_shopify' | 'unreachable' };

const SAMPLE_LIMIT = 12;
const ON_SALE_LIMIT = 12;

function parsePrice(value: string | null | undefined): number {
  if (!value) return NaN;
  return Number.parseFloat(value);
}

/** Lowest-priced variant represents the product, matching the worker's catalog
 * adapter so on-sale verdicts agree across the snapshot tool and monitoring. */
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

/** Build a point-in-time promo snapshot of a Shopify storefront's public catalog,
 * entirely on-device. Callers pass a bare host (e.g. "allbirds.com"). */
export async function buildSnapshot(domain: string): Promise<SnapshotResult> {
  let catalog;
  try {
    catalog = await fetchShopifyCatalog(domain, storefrontDeps, { maxPages: MAX_SNAPSHOT_PAGES });
  } catch (err) {
    if (err instanceof FeedUnusableError) {
      return {
        ok: false,
        reason: err.status === FEED_NETWORK_ERROR_STATUS ? 'unreachable' : 'not_shopify',
      };
    }
    return { ok: false, reason: 'unreachable' };
  }

  const currency = await fetchStoreCurrency(domain, storefrontDeps);
  const products = catalog.products.map((p) => toSnapshotProduct(domain, p));

  const onSale = products.filter((p) => p.onSale);
  const available = products.filter((p) => p.available);
  const countIsFloor = catalog.partial || products.length >= MAX_SNAPSHOT_PAGES * PRODUCTS_PER_PAGE;
  const onSalePct = products.length === 0 ? 0 : Math.round((onSale.length / products.length) * 100);

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
      onSalePct,
      onSale: onSale.slice(0, ON_SALE_LIMIT),
      sample: products.slice(0, SAMPLE_LIMIT),
      takenAt: new Date().toISOString(),
    },
  };
}

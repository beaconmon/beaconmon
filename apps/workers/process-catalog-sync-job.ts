import { randomUUID } from 'node:crypto';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { CatalogSyncJob, CompetitorNotifyJob } from '@beaconmon/queue';
import {
  competitorEventRepository,
  getCompetitorSyncInfo,
  updateCompetitorDiscoveryState,
  updateCompetitorTier,
} from '@beaconmon/db';
import type { CompetitorSyncInfo } from '@beaconmon/db';
import { scoreRuleBased } from '@beaconmon/ai';
import { logger } from './lib/logger.js';
import {
  validateCompetitorDomain,
  assertUrlOnDomain,
  fetchWithRetry,
  politeJitter,
  isBlockedStatus,
} from './lib/polite-fetch.js';
import { syncCatalog, createNotifyGate } from './lib/catalog-sync.js';
import type { ExtractedProduct } from './lib/catalog-sync.js';
import { extractProductFromHtml } from './lib/extract-jsonld.js';
import type { ExtractedPageProduct } from './lib/extract-jsonld.js';
import {
  probeCompetitor,
  discoverProductUrls,
  MAX_TRACKED_URLS,
  AUTO_SELECT_URLS,
} from './lib/sitemap-discovery.js';

const service = 'shopify-feed-worker';

// Atomically delete a Redis key only if the stored value matches the caller's token.
// Prevents a sync that outlived its lock TTL from deleting a successor's lock.
const RELEASE_LOCK_IF_OWNER = `if redis.call("get",KEYS[1])==ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;

// Fallback syncs fetch up to 50 PDPs sequentially, so the lock outlives the
// Shopify path's old 300s budget. Release-if-owner keeps a longer TTL safe.
const LOCK_TTL_SECONDS = 900;
// Stop fetching fallback PDPs when a run exceeds this, counting the rest as errors
const FALLBACK_TIME_BUDGET_MS = 600_000;
// Max new sitemap URLs enriched per weekly rescan
const MAX_RESCAN_ENRICHMENTS = 10;

interface ShopifyVariant {
  id: number;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  sku: string | null;
  title: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  variants: ShopifyVariant[];
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

/** Thrown when products.json exists but is blocked or gone; triggers the fallback ladder instead of BullMQ retries */
class FeedUnusableError extends Error {
  constructor(public readonly status: number) {
    super(`Shopify feed unusable: status ${status}`);
  }
}

// Max products per products.json page; also the public endpoint's hard ceiling.
const PRODUCTS_PER_PAGE = 250;
// Safety cap on pages so a misbehaving or unbounded catalog cannot loop forever.
// 40 pages * 250 = 10k products, well beyond a typical tracked competitor.
const MAX_FEED_PAGES = 40;

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
interface FeedFetchResult {
  products: ShopifyProduct[];
  /** True when a mid-pagination error stopped the fetch early; callers must not
   * mark missing products unavailable on a partial result set. */
  partial: boolean;
}

async function fetchAllShopifyProducts(domain: string): Promise<FeedFetchResult> {
  const allProducts: ShopifyProduct[] = [];

  for (let page = 1; page <= MAX_FEED_PAGES; page++) {
    const url = `https://${domain}/products.json?limit=${PRODUCTS_PER_PAGE}&page=${page}`;
    const res = await fetchWithRetry(url);

    if (!res.ok) {
      // A failure on the first page means the feed itself is unusable, so the
      // caller can descend the fallback ladder. A failure mid-pagination keeps
      // the pages already collected rather than discarding a partial catalog.
      if (page === 1) {
        if (isBlockedStatus(res.status) || res.status === 404 || res.status === 410) {
          throw new FeedUnusableError(res.status);
        }
        throw new Error(`Shopify feed returned ${res.status} for ${url}`);
      }
      logger.warn({ service, domain, page, status: res.status }, 'Shopify feed pagination stopped early on error');
      return { products: allProducts, partial: true };
    }

    const data = (await res.json()) as ShopifyProductsResponse;
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
async function fetchStoreCurrency(domain: string): Promise<string> {
  try {
    const res = await fetchWithRetry(`https://${domain}/meta.json`, { maxAttempts: 2, timeoutMs: 10_000 });
    if (!res.ok) return 'USD';
    const data = (await res.json()) as { currency?: unknown };
    if (typeof data.currency === 'string' && /^[A-Z]{3}$/.test(data.currency)) {
      return data.currency;
    }
    return 'USD';
  } catch {
    return 'USD';
  }
}

function shopifyToExtracted(product: ShopifyProduct, currency: string): ExtractedProduct {
  const priceVariant =
    product.variants.length > 0
      ? product.variants.reduce((min, v) =>
          parseFloat(v.price) < parseFloat(min.price) ? v : min,
          product.variants[0]!)
      : undefined;

  return {
    externalId: String(product.id),
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    productType: product.product_type,
    price: priceVariant?.price ?? '0',
    compareAtPrice: priceVariant?.compare_at_price ?? null,
    available: product.variants.some((v) => v.available),
    currency,
    variants: product.variants.map((v) => ({
      id: v.id,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      available: v.available,
      sku: v.sku,
      title: v.title,
    })),
    priceVariantId: priceVariant?.id,
  };
}

interface FallbackFetchResult {
  products: ExtractedPageProduct[];
  fetchErrors: number;
  blockedCount: number;
  attempted: number;
  timedOut: number;
}

/** Fetch tracked PDPs sequentially with jitter and extract products via the in-page ladder */
async function fetchFallbackProducts(
  competitorId: string,
  domain: string,
  urls: string[]
): Promise<FallbackFetchResult> {
  const products: ExtractedPageProduct[] = [];
  let fetchErrors = 0;
  let blockedCount = 0;
  let attempted = 0;
  let timedOut = 0;
  const startedAt = Date.now();
  const capped = urls.slice(0, MAX_TRACKED_URLS);

  for (const url of capped) {
    if (Date.now() - startedAt > FALLBACK_TIME_BUDGET_MS) {
      const skipped = capped.length - attempted;
      logger.warn({ service, competitorId, attempted, total: capped.length, skipped }, 'Fallback sync time budget exhausted');
      timedOut = skipped;
      break;
    }
    attempted++;
    try {
      assertUrlOnDomain(url, domain);
      await politeJitter();
      const res = await fetchWithRetry(url, { maxAttempts: 2, timeoutMs: 15_000 });
      if (!res.ok) {
        if (isBlockedStatus(res.status)) blockedCount++;
        else fetchErrors++;
        continue;
      }
      const extracted = extractProductFromHtml(await res.text(), url);
      if (extracted) {
        products.push(extracted);
      } else {
        fetchErrors++;
      }
    } catch (err) {
      logger.warn({ service, competitorId, url, err }, 'Failed to fetch tracked product URL');
      fetchErrors++;
    }
  }

  return { products, fetchErrors, blockedCount, attempted, timedOut };
}

async function markLimited(competitorId: string, reason: string): Promise<void> {
  await updateCompetitorTier(competitorId, { dataTier: 'limited' });
  await updateCompetitorDiscoveryState(competitorId, {
    discoveryState: 'not_applicable',
    discoveryError: reason.slice(0, 500),
  });
}

/**
 * Weekly sitemap re-scan for selected_products competitors: diffs the sitemap's
 * product URLs against the previously seen set in Redis and emits product_added
 * launch events, enriched by fetching the new PDP. The first scan is a baseline
 * and emits nothing, mirroring the catalog baseline-sync suppression.
 */
async function rescanSitemap(
  info: CompetitorSyncInfo,
  redis: Redis,
  notifyQueue: Queue<CompetitorNotifyJob>
): Promise<void> {
  const { id: competitorId, teamId, domain } = info;
  const { productUrls } = await discoverProductUrls(domain);
  if (productUrls.length === 0) {
    logger.info({ service, competitorId }, 'Sitemap rescan found no product URLs');
    return;
  }

  const seenKey = `sitemap:seen:${competitorId}`;
  const isBaseline = (await redis.exists(seenKey)) === 0;

  const newUrls: string[] = [];
  if (!isBaseline) {
    for (const url of productUrls) {
      const isMember = await redis.sismember(seenKey, url);
      if (!isMember) newUrls.push(url);
    }
  }
  await redis.sadd(seenKey, ...productUrls);

  if (isBaseline || newUrls.length === 0) {
    logger.info({ service, competitorId, urls: productUrls.length, isBaseline }, 'Sitemap rescan complete, no launches');
    return;
  }

  const maybeEnqueueNotify = createNotifyGate(competitorId, teamId, notifyQueue);
  const now = new Date();
  let enriched = 0;

  for (const url of newUrls.slice(0, MAX_RESCAN_ENRICHMENTS)) {
    try {
      assertUrlOnDomain(url, domain);
      await politeJitter();
      const res = await fetchWithRetry(url, { maxAttempts: 2, timeoutMs: 15_000 });
      if (!res.ok) continue;
      const product = extractProductFromHtml(await res.text(), url);
      if (!product) continue;

      // Reuse the diff engine for the upsert so the product lands with the
      // right source tag; baseline=true suppresses its own product_added so
      // the launch event below is the only one emitted.
      await syncCatalog({
        competitorId,
        teamId,
        source: product.source,
        products: [product],
        isBaselineSync: true,
        markMissingUnavailable: false,
        notifyQueue,
      });

      const payload = { productHandle: product.handle, title: product.title, price: product.price, currency: product.currency };
      const event = await competitorEventRepository.createEvent({
        teamId,
        competitorId,
        type: 'product_added',
        payload,
        significance: scoreRuleBased('product_added', payload),
        detectedAt: now,
      });
      await maybeEnqueueNotify(event.id);
      enriched++;
    } catch (err) {
      logger.warn({ service, competitorId, url, err }, 'Sitemap rescan enrichment failed');
    }
  }

  logger.info({ service, competitorId, newUrls: newUrls.length, enriched }, 'Sitemap rescan detected launches');
}

export async function processCatalogSyncJob(
  data: CatalogSyncJob,
  redis: Redis,
  notifyQueue: Queue<CompetitorNotifyJob>
): Promise<void> {
  const { competitorId, teamId, domain, mode } = data;

  validateCompetitorDomain(domain);

  // Job-level lock: skip if another worker is already processing this competitor.
  // Key name predates the fallback ladder and is kept for in-flight compatibility.
  const lockKey = `shopify:processing:${competitorId}`;
  const lockValue = randomUUID();
  const acquired = await redis.set(lockKey, lockValue, 'EX', LOCK_TTL_SECONDS, 'NX');
  if (!acquired) {
    logger.info({ service, competitorId }, 'Skipping, lock already held');
    return;
  }

  try {
    const info = await getCompetitorSyncInfo(competitorId);
    if (!info) {
      logger.warn({ service, competitorId }, 'Competitor not found, skipping');
      return;
    }

    if (mode === 'sitemap_rescan') {
      await rescanSitemap(info, redis, notifyQueue);
      return;
    }

    const isBaselineSync = !info.discoverySyncedAt;
    await updateCompetitorDiscoveryState(competitorId, { discoveryState: 'syncing' });

    let tier = info.dataTier;
    let trackedUrls = info.trackedProductUrls;

    // Competitors without a usable tier yet (new non-Shopify adds, previously
    // limited ones on their weekly re-probe) climb the ladder first.
    if (tier === 'limited') {
      const outcome = await probeCompetitor(domain);
      if (outcome.tier === 'full_catalog') {
        tier = 'full_catalog';
        await updateCompetitorTier(competitorId, { dataTier: 'full_catalog' });
      } else if (outcome.tier === 'selected_products') {
        tier = 'selected_products';
        // Merchant-tracked URLs stay; sitemap candidates fill the remaining budget
        const merged = [...new Set([...trackedUrls, ...outcome.productUrls.slice(0, AUTO_SELECT_URLS)])].slice(0, MAX_TRACKED_URLS);
        trackedUrls = merged;
        await updateCompetitorTier(competitorId, {
          dataTier: 'selected_products',
          sitemapUrl: outcome.sitemapUrl,
          trackedProductUrls: merged,
        });
      } else {
        await markLimited(competitorId, outcome.reason);
        logger.info({ service, competitorId, domain, reason: outcome.reason }, 'Competitor remains limited');
        return;
      }
    }

    if (tier === 'full_catalog') {
      let fetched: ShopifyProduct[];
      let feedPartial = false;
      try {
        ({ products: fetched, partial: feedPartial } = await fetchAllShopifyProducts(domain));
      } catch (err) {
        if (err instanceof FeedUnusableError) {
          // The feed is blocked or gone: descend the ladder instead of retrying
          logger.warn({ service, competitorId, domain, status: err.status }, 'Shopify feed unusable, probing fallback ladder');
          const { sitemapUrl, productUrls } = await discoverProductUrls(domain);
          if (sitemapUrl && productUrls.length > 0) {
            const merged = [...new Set([...trackedUrls, ...productUrls.slice(0, AUTO_SELECT_URLS)])].slice(0, MAX_TRACKED_URLS);
            trackedUrls = merged;
            tier = 'selected_products';
            await updateCompetitorTier(competitorId, {
              dataTier: 'selected_products',
              sitemapUrl,
              trackedProductUrls: merged,
            });
          } else {
            await markLimited(competitorId, `products.json returned ${err.status}, no usable sitemap`);
            return;
          }
        } else {
          logger.error({ service, competitorId, domain, err }, 'Failed to fetch Shopify feed');
          throw err;
        }
      }

      if (tier === 'full_catalog') {
        const currency = await fetchStoreCurrency(domain);
        const { productErrors } = await syncCatalog({
          competitorId,
          teamId,
          source: 'shopify_feed',
          products: fetched!.map((p) => shopifyToExtracted(p, currency)),
          isBaselineSync,
          // Do not mark missing products unavailable when pagination was cut
          // short by an error: only pages 1..N-1 were fetched, so items on
          // the missing pages are not actually gone.
          markMissingUnavailable: !feedPartial,
          notifyQueue,
        });

        if (productErrors > 0) {
          await updateCompetitorDiscoveryState(competitorId, {
            discoveryState: 'failed',
            discoveryError: `${productErrors} product(s) failed to process`,
          });
          throw new Error(`Shopify feed sync failed: ${productErrors} product(s) could not be processed`);
        }

        await updateCompetitorDiscoveryState(competitorId, {
          discoveryState: 'ready',
          discoverySyncedAt: new Date(),
          discoveryError: null,
        });

        logger.info({ service, competitorId, domain, fetched: fetched!.length }, 'Shopify feed processed');
        return;
      }
    }

    // selected_products tier: JSON-LD/OG extraction over the tracked PDPs
    if (trackedUrls.length === 0) {
      await markLimited(competitorId, 'no tracked product URLs');
      return;
    }

    const { products, fetchErrors, blockedCount, attempted, timedOut } = await fetchFallbackProducts(competitorId, domain, trackedUrls);

    if (products.length === 0 && blockedCount > 0) {
      // Pages exist but block automated access: be honest, do not retry hard
      await markLimited(competitorId, `${blockedCount} of ${attempted} tracked pages blocked automated access`);
      return;
    }

    // Mixed jsonld/html extraction syncs per source tag so unique keys stay consistent
    const bySource = new Map<'jsonld' | 'html', ExtractedProduct[]>();
    for (const p of products) {
      const list = bySource.get(p.source) ?? [];
      list.push(p);
      bySource.set(p.source, list);
    }

    let productErrors = 0;
    for (const [source, list] of bySource) {
      const result = await syncCatalog({
        competitorId,
        teamId,
        source,
        products: list,
        isBaselineSync,
        markMissingUnavailable: false,
        notifyQueue,
      });
      productErrors += result.productErrors;
    }

    if (products.length === 0) {
      await updateCompetitorDiscoveryState(competitorId, {
        discoveryState: 'failed',
        discoveryError: `No products extracted from ${attempted} tracked page(s)`,
      });
      return;
    }

    await updateCompetitorDiscoveryState(competitorId, {
      discoveryState: 'ready',
      discoverySyncedAt: new Date(),
      discoveryError:
        fetchErrors > 0 || timedOut > 0
          ? `${fetchErrors} of ${attempted} tracked page(s) failed` +
            (timedOut > 0 ? `, ${timedOut} skipped (time budget exhausted)` : '')
          : null,
    });

    logger.info(
      { service, competitorId, domain, tier, extracted: products.length, fetchErrors, productErrors, timedOut },
      'Fallback catalog sync processed'
    );
  } finally {
    // Release lock only if this run still owns it
    await redis.eval(RELEASE_LOCK_IF_OWNER, 1, lockKey, lockValue);
  }
}

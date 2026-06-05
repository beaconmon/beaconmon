import { randomUUID } from 'node:crypto';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { ShopifyFeedJob, CompetitorNotifyJob } from '@beaconmon/queue';
import { prisma, competitorProductRepository, competitorEventRepository, updateCompetitorDiscoveryState } from '@beaconmon/db';
import { logger } from './lib/logger.js';

const service = 'shopify-feed-worker';

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

function toCents(price: string): number {
  return Math.round(parseFloat(price) * 100);
}

function validateShopifyDomain(domain: string): void {
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    throw new Error(`Invalid domain: ${domain}`);
  }
  const lower = domain.toLowerCase();
  const blocked = ['localhost', '127.', '10.', '192.168.', '169.254.'];
  for (const prefix of blocked) {
    if (lower === prefix || lower.startsWith(prefix)) {
      throw new Error(`Blocked domain: ${domain}`);
    }
  }
  // Block 172.16.0.0/12
  const m = lower.match(/^172\.(\d+)\./);
  if (m) {
    const octet = parseInt(m[1]!, 10);
    if (octet >= 16 && octet <= 31) throw new Error(`Blocked domain: ${domain}`);
  }
}

async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BeaconMon/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }
  throw lastErr;
}

async function fetchAllProducts(domain: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let url: string | null = `https://${domain}/products.json?limit=250`;

  while (url) {
    const res = await fetchWithRetry(url);

    if (!res.ok) {
      throw new Error(`Shopify feed returned ${res.status} for ${url}`);
    }

    const data = (await res.json()) as ShopifyProductsResponse;
    allProducts.push(...data.products);

    const linkHeader = res.headers.get('link');
    url = parseNextPageUrl(linkHeader);
  }

  return allProducts;
}

function parseNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    if (part.includes('rel="next"')) {
      const match = part.match(/<([^>]+)>/);
      if (match?.[1]) return match[1];
    }
  }
  return null;
}

export async function processShopifyFeedJob(
  data: ShopifyFeedJob,
  redis: Redis,
  notifyQueue: Queue<CompetitorNotifyJob>
): Promise<void> {
  const { competitorId, teamId, domain } = data;

  validateShopifyDomain(domain);

  await updateCompetitorDiscoveryState(competitorId, { discoveryState: 'syncing' });

  // 1. Acquire job-level lock — skip if another worker is already processing this competitor
  const lockKey = `shopify:processing:${competitorId}`;
  const lockValue = randomUUID();
  const acquired = await redis.set(lockKey, lockValue, 'EX', 300, 'NX');
  if (!acquired) {
    logger.info({ service, competitorId }, 'Skipping — lock already held');
    return;
  }

  try {
    // 2. Load existing products
    const existing = await competitorProductRepository.findByCompetitorId(competitorId);
    const existingByShopifyId = new Map(existing.map((p) => [p.shopifyProductId, p]));

    // 3. Fetch all pages from Shopify — throws on failure so BullMQ can retry
    let fetched: ShopifyProduct[];
    try {
      fetched = await fetchAllProducts(domain);
    } catch (err) {
      logger.error({ service, competitorId, domain, err }, 'Failed to fetch Shopify feed');
      throw err;
    }

    const fetchedIds = new Set<string>();
    const now = new Date();

    // Cache notification channel count so we don't query once per event
    let hasChannels: boolean | null = null;
    async function getHasChannels(): Promise<boolean> {
      if (hasChannels === null) {
        const count = await prisma.competitorNotificationChannel.count({ where: { competitorId } });
        hasChannels = count > 0;
      }
      return hasChannels;
    }

    async function maybeEnqueueNotify(eventId: string): Promise<void> {
      if (await getHasChannels()) {
        await notifyQueue.add('competitor-notify', { competitorEventId: eventId, teamId, competitorId });
      }
    }

    // 5. Diff fetched products against existing — process in parallel chunks to avoid O(N) serial round-trips
    const CHUNK_SIZE = 50;
    for (let i = 0; i < fetched.length; i += CHUNK_SIZE) {
      await Promise.all(
        fetched.slice(i, i + CHUNK_SIZE).map(async (product) => {
          try {
            const shopifyProductId = String(product.id);
            fetchedIds.add(shopifyProductId);

            const priceVariant =
              product.variants.length > 0
                ? product.variants.reduce((min, v) =>
                    parseFloat(v.price) < parseFloat(min.price) ? v : min,
                    product.variants[0]!)
                : undefined;

            const newPrice = priceVariant?.price ?? '0';
            const newAvailable = product.variants.some((v) => v.available);
            const trimmedVariants = product.variants.map((v) => ({
              id: v.id,
              price: v.price,
              compareAtPrice: v.compare_at_price,
              available: v.available,
              sku: v.sku,
              title: v.title,
            }));

            const upsertData = {
              competitorId,
              teamId,
              shopifyProductId,
              title: product.title,
              handle: product.handle,
              vendor: product.vendor || undefined,
              productType: product.product_type || undefined,
              isAvailable: newAvailable,
              variants: trimmedVariants,
              currentPrice: newPrice,
              compareAtPrice: priceVariant?.compare_at_price ?? null,
              currency: 'USD',
              lastSeenAt: now,
            };

            const existingProduct = existingByShopifyId.get(shopifyProductId);

            if (!existingProduct) {
              const productId = await competitorProductRepository.upsertProduct(upsertData);
              const event = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: 'product_added',
                payload: { productHandle: product.handle, title: product.title, price: newPrice, currency: 'USD' },
                detectedAt: now,
              });
              await maybeEnqueueNotify(event.id);
            } else {
              const oldPrice = existingProduct.currentPrice?.toString() ?? '0';
              const oldAvailable = existingProduct.isAvailable;
              const priceChanged = toCents(newPrice) !== toCents(oldPrice);
              const availabilityChanged = newAvailable !== oldAvailable;

              const productId = await competitorProductRepository.upsertProduct(upsertData);

              if (priceChanged) {
                const event = await competitorEventRepository.createEvent({
                  teamId,
                  competitorId,
                  productId,
                  type: 'price_changed',
                  payload: {
                    productHandle: product.handle,
                    oldPrice,
                    newPrice,
                    currency: 'USD',
                    variantId: priceVariant?.id,
                  },
                  detectedAt: now,
                });
                await maybeEnqueueNotify(event.id);
              }

              if (availabilityChanged) {
                const event = await competitorEventRepository.createEvent({
                  teamId,
                  competitorId,
                  productId,
                  type: 'stock_changed',
                  payload: { productHandle: product.handle, oldAvailable, newAvailable },
                  detectedAt: now,
                });
                await maybeEnqueueNotify(event.id);
              }

              const oldCompareAt = existingProduct.compareAtPrice != null ? String(existingProduct.compareAtPrice) : null;
              const newCompareAt = priceVariant?.compare_at_price ?? null;
              const saleStarted = !oldCompareAt && !!newCompareAt && toCents(newCompareAt) > toCents(newPrice);
              const saleEnded = !!oldCompareAt && !newCompareAt;

              if (saleStarted) {
                const event = await competitorEventRepository.createEvent({
                  teamId,
                  competitorId,
                  productId,
                  type: 'sale_started',
                  payload: { productHandle: product.handle, title: product.title, compareAtPrice: newCompareAt, currentPrice: newPrice, currency: 'USD' },
                  detectedAt: now,
                });
                await maybeEnqueueNotify(event.id);
              }

              if (saleEnded) {
                const event = await competitorEventRepository.createEvent({
                  teamId,
                  competitorId,
                  productId,
                  type: 'sale_ended',
                  payload: { productHandle: product.handle, title: product.title, wasCompareAtPrice: oldCompareAt, currency: 'USD' },
                  detectedAt: now,
                });
                await maybeEnqueueNotify(event.id);
              }
            }
          } catch (err) {
            logger.error(
              { service, competitorId, shopifyProductId: String(product.id), err },
              'Failed to process product — skipping'
            );
          }
        })
      );
    }

    // 6. Mark products not in the feed as unavailable — only act on products currently available
    for (const [shopifyProductId, existingProduct] of existingByShopifyId) {
      if (!fetchedIds.has(shopifyProductId) && existingProduct.isAvailable) {
        await competitorProductRepository.markUnavailable(competitorId, shopifyProductId);
        const event = await competitorEventRepository.createEvent({
          teamId,
          competitorId,
          productId: existingProduct.id,
          type: 'product_removed',
          payload: { productHandle: existingProduct.handle, title: existingProduct.title },
          detectedAt: now,
        });
        await maybeEnqueueNotify(event.id);
      }
    }

    await updateCompetitorDiscoveryState(competitorId, {
      discoveryState: 'ready',
      discoverySyncedAt: new Date(),
      discoveryError: null,
    });

    logger.info(
      { service, competitorId, domain, fetched: fetched.length, existing: existing.length },
      'Shopify feed processed'
    );
  } finally {
    // 8. Release lock
    await redis.del(lockKey);
  }
}

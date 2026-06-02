import { fetch } from 'undici';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type { ShopifyFeedJob, CompetitorNotifyJob } from '@beaconmon/queue';
import { prisma, competitorProductRepository, competitorEventRepository } from '@beaconmon/db';
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

async function fetchAllProducts(domain: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let url: string | null = `https://${domain}/products.json?limit=250`;

  while (url) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BeaconMon/1.0' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`Shopify feed returned ${res.status} for ${url}`);
    }

    const data = (await res.json()) as ShopifyProductsResponse;
    allProducts.push(...data.products);

    const linkHeader = res.headers.get('link');
    url = parseNextPageUrl(linkHeader, domain);
  }

  return allProducts;
}

function parseNextPageUrl(linkHeader: string | null, domain: string): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    if (part.includes('rel="next"')) {
      const match = part.match(/page_info=([^&>]+)/);
      if (match) {
        return `https://${domain}/products.json?limit=250&page_info=${match[1]}`;
      }
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

  // 1. Acquire job-level lock — skip if another worker is already processing this competitor
  const lockKey = `shopify:processing:${competitorId}`;
  const acquired = await redis.set(lockKey, '1', 'EX', 300, 'NX');
  if (!acquired) {
    logger.info({ service, competitorId }, 'Skipping — lock already held');
    return;
  }

  try {
    // 2. Load existing products
    const existing = await competitorProductRepository.findByCompetitorId(competitorId);
    const existingByShopifyId = new Map(existing.map((p) => [p.shopifyProductId, p]));

    // 3. Fetch all pages from Shopify
    let fetched: ShopifyProduct[];
    try {
      fetched = await fetchAllProducts(domain);
    } catch (err) {
      logger.error({ service, competitorId, domain, err }, 'Failed to fetch Shopify feed');
      return;
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

    // 5. Diff fetched products against existing
    for (const product of fetched) {
      const shopifyProductId = String(product.id);
      fetchedIds.add(shopifyProductId);

      const firstVariant = product.variants[0];
      const newPrice = firstVariant?.price ?? '0';
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
        compareAtPrice: firstVariant?.compare_at_price ?? null,
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
        const priceChanged = parseFloat(newPrice) !== parseFloat(oldPrice);
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
              variantId: firstVariant?.id,
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
      }
    }

    // 6. Mark products not in the feed as unavailable
    for (const [shopifyProductId, existingProduct] of existingByShopifyId) {
      if (!fetchedIds.has(shopifyProductId)) {
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

    logger.info(
      { service, competitorId, domain, fetched: fetched.length, existing: existing.length },
      'Shopify feed processed'
    );
  } finally {
    // 8. Release lock
    await redis.del(lockKey);
  }
}

// Source-agnostic catalog diff/event engine, extracted from the Shopify feed
// job so fallback-tier sources (JSON-LD, OG/microdata) reuse the same upsert,
// event emission, baseline suppression, and notify gating.

import type { Queue } from 'bullmq';
import type { CompetitorNotifyJob } from '@beaconmon/queue';
import { prisma, competitorProductRepository, competitorEventRepository } from '@beaconmon/db';
import type { ProductSource } from '@beaconmon/db';
import { scoreRuleBased } from '@beaconmon/ai';
import { logger } from './logger.js';

const service = 'catalog-sync';

export interface ExtractedProduct {
  externalId: string;
  title: string;
  handle: string;
  sku?: string;
  vendor?: string;
  productType?: string;
  price: string;
  compareAtPrice?: string | null;
  available: boolean;
  currency: string;
  sourceUrl?: string;
  /** trimmed variant list; only the Shopify adapter provides this */
  variants?: unknown;
  /** id of the variant whose price is tracked; only the Shopify adapter provides this */
  priceVariantId?: number;
}

export function toCents(price: string): number {
  return Math.round(parseFloat(price) * 100);
}

/**
 * Caches the competitor's notification-channel count for one sync run so each
 * event does not trigger a count query.
 */
export function createNotifyGate(
  competitorId: string,
  teamId: string,
  notifyQueue: Queue<CompetitorNotifyJob>
): (eventId: string) => Promise<void> {
  let hasChannels: boolean | null = null;
  return async function maybeEnqueueNotify(eventId: string): Promise<void> {
    if (hasChannels === null) {
      const count = await prisma.competitorNotificationChannel.count({ where: { competitorId } });
      hasChannels = count > 0;
    }
    if (hasChannels) {
      await notifyQueue.add('competitor-notify', { competitorEventId: eventId, teamId, competitorId });
    }
  };
}

export interface CatalogSyncOptions {
  competitorId: string;
  teamId: string;
  source: ProductSource;
  products: ExtractedProduct[];
  /**
   * The first successful sync establishes the catalog baseline. Diffing against
   * an empty catalog would emit one product_added event (and notification) per
   * item, so event creation is suppressed until a baseline exists.
   */
  isBaselineSync: boolean;
  /**
   * Full-catalog feeds list every product, so absence means removed. Fallback
   * tiers only see the tracked pages; a page that failed to fetch or parse must
   * not be treated as a removed product.
   */
  markMissingUnavailable: boolean;
  notifyQueue: Queue<CompetitorNotifyJob>;
}

export interface CatalogSyncResult {
  productErrors: number;
  fetchedCount: number;
}

export async function syncCatalog(opts: CatalogSyncOptions): Promise<CatalogSyncResult> {
  const { competitorId, teamId, source, products, isBaselineSync, markMissingUnavailable, notifyQueue } = opts;

  const existing = await competitorProductRepository.findByCompetitorId(competitorId, source);
  const existingByExternalId = new Map(existing.map((p) => [p.externalId, p]));

  const fetchedIds = new Set<string>();
  const now = new Date();
  let productErrors = 0;

  const maybeEnqueueNotify = createNotifyGate(competitorId, teamId, notifyQueue);

  // Diff fetched products against existing, in parallel chunks to avoid O(N) serial round-trips
  const CHUNK_SIZE = 50;
  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    await Promise.all(
      products.slice(i, i + CHUNK_SIZE).map(async (product) => {
        try {
          const { externalId } = product;
          fetchedIds.add(externalId);

          const newPrice = product.price;
          const newAvailable = product.available;

          const upsertData = {
            competitorId,
            teamId,
            externalId,
            source,
            sourceUrl: product.sourceUrl ?? null,
            title: product.title,
            handle: product.handle,
            vendor: product.vendor || undefined,
            productType: product.productType || undefined,
            sku: product.sku,
            isAvailable: newAvailable,
            variants: product.variants ?? [],
            currentPrice: newPrice,
            compareAtPrice: product.compareAtPrice ?? null,
            currency: product.currency,
            lastSeenAt: now,
          };

          const existingProduct = existingByExternalId.get(externalId);

          if (!existingProduct) {
            const productId = await competitorProductRepository.upsertProduct(upsertData);
            if (!isBaselineSync) {
              const addedPayload = { productHandle: product.handle, title: product.title, price: newPrice, currency: product.currency };
              const event = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: 'product_added',
                payload: addedPayload,
                significance: scoreRuleBased('product_added', addedPayload),
                detectedAt: now,
              });
              await maybeEnqueueNotify(event.id);
            }
          } else {
            const oldPrice = existingProduct.currentPrice?.toString() ?? '0';
            const oldAvailable = existingProduct.isAvailable;
            const priceChanged = !isBaselineSync && toCents(newPrice) !== toCents(oldPrice);
            const availabilityChanged = !isBaselineSync && newAvailable !== oldAvailable;

            const productId = await competitorProductRepository.upsertProduct(upsertData);

            if (priceChanged) {
              const pricePayload = {
                productHandle: product.handle,
                oldPrice,
                newPrice,
                currency: product.currency,
                variantId: product.priceVariantId,
              };
              const event = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: 'price_changed',
                payload: pricePayload,
                significance: scoreRuleBased('price_changed', pricePayload),
                detectedAt: now,
              });
              await maybeEnqueueNotify(event.id);
            }

            if (availabilityChanged) {
              // Only the granular out_of_stock/back_in_stock event is created.
              // A parallel stock_changed event would double-count the same flip
              // in the event feed and digests.
              const granularType = newAvailable ? 'back_in_stock' : 'out_of_stock';
              const granularPayload = { productHandle: product.handle, oldAvailable, newAvailable, previouslyAvailable: oldAvailable };
              const granularEvent = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: granularType,
                payload: granularPayload,
                significance: scoreRuleBased(granularType, granularPayload),
                detectedAt: now,
              });
              await maybeEnqueueNotify(granularEvent.id);
            }

            const oldCompareAt = existingProduct.compareAtPrice != null ? String(existingProduct.compareAtPrice) : null;
            const newCompareAt = product.compareAtPrice ?? null;
            // A product is on sale only when compare-at exceeds the current price.
            // Comparing the on-sale state before and after catches products first
            // seen mid-sale and avoids a sale_ended for a compare-at that was
            // never an actual discount.
            const wasOnSale = !!oldCompareAt && toCents(oldCompareAt) > toCents(oldPrice);
            const isOnSale = !!newCompareAt && toCents(newCompareAt) > toCents(newPrice);
            const saleStarted = !isBaselineSync && !wasOnSale && isOnSale;
            const saleEnded = !isBaselineSync && wasOnSale && !isOnSale;

            if (saleStarted) {
              const saleStartedPayload = { productHandle: product.handle, title: product.title, compareAtPrice: newCompareAt, currentPrice: newPrice, currency: product.currency };
              const event = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: 'sale_started',
                payload: saleStartedPayload,
                significance: scoreRuleBased('sale_started', saleStartedPayload),
                detectedAt: now,
              });
              await maybeEnqueueNotify(event.id);
            }

            if (saleEnded) {
              const saleEndedPayload = { productHandle: product.handle, title: product.title, wasCompareAtPrice: oldCompareAt, currency: product.currency };
              const event = await competitorEventRepository.createEvent({
                teamId,
                competitorId,
                productId,
                type: 'sale_ended',
                payload: saleEndedPayload,
                significance: scoreRuleBased('sale_ended', saleEndedPayload),
                detectedAt: now,
              });
              await maybeEnqueueNotify(event.id);
            }
          }
        } catch (err) {
          logger.error(
            { service, competitorId, externalId: product.externalId, err },
            'Failed to process product'
          );
          productErrors++;
        }
      })
    );
  }

  // Mark products not in the feed as unavailable, only acting on products currently available
  if (markMissingUnavailable) {
    for (const [externalId, existingProduct] of existingByExternalId) {
      if (!fetchedIds.has(externalId) && existingProduct.isAvailable) {
        await competitorProductRepository.markUnavailable(competitorId, source, externalId);
        if (!isBaselineSync) {
          const removedPayload = { productHandle: existingProduct.handle, title: existingProduct.title };
          const event = await competitorEventRepository.createEvent({
            teamId,
            competitorId,
            productId: existingProduct.id,
            type: 'product_removed',
            payload: removedPayload,
            significance: scoreRuleBased('product_removed', removedPayload),
            detectedAt: now,
          });
          await maybeEnqueueNotify(event.id);
        }
      }
    }
  }

  return { productErrors, fetchedCount: products.length };
}

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
 * Minimum absolute percent move required before a price_changed event is
 * recorded. The default of 0.02 (2%) suppresses live spot-price repricing
 * storms (e.g. precious-metal sellers re-quoting every few minutes) while
 * still capturing real merchandising moves. A downstream read-time filter
 * hides sub-5% moves, but storage is gated here at the source. Override with
 * the PRICE_EVENT_MIN_PCT env var.
 */
const DEFAULT_PRICE_EVENT_MIN_PCT = 0.02;

export function priceEventMinPct(): number {
  const raw = process.env.PRICE_EVENT_MIN_PCT;
  if (raw === undefined) return DEFAULT_PRICE_EVENT_MIN_PCT;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_PRICE_EVENT_MIN_PCT;
}

/**
 * Decides whether a price move is worth recording as an event. Returns true
 * (emit) when the old price is missing, zero, or unparseable, since a product
 * going from unpriced to priced is rare and meaningful. When both prices parse
 * and the old price is positive, the move must be at or above the threshold.
 */
export function isMaterialPriceMove(oldPrice: string, newPrice: string, minPct: number): boolean {
  const old = parseFloat(oldPrice);
  const next = parseFloat(newPrice);
  if (!Number.isFinite(old) || old <= 0) return true;
  if (!Number.isFinite(next)) return true;
  return Math.abs(next - old) / old >= minPct;
}

/**
 * Gift cards, samples, and digital items are not real catalog products for
 * competitor intelligence. A new one should update the product row but not
 * generate a product_added event. The list is intentionally small.
 */
const NON_PRODUCT_PATTERNS = ['gift-card', 'gift card', 'e-gift', 'egift', 'sample', 'digital'];

export function isNonProductItem(parts: Array<string | undefined>): boolean {
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  return NON_PRODUCT_PATTERNS.some((pattern) => haystack.includes(pattern));
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
            // Gift cards, samples, and digital items still update the product row
            // but should not generate a product_added event.
            const isNonProduct = isNonProductItem([product.handle, product.title, product.productType]);
            if (!isBaselineSync && !isNonProduct) {
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
            const oldPrice = existingProduct.currentPrice?.toString() ?? null;
            const oldAvailable = existingProduct.isAvailable;
            // A currency change is a locale artifact (e.g. the crawler being
            // geo-routed to EUR pricing), not a real price move. The stored
            // price and currency still update via the upsert below.
            const currencyFlipped = existingProduct.currency != null && existingProduct.currency !== product.currency;
            const rawPriceChanged = oldPrice !== null && toCents(newPrice) !== toCents(oldPrice);
            // Only record an event for material moves, to suppress live
            // spot-price repricing storms. The product snapshot still updates.
            const priceChanged =
              !isBaselineSync &&
              rawPriceChanged &&
              !currencyFlipped &&
              oldPrice !== null &&
              isMaterialPriceMove(oldPrice, newPrice, priceEventMinPct());
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
              const granularPayload = { productHandle: product.handle, oldAvailable, newAvailable };
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
            const wasOnSale = !!oldCompareAt && oldPrice !== null && toCents(oldCompareAt) > toCents(oldPrice);
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

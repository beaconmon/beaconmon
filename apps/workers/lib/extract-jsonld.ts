// Pure HTML-to-product extraction for fallback-tier competitors.
// Ladder within a single fetched page: JSON-LD Product/ProductGroup first,
// then OpenGraph product meta, then microdata itemprop="price".
// cheerio only. requires_js pages are out of scope by policy.

import * as cheerio from 'cheerio';

export interface ExtractedPageProduct {
  externalId: string;
  title: string;
  handle: string;
  sku?: string;
  vendor?: string;
  price: string;
  compareAtPrice: string | null;
  available: boolean;
  currency: string;
  sourceUrl: string;
  /** which rung of the in-page ladder produced this */
  source: 'jsonld' | 'html';
}

type JsonValue = unknown;
type JsonObject = Record<string, unknown>;

function isObject(v: JsonValue): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asArray(v: JsonValue): JsonValue[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function typeMatches(node: JsonObject, wanted: string): boolean {
  const t = node['@type'];
  if (typeof t === 'string') return t === wanted || t.endsWith(`/${wanted}`);
  if (Array.isArray(t)) return t.some((x) => typeof x === 'string' && (x === wanted || x.endsWith(`/${wanted}`)));
  return false;
}

/** Collect candidate nodes from a parsed JSON-LD document: top level, arrays, and @graph */
function collectNodes(doc: JsonValue): JsonObject[] {
  const out: JsonObject[] = [];
  for (const item of asArray(doc)) {
    if (!isObject(item)) continue;
    out.push(item);
    for (const g of asArray(item['@graph'])) {
      if (isObject(g)) out.push(g);
    }
  }
  return out;
}

function normalizePrice(raw: unknown): string | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'string') {
    // Strip currency symbols and thousands separators, keep digits, dot, comma
    const cleaned = raw.replace(/[^\d.,]/g, '');
    if (!cleaned) return null;
    // "1.299,00" (comma decimal) vs "1,299.00" (dot decimal)
    const normalized =
      /,\d{1,2}$/.test(cleaned) && !/\.\d{1,2}$/.test(cleaned)
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? String(n) : null;
  }
  return null;
}

function availabilityToBool(raw: unknown): boolean {
  if (typeof raw !== 'string') return true;
  const v = raw.toLowerCase();
  if (v.includes('outofstock') || v.includes('soldout') || v.includes('discontinued') || v.includes('oos')) return false;
  return true;
}

interface OfferInfo {
  price: string | null;
  compareAtPrice: string | null;
  currency: string | null;
  available: boolean;
  sku: string | null;
}

function parsePriceSpecification(spec: JsonValue): { price: string | null; compareAt: string | null; currency: string | null } {
  let price: string | null = null;
  let compareAt: string | null = null;
  let currency: string | null = null;
  for (const entry of asArray(spec)) {
    if (!isObject(entry)) continue;
    const entryPrice = normalizePrice(entry['price']);
    if (typeof entry['priceCurrency'] === 'string' && !currency) currency = entry['priceCurrency'];
    const priceType = entry['priceType'];
    const isStrikethrough =
      typeof priceType === 'string' && (priceType.includes('StrikethroughPrice') || priceType.includes('ListPrice'));
    if (isStrikethrough) {
      if (entryPrice) compareAt = entryPrice;
    } else if (entryPrice && !price) {
      price = entryPrice;
    }
  }
  return { price, compareAt, currency };
}

function parseOffer(offer: JsonObject): OfferInfo {
  const spec = parsePriceSpecification(offer['priceSpecification']);
  const price = normalizePrice(offer['price']) ?? normalizePrice(offer['lowPrice']) ?? spec.price;
  const currency =
    (typeof offer['priceCurrency'] === 'string' ? offer['priceCurrency'] : null) ?? spec.currency;
  return {
    price,
    compareAtPrice: spec.compareAt,
    currency,
    available: availabilityToBool(offer['availability']),
    sku: typeof offer['sku'] === 'string' ? offer['sku'] : null,
  };
}

/** Lowest-priced offer wins, mirroring the Shopify path's min-variant pricing */
function bestOffer(node: JsonObject): OfferInfo | null {
  const offers: OfferInfo[] = [];
  for (const o of asArray(node['offers'])) {
    if (!isObject(o)) continue;
    if (typeMatches(o, 'AggregateOffer')) {
      offers.push(parseOffer(o));
      for (const inner of asArray(o['offers'])) {
        if (isObject(inner)) offers.push(parseOffer(inner));
      }
    } else {
      offers.push(parseOffer(o));
    }
  }
  const priced = offers.filter((o) => o.price !== null);
  if (priced.length === 0) return null;
  return priced.reduce((min, o) => (parseFloat(o.price!) < parseFloat(min.price!) ? o : min), priced[0]!);
}

function handleFromUrl(pageUrl: string): string {
  try {
    const path = new URL(pageUrl).pathname.replace(/\/+$/, '');
    const last = path.split('/').pop();
    return last || path || pageUrl;
  } catch {
    return pageUrl;
  }
}

function productFromJsonLdNode(node: JsonObject, pageUrl: string): ExtractedPageProduct | null {
  // ProductGroup: prefer the group's own offers, else the first variant's
  let target = node;
  if (typeMatches(node, 'ProductGroup') && !node['offers']) {
    const variant = asArray(node['hasVariant']).find(isObject);
    if (variant) target = { ...variant, name: variant['name'] ?? node['name'] };
  }

  const offer = bestOffer(target);
  if (!offer) return null;

  const name = typeof target['name'] === 'string' ? target['name'] : typeof node['name'] === 'string' ? node['name'] : null;
  if (!name) return null;

  const sku = typeof target['sku'] === 'string' ? target['sku'] : offer.sku;
  const productID = typeof target['productID'] === 'string' ? target['productID'] : null;
  const mpn = typeof target['mpn'] === 'string' ? target['mpn'] : null;
  const brand = target['brand'];
  const vendor = isObject(brand) && typeof brand['name'] === 'string' ? brand['name'] : typeof brand === 'string' ? brand : undefined;

  return {
    externalId: productID ?? sku ?? mpn ?? new URL(pageUrl).pathname,
    title: name,
    handle: handleFromUrl(pageUrl),
    sku: sku ?? undefined,
    vendor,
    price: offer.price!,
    compareAtPrice: offer.compareAtPrice,
    available: offer.available,
    currency: offer.currency ?? 'USD',
    sourceUrl: pageUrl,
    source: 'jsonld',
  };
}

function productFromMetaTags($: cheerio.CheerioAPI, pageUrl: string): ExtractedPageProduct | null {
  const meta = (prop: string): string | null => {
    const el = $(`meta[property="${prop}"]`).first();
    const content = el.attr('content');
    return content && content.trim() ? content.trim() : null;
  };

  let price = normalizePrice(meta('product:price:amount') ?? meta('og:price:amount'));
  let currency = meta('product:price:currency') ?? meta('og:price:currency');

  if (!price) {
    // Microdata rung: itemprop="price" content attribute, else text
    const el = $('[itemprop="price"]').first();
    if (el.length) {
      price = normalizePrice(el.attr('content') ?? el.text());
      if (!currency) {
        const cur = $('[itemprop="priceCurrency"]').first();
        currency = cur.attr('content') ?? null;
      }
    }
  }
  if (!price) return null;

  const availabilityRaw =
    meta('product:availability') ?? meta('og:availability') ?? $('[itemprop="availability"]').first().attr('href') ?? null;
  const title = meta('og:title') ?? $('title').first().text().trim();
  if (!title) return null;

  return {
    externalId: new URL(pageUrl).pathname,
    title,
    handle: handleFromUrl(pageUrl),
    price,
    compareAtPrice: null,
    available: availabilityToBool(availabilityRaw),
    currency: currency ?? 'USD',
    sourceUrl: pageUrl,
    source: 'html',
  };
}

/**
 * Extract a single product from a PDP's HTML. Returns null when the page has
 * no machine-readable product data on any rung of the ladder.
 */
export function extractProductFromHtml(html: string, pageUrl: string): ExtractedPageProduct | null {
  const $ = cheerio.load(html);

  for (const el of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(el).text();
    if (!raw.trim()) continue;
    let doc: JsonValue;
    try {
      doc = JSON.parse(raw);
    } catch {
      continue;
    }
    for (const node of collectNodes(doc)) {
      if (!typeMatches(node, 'Product') && !typeMatches(node, 'ProductGroup')) continue;
      const product = productFromJsonLdNode(node, pageUrl);
      if (product) return product;
    }
  }

  return productFromMetaTags($, pageUrl);
}

/** True when a page's HTML contains a JSON-LD Product node (used by sitemap probing) */
export function htmlHasProductJsonLd(html: string): boolean {
  const $ = cheerio.load(html);
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(el).text();
    if (!raw.includes('Product')) continue;
    try {
      const doc = JSON.parse(raw);
      if (collectNodes(doc).some((n) => typeMatches(n, 'Product') || typeMatches(n, 'ProductGroup'))) return true;
    } catch {
      continue;
    }
  }
  return false;
}

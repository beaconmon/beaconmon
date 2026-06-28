# Production Data Findings

**Queried:** 2026-06-27  
**Window:** June 12 - June 27, 2026 (15 days)  
**Method:** Read-only queries via SSH tunnel against `beaconmon` Postgres DB using `competitor_events` and `competitor_products` tables.

---

## Dataset Overview

| Metric | Value |
|--------|-------|
| Total events | 493,169 |
| Price change events | 468,451 |
| Unique competitors | 511 |
| Total products tracked | 178,623 |
| Earliest event | 2026-06-12 |
| Latest event | 2026-06-27 |

---

## Event Type Breakdown

| Event type | Count | % of total |
|------------|-------|-----------|
| `price_changed` | 468,451 | 94.99% |
| `product_added` | 9,372 | 1.90% |
| `out_of_stock` | 4,294 | 0.87% |
| `back_in_stock` | 3,224 | 0.65% |
| `product_removed` | 2,611 | 0.53% |
| `sale_started` | 1,839 | 0.37% |
| `site_changed` | 1,428 | 0.29% |
| `sale_ended` | 1,413 | 0.29% |
| `promo_detected` | 537 | 0.11% |

---

## Price Change Magnitude Distribution

Based on `(newPrice - oldPrice) / oldPrice * 100` from the `payload` JSONB field.  
Only events where both `newPrice` and `oldPrice` are present and `oldPrice > 0`.

| Bucket | Count | % of price change events |
|--------|-------|--------------------------|
| < 1% | 425,135 | **90.76%** |
| 1-3% | 29,953 | 6.39% |
| 3-5% | 4,544 | 0.97% |
| 5-10% | 1,669 | 0.36% |
| 10-20% | 1,560 | 0.33% |
| 20-50% | 4,606 | 0.98% |
| 50%+ | 963 | 0.21% |

**Key derived stats:**
- Sub-5% total: **98.12%**
- 5%+ (actionable): **1.88%**
- Existing blog post says 87% -- actual is **90.76%**. Update needed.

### Price Direction

| Direction | Count | Avg magnitude | Median magnitude |
|-----------|-------|---------------|-----------------|
| Increase | 259,455 (55.4%) | 0.92% | 0.17% |
| Decrease | 208,975 (44.6%) | 0.85% | 0.13% |

Prices go up more than they go down. Median in both directions is under 0.2%.

---

## Catalog-Wide vs Isolated Price Moves

Grouped by `(competitor_id, DATE(detected_at))` -- how many SKUs changed per competitor per day.

| Move type | Days of activity | Total SKU changes |
|-----------|-----------------|-------------------|
| 1 SKU (isolated) | 100 | 100 |
| 2-5 SKUs | 100 | 306 |
| 6-20 SKUs | 137 | 1,515 |
| 21-50 SKUs | 96 | 3,192 |
| 50+ SKUs (catalog-wide) | 224 | **463,338** |

**Key stat: 98.9% of all changed SKUs belong to catalog-wide moves (50+ SKUs on same day).**  
Only 100 instances of a true single-SKU change in the entire dataset.

---

## Day-of-Week Pattern

**⚠ DATA ARTIFACT WARNING -- do not use for blog claims.**

| Day | Event count |
|-----|------------|
| Saturday (Jun 12) | 123 |
| Tuesday (Jun 16) | 29,827 |
| Wednesday (Jun 17) | 148,840 |
| Thursday (Jun 18) | 159,760 |
| Friday (Jun 19) | 122,620 |
| Sunday (Jun 21) | 4,307 |
| Monday (Jun 22) | 758 |
| Tuesday (Jun 23) | 1,618 |
| Wednesday (Jun 24) | 511 |
| Thursday (Jun 25) | 87 |

The huge Wed-Fri spike in week 1 is almost certainly the initial bulk catalog ingestion (first scan establishing baseline, second scan generating ~430k "change" events from comparison). Week 2 shows the organic rate (~1-5k/day). **Do not claim day-of-week pricing patterns from this data.** Need 60+ days of steady-state data to make that claim.

---

## Sale Events

### Sale Duration

Matched `sale_started` -> `sale_ended` for same product within 60 days.

| Metric | Value |
|--------|-------|
| Matched pairs | 304 |
| Average duration | 1.0 days |
| Median (P50) | **0.7 days** |
| P25 | 0.7 days |
| P75 | 0.7 days |

**Median sale lasts 0.7 days (roughly 17 hours).** Very tight distribution -- most sales end same window they started.

⚠ Low sample: only 304 matched pairs out of 1,839 sale_started events. The rest either haven't ended yet or ended outside our 15-day window. Stat is directionally correct but may update with more data.

### Sale Discount Depth

From `sale_started` events with `compareAtPrice` and `currentPrice` in payload.

| Discount bracket | Count | % |
|-----------------|-------|---|
| < 10% | 6 | 0.33% |
| 10-20% | 121 | 6.58% |
| 20-30% | 779 | **42.38%** |
| 30-50% | 394 | 21.44% |
| 50%+ | 538 | 29.27% |

Most common sale depth: 20-30% off. Nearly 30% of sales are 50%+ (liquidation/acquisition plays).

---

## Competitor Discounting Behavior

Competitors with 5+ products, classified by what % of catalog has `compare_at_price > current_price` at any given moment.

| Behavior | Count | % of competitors |
|----------|-------|-----------------|
| Never runs sales (0% catalog on sale) | 228 | **46.6%** |
| Occasional sales (< 10% catalog) | 85 | 17.4% |
| Frequent sales (10-30% catalog) | 89 | 18.2% |
| Permanent sale mode (30%+ catalog) | 87 | **17.8%** |

**Two dominant camps: nearly half never discount, nearly a fifth are always "on sale".**

---

## Products Currently On Sale

Across all 178,623 tracked products:

| Status | Count | % |
|--------|-------|---|
| On sale (compare_at_price > current_price) | 41,026 | **23.23%** |
| Full price | 135,555 | 76.77% |

---

## Product Price Distribution

| Bucket | Products | % |
|--------|----------|---|
| < $10 | 9,240 | 5.23% |
| $10-25 | 24,987 | 14.15% |
| $25-50 | 30,588 | 17.32% |
| $50-100 | 31,247 | 17.70% |
| $100-200 | 31,713 | 17.96% |
| $200+ | 48,806 | **27.64%** |

Heavily skewed toward higher-ticket items. May reflect the specific customer base tracked rather than general Shopify population.

---

## Products Per Competitor

| Catalog size | Competitor count |
|-------------|-----------------|
| < 10 products | 10 |
| 10-50 products | 110 |
| 50-100 products | 110 |
| 100-300 products | 156 |
| 300-500 products | 32 |
| 500+ products | 74 |

Most competitors have 10-300 products. 74 have 500+.

---

## Variant Complexity

| Variants per product | Product count |
|---------------------|--------------|
| 1 (simple) | 66,319 |
| 2-3 | 18,707 |
| 4-10 | 80,160 |
| 11-20 | 9,284 |
| 20+ | 4,153 |

Most products have 4-10 variants or are simple single-variant products.

---

## Stock Events

### Out-of-Stock by Day of Week

Tuesday is the most common out-of-stock day (42% of all OOS events).  
⚠ Same caveat as price changes -- this may be an artifact of the initial ingestion window. Do not use this in posts yet.

### Restock Time

Matched `out_of_stock` -> `back_in_stock` within 90 days for same product.

| Metric | Value |
|--------|-------|
| Matched pairs | 2,605 |
| Average days to restock | 2.3 |
| Median days to restock | **1.5** |

**Most stockouts resolve within 1.5-2.3 days.**

---

## Product Churn

| Metric | Value |
|--------|-------|
| Products added in 15-day window | 9,372 |
| Products removed in 15-day window | 2,611 |
| Products added then removed in same window | **664 (7.1%)** |

One in 14 new products gets pulled within the same 15-day window.

---

## Coffee-Specific Data

Filter: `LOWER(product_type) LIKE '%coffee%'`

| Metric | Value |
|--------|-------|
| Coffee products tracked | **5,412** |
| Average price | $43.85 |
| Median price | **$21.99** |
| Min price | $0.35 |
| Max price | $11,167.95 |
| On sale (compare_at_price set) | 154 (2.8%) |

**Coffee on-sale rate: 2.8% vs 23.2% overall. Coffee brands are 8x less likely to formally discount.**

### Coffee Price Change Distribution

| Bucket | Count | % of coffee changes |
|--------|-------|-------------------|
| < 1% | 2,782 | **64.3%** |
| 1-5% | 1,229 | 28.4% |
| 5-10% | 301 | 7.0% |
| 10-20% | 7 | 0.16% |
| 20%+ | 8 | 0.18% |

Total coffee price change events: 4,327.

**Coffee 5%+ rate: 7.3% vs 1.88% overall. Coffee prices move significantly ~4x more often than average.**

Sub-1% noise for coffee: 64.3% vs 90.76% overall -- coffee has a much lower noise floor.

---

## Currency Distribution (Price Change Events)

| Currency | Events | % |
|----------|--------|---|
| USD | 452,940 | **96.7%** |
| AUD | 6,737 | 1.4% |
| GBP | 4,217 | 0.9% |
| SEK | 2,525 | 0.5% |
| CAD | 1,099 | 0.2% |
| EUR | 400 | 0.09% |

Dataset is primarily USD-denominated.

---

## Top Product Types in Catalog

| Product type | Products | % |
|-------------|----------|---|
| (unset) | 12,361 | 6.92% |
| Accessories | 5,850 | 3.28% |
| Pants | 2,743 | 1.54% |
| Dresses | 2,587 | 1.45% |
| Tops | 2,543 | 1.42% |
| Coffee | 2,444 | 1.37% |
| Sweaters | 2,253 | 1.26% |
| Knit Tops | 2,153 | 1.21% |
| Bags | 1,626 | 0.91% |
| Shoes and Boots | 1,154 | 0.65% |

Note: Coffee appears here with 2,444 (the `product_type = 'Coffee'` exact match). The 5,412 figure above uses a LIKE search and includes variants like "Specialty Coffee", etc.

Also notable: `black-opal` (3,376), `rough-opal` (2,783), `crystal-opal` (1,693), `dark-opal` (1,302) -- one competitor appears to be a large opal jewelry store with a non-standard product_type taxonomy.

---

## Data Quality Issues / Gaps Identified

### 1. `product_type` is unreliable for categorization
- 6.92% of products have no `product_type` set
- Values are merchant-defined and inconsistent: "Coffee", "Specialty Coffee", "coffee", "coffee beans" all describe the same category
- `black-opal` / `rough-opal` are one merchant's idiosyncratic taxonomy polluting category analysis
- **Fix:** Build a normalized category classifier. Either use keyword matching on `title` + `product_type`, or maintain a category override table.

### 2. No persistent price history table
- Price changes are stored as events with `payload->>'oldPrice'` and `payload->>'newPrice'`
- There is no `price_history` table with one row per (product, timestamp, price)
- Reconstructing price history requires replaying events in order -- expensive and error-prone
- **Fix:** Maintain a `competitor_product_price_history` table: `(product_id, price, compare_at_price, recorded_at)` updated on every scan. Would make trend queries trivial and enable "days at current price" stats.

### 3. `price_change_pct` not stored on events
- Every blog post stat requires computing `(newPrice - oldPrice) / oldPrice` at query time from JSONB
- This makes aggregation queries slow and forces re-parsing strings to numeric on every query
- **Fix:** Add `price_change_pct numeric` and `price_change_abs numeric` as computed columns on `competitor_events` at insert time. Trivial to backfill from existing payload data.

### 4. Sale duration is untracked
- We can only approximate sale duration by matching `sale_started` to `sale_ended` events for the same product
- Only 304 of 1,839 `sale_started` events have a matched `sale_ended` in the 15-day window (16.5% match rate)
- **Fix:** Add `sale_started_at` and `sale_ended_at` columns to `competitor_products`. Update `sale_started_at` when compare_at_price appears, null it out when it clears. Enables direct `AVG(sale_ended_at - sale_started_at)` queries.

### 5. No `is_catalog_wide` flag on price change events
- Determining whether a price change was catalog-wide requires a GROUP BY query across all events for that competitor+day
- This cannot be answered at event read time without a full table scan
- **Fix:** Add `is_catalog_wide boolean` or `concurrent_sku_count integer` on `competitor_events`. Populate it as a post-processing step after each monitoring run completes: count how many events fired for that competitor in that run, then back-fill the flag.

### 6. `promo_detected` events have low structured data
- `promo_detected` events often have `diffSummary` (AI-generated text) and `aiConfidence` but no structured fields for promo type, discount %, or affected products
- Only 537 events total -- likely undercounted relative to actual promotions happening
- **Fix:** Either parse the `diffSummary` to extract discount % and promo type at detection time, or add structured fields: `promo_type`, `discount_pct`, `affected_products[]`.

### 7. No competitor vertical / category tag
- No way to filter "all coffee competitors" or "all apparel competitors" without relying on `product_type` values (which are unreliable)
- The coffee analysis required a LIKE query on product_type which likely both over- and under-counts
- **Fix:** Add a `vertical` enum column on `competitors` table. Values: `coffee`, `apparel`, `supplements`, `candles`, `footwear`, `jewelry`, `other`. Populated via product_type heuristics on first sync, editable by users.

### 8. Day-of-week and timing data requires 60+ days to be useful
- Current 15-day window is dominated by the initial bulk ingestion spike (Jun 16-18)
- Any timing-based claim (when prices change, when sales happen) needs steady-state data from a longer window
- **Fix:** Once the dataset is 60+ days old, re-run the day-of-week and hour-of-day queries. These will become publishable blog stats.

### 9. No revenue / GMV data
- Cannot calculate "revenue impact" of competitor price gaps without sales data
- The originally proposed "12% revenue loss" claim is not supportable from this dataset alone
- **Fix:** If users connect sales data (Shopify Analytics, GA4), we could calculate correlation between competitor price gaps and conversion rate changes. A future integration play.

---

## Blog Post Fact-Check Reference

| Blog post | Stat used | Source | Status |
|-----------|-----------|--------|--------|
| shopify-competitor-price-change-noise | "87% sub-1%" | query1 magnitude bucket | ⚠ **Outdated** -- actual is 90.76% |
| inside-shopify-price-changes-data | "468,451 price change events" | date range query | ✅ |
| inside-shopify-price-changes-data | "511 Shopify stores" | date range query | ✅ |
| inside-shopify-price-changes-data | "178,623 products" | table row estimate | ✅ |
| inside-shopify-price-changes-data | "90.76% sub-1%" | magnitude bucket query | ✅ |
| inside-shopify-price-changes-data | "98.12% sub-5%" | magnitude bucket query | ✅ |
| inside-shopify-price-changes-data | "1.88% actionable (5%+)" | magnitude bucket query | ✅ |
| inside-shopify-price-changes-data | "55.4% increases, 44.6% decreases" | direction query | ✅ |
| inside-shopify-price-changes-data | "median change 0.17%" | direction query | ✅ |
| inside-shopify-price-changes-data | "98.9% catalog-wide" | catalog-wide query | ✅ |
| inside-shopify-price-changes-data | "23.23% on sale" | on-sale query | ✅ |
| dtc-coffee-brand-pricing-data | "5,412 coffee products" | coffee query | ✅ |
| dtc-coffee-brand-pricing-data | "median $21.99, avg $43.85" | coffee query | ✅ |
| dtc-coffee-brand-pricing-data | "2.8% on sale" | coffee query | ✅ |
| dtc-coffee-brand-pricing-data | "7.3% are 5%+" | coffee price change query | ✅ |
| dtc-coffee-brand-pricing-data | "4x more likely to have 5%+ move" | derived (7.3% / 1.88%) | ✅ |
| dtc-coffee-brand-pricing-data | "8x less likely to discount" | derived (23.2% / 2.8%) | ✅ |
| shopify-dtc-two-tribes-discounting | "46.6% never discount" | discounting behavior query | ✅ |
| shopify-dtc-two-tribes-discounting | "17.8% permanent sale mode" | discounting behavior query | ✅ |
| shopify-dtc-two-tribes-discounting | "42% of sales are 20-30% off" | sale discount depth query | ✅ |
| shopify-competitor-sales-last-24-hours | "1,839 sale_started events" | event type breakdown | ✅ |
| shopify-competitor-sales-last-24-hours | "median 0.7 days" | sale duration query | ⚠ Low sample (304 matched pairs) |
| shopify-competitor-sales-last-24-hours | "29% of sales are 50%+ off" | sale discount depth query | ✅ |
| shopify-price-changes-automated | "98.9% catalog-wide" | catalog-wide query | ✅ |
| shopify-price-changes-automated | "100 single-SKU change days" | catalog-wide query | ✅ |
| shopify-competitor-product-churn | "9,372 products added" | event type breakdown | ✅ |
| shopify-competitor-product-churn | "664 launched then removed (7.1%)" | product churn query | ✅ |
| shopify-competitor-product-churn | "median 1.5 days to restock" | restock time query | ✅ |
| shopify-competitor-price-increases-data | "55.4% increases, 44.6% decreases" | direction query | ✅ |
| shopify-competitor-price-increases-data | "avg increase 0.92%" | direction query | ✅ |
| shopify-permanent-sale-compare-at-price | "23.23% on sale" | on-sale query | ✅ |
| shopify-permanent-sale-compare-at-price | "17.8% permanent sale mode" | discounting behavior query | ✅ |
| shopify-permanent-sale-compare-at-price | "46.6% never discount" | discounting behavior query | ✅ |

---

## Stats to Recheck When Dataset Matures (60+ Days)

- Day-of-week price change distribution
- Hour-of-day price change distribution
- Out-of-stock day-of-week pattern
- Sale duration (needs more matched pairs -- currently only 304 of 1,839 resolved)
- "New products added per month" (only one month of data so far)
- Product churn rate (may normalize once initial bulk ingestion stabilizes)

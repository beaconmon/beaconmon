# Competitor Intelligence: JTBD Map and Expansion Strategy

Status: decided. This document records the outcome of the platform-vs-wedge debate so it is not re-litigated. The product stays a competitor intelligence tool for eCommerce. The thinness of Shopify `products.json` data is a coverage problem, solved by the extraction fallback ladder, not a reason to pivot.

## ICP

DTC brands at $50k to $1M/mo GMV in commoditized niches: coffee, supplements, skincare, apparel, pet, candles. This matches the existing outreach list of ~300 Shopify prospects. These merchants compete on price, promo timing, and assortment against a handful of named rivals they already watch by hand.

## JTBD map

Grouped by frequency, urgency, and willingness to pay.

### Weekly operational jobs (high WTP anchor)

These are the jobs the product is priced against.

1. "Know when a competitor changes price or promo on products that compete with mine, and decide whether to respond." The Decision Layer (CompetitorDecision: ignore, match, counter, leapfrog) already models the response half of this job.
2. "Don't get undercut on my hero SKUs without knowing." Hero SKUs are 5 to 20 products that drive most revenue. This is why the fallback contract tracks a bounded set of hero product pages rather than full catalogs.

### Periodic jobs (weekly to monthly)

3. Promo planning with competitor context: "before I plan my sale, show me what competitors ran recently."
4. Launch awareness: "what did they just add?" Served by product_added events, and for fallback-tier competitors by weekly sitemap diffs.
5. Assortment drift: "are they moving into my category or out of it?"

### Insurance jobs (retention value, low standalone WTP)

6. Store uptime and health. This is the existing monitoring DNA. Nobody switches tools for it, but it makes the product sticky once installed.
7. Competitor stockout opportunities: "their bestseller is out of stock, push yours." Served by out_of_stock events with significance scoring.

### Jobs explicitly NOT pursued now

| Job | Why not |
|---|---|
| Generic revenue analytics | Owned by funded incumbents (Triple Whale, Polar, Lifetimely) and increasingly Shopify native. No wedge. |
| Conversion leak detection | Requires on-site instrumentation, a different install motion and trust bar. Solo-founder sales motion mismatch. |
| Retention and LTV insights | Same incumbents, plus requires order data depth we do not have in Phase 1. |
| AI growth recommendations | Credibility requires the analytics base we are not building. Noise risk to the digest. |

## The join thesis

Own-store Shopify data (Phase 2, custom-app token paste) exists to rank and filter competitor events by overlap with the merchant's catalog and revenue. It is not a step toward becoming an analytics product. Features that get stronger with both datasets:

- Price-position report: where each of my hero SKUs sits against tracked competitor equivalents.
- Assortment overlap: which competitor products compete with mine at all (powers event filtering).
- Undercut alerts: competitor price drop below my price on an overlapping product, the highest-signal event the product can emit.
- Stockout opportunity alerts: competitor out of stock on an overlapping product I have in stock.

## Feature hierarchy

1. **Core (exists or in flight):** extraction fallback ladder, intelligence digest, Decision Layer.
2. **Strong v1:** own-catalog join, price-position report.
3. **Expansion (trigger-gated, see below):** own-store digest content (sales summaries, store health narrative).
4. **Enterprise (deferred):** multi-store and agency views, API export.

## Positioning statement

Shopify-first: "Beaconmon watches your competitors' prices, promos, launches, and stockouts, and tells you which ones actually threaten your revenue, even when competitors aren't on Shopify."

## Data tiers and the honesty policy

Coverage varies by competitor and the product says so instead of papering over it.

| Tier | Source | What is tracked |
|---|---|---|
| `full_catalog` | Shopify products.json | Entire catalog, hourly |
| `selected_products` | JSON-LD on tracked PDPs (sitemap-discovered or merchant-picked) | Up to 50 hero product pages, daily, plus weekly sitemap diff for launches |
| `limited` | None usable | Tracked pages only (CompetitorPage content monitoring); shown as "limited access" |

Anti-bot policy: polite fetching only. Honest UA (BeaconMon/1.0), backoff, caching, sequential fetches with jitter, daily cadence for fallback tiers. A 403 or 429 marks the competitor `limited` rather than retrying hard. No proxies or scraping APIs in Phase 1. Blocked competitors are shown honestly in the UI and digests.

## Expansion triggers (pre-made decision)

Commit to competitor intel, but instrument it. The coverage report script (`scripts/competitor-coverage-report.ts`) is the measurement tool.

| Metric | Threshold | Window | Decision if tripped |
|---|---|---|---|
| Median competitor event rate | < 1 medium+ event/week despite > 80% access | ~4 weeks across 20+ competitors | Data is accessible but boring: build own-store digest content (Expansion tier), not a pivot |
| % competitors with working products.json or JSON-LD | < 50% | Same window | Coverage problem persists: invest further in extraction, not in new categories |

Baseline numbers: run the coverage report and record results here.

<!-- BASELINE: pending first run of scripts/competitor-coverage-report.ts -->

## Risks

1. **Unmeasured event rate (boring-data risk).** Commoditized niches may change prices less often than assumed. Mitigation: the expansion trigger above, measured, not vibes.
2. **Scraping arms race creep.** Pressure to add proxies/headless browsers when stores block us. Mitigation: the honesty policy is a product feature (limited-access labeling), and Playwright is structurally excluded (single VPS RAM budget).
3. **Single-VPS request budget.** Fallback tiers multiply fetches. Mitigation: 50-URL cap per competitor, daily cadence, sequential with jitter.
4. **Outreach pitch unvalidated.** The JTBD map is reasoned, not yet evidenced by paying merchants. Mitigation: the ~300-prospect outreach is the test; coverage report output doubles as outreach prioritization.

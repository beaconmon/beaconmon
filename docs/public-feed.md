# Spec: Public "What Changed This Week" feed

Status: design, not yet built (2026-06-22)

## What this is

Free, public, recurring content built as a byproduct of the catalog-sync and
price-event pipeline already running. It funnels Shopify merchants into
beaconmon. Two primary surfaces:

- **New Product Launches Today** — the single best signal. A product appearing
  in a store's catalog with a recent Shopify `published_at` is a launch. Clean,
  daily-fresh, genuinely not free anywhere else.
- **What N Shopify Brands Changed This Week** — the "State of" roundup.
  Inherently recurring, so it compounds via SEO and the newsletter.

Secondary surfaces are filtered views of the same data: New Promotions, Price
Changes This Week (>= 5% only).

This stacks with the changelog play and the core product into one funnel: a
merchant lands on the weekly roundup, sees their category moving, wants to watch
their own competitors, signs up.

## Core architectural decision: a team-free canonical layer

The entire existing pipeline is tenant-scoped. Every `competitor_products` and
`competitor_events` row carries `teamId` + `competitorId`. The same store
tracked by 3 teams is 3 `Competitor` rows, 3 catalogs, 3 event streams.

A public feed cannot read those tables directly without (a) violating the
tenant-isolation hard rule and (b) showing the same launch 3 times. So the
public feed gets its own deduplicated, team-stripped layer, populated by a
rollup job. The per-team tables are unchanged; they remain the private product.

```
 per-team (private, teamId-scoped)          public (team-free, served publicly)
 +---------------------+                    +---------------+
 | competitor_products |--+   rollup job    | public_stores |
 | competitor_events   |--+--------------->  | public_changes|
 +---------------------+  |  (dedup by       +---------------+
   (N teams -> N rows        normalized domain)
    for same store)
```

Dedup key is the **normalized domain** (lowercase, strip scheme, strip `www.`).
Many `Competitor` rows collapse to one `public_stores` row. The public read path
never touches a `teamId`-scoped table, so the tenant-isolation rule stays intact
and no team is ever shown which other team tracks whom.

## Coverage model: house-owned allowlist on the existing engine

Decided after weighing K-anonymity vs curation. At current scale most of the 449
ready competitors were added by the founder during concierge outreach, not by
independent paying teams, so a "tracked by >= 3 teams" gate would publish almost
nothing and the feed would launch empty. Curation also solves the privacy
concern better at this stage: the risk K-anonymity guards against is
republishing one customer's secret niche competitor, and an allowlist simply
does not list it.

The seeding mechanism unifies "allowlist" with "reuse the pipeline":

> Create a **house-owned team** (a system tenant). Add the allowlisted brands as
> `full_catalog` competitors under it. Let the existing `shopify-feed-worker`
> crawl them.

Those stores then emit the same `product_added` / `published_at` /
`price_changed` / `promo_detected` events through the pipeline already running.
Benefits:

- No new crawler, no Playwright, no new RAM profile (respects the single-VPS,
  HTML-only constraints).
- Coverage is controlled and decoupled from which customers track what.
- Launches work immediately once `published_at` is captured, because those
  catalogs are crawled directly.
- Marginal load: ~50-200 curated brands on top of 171k products already pulled.

The allowlist is a house watchlist on the existing engine. K-anonymity is added
later as an automated expansion path (see Publish gate).

## Data model

### Upstream change (enables Tier-1 launches)

`published_at` is returned by Shopify `products.json` but not currently
captured. It is the only edit to the existing pipeline; everything else is
additive.

- `ShopifyProduct` (`packages/checker/src/storefront.ts`): add
  `published_at: string` (and optionally `created_at`).
- `ExtractedProduct` + `shopifyToExtracted()`
  (`apps/workers/process-catalog-sync-job.ts`): pass it through. Shopify path
  only; fallback tiers (JSON-LD, HTML) leave it null.
- `CompetitorProduct`: add `publishedAt DateTime? @map("published_at")`, written
  in `upsertProduct`.

Why launches source from `publishedAt` and not `product_added` events:
`product_added` fires relative to when each team first crosses baseline, is
baseline-suppressed on a store's first sync, and gets different (or zero)
timestamps across teams for the same product. `published_at` is the real launch
date and sidesteps all of that.

### `public_stores` — canonical, deduped store registry

```prisma
model PublicStore {
  id             String    @id @default(cuid())
  domain         String    @unique          // normalized: lowercase, no scheme, no www
  name           String                     // best-known brand name
  platform       String                     // 'shopify' | 'woocommerce' | 'other'
  isPublishable  Boolean   @default(false)  // gate, see below
  category       String?                    // mode of product_type, nullable
  productCount   Int       @default(0)      // denormalized, last rollup
  activityScore  Float     @default(0)      // proxy ONLY, never "growth"
  lastChangeAt   DateTime? @map("last_change_at")
  firstSeenAt    DateTime  @default(now()) @map("first_seen_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  changes        PublicChange[]

  @@index([isPublishable, lastChangeAt(sort: Desc)])
  @@map("public_stores")
}
```

### `public_changes` — denormalized, publishable feed items

One row per deduped real-world change. No `teamId`, no `competitorId`.
Self-contained so the read path needs no join to private tables.

```prisma
model PublicChange {
  id           String   @id @default(cuid())
  storeId      String   @map("store_id")
  kind         String                       // 'launch' | 'price_drop' | 'price_rise' | 'promo' | 'restock' | 'stockout'
  externalId   String   @map("external_id") // store product external id (or page id for promo)
  occurredAt   DateTime @map("occurred_at") // launch: published_at; else earliest event detectedAt across teams
  weekBucket   String   @map("week_bucket") // ISO 'YYYY-Www', roundup grouping + cheap index
  title        String
  handle       String?
  productUrl   String?  @map("product_url")
  imageUrl     String?  @map("image_url")
  payload      Json     @default("{}")      // {oldPrice,newPrice,pct,currency,compareAt,...}
  significance String?                      // carried from event; null = medium

  store        PublicStore @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([storeId, kind, externalId, weekBucket]) // idempotent, self-deduping rollup upsert
  @@index([kind, occurredAt(sort: Desc)])            // "launches today"
  @@index([weekBucket, kind])                        // "what changed this week"
  @@map("public_changes")
}
```

The `@@unique([storeId, kind, externalId, weekBucket])` makes the rollup
idempotent and self-deduping: N teams' duplicate events for the same
product-change in the same week upsert into one row.

## Publish gate

`isPublishable` defaults false.

- **v1 (launch):** driven by the curated allowlist (the house-owned watchlist).
  You only publish brands you deliberately chose, all public storefronts.
- **v2 (expansion):** also build the
  `distinctTeamCount(domain) >= 3` path and `OR` it in behind a flag. Flip it on
  as real customer overlap accumulates so the feed auto-expands without a
  rewrite. Honor a domain opt-out list in both versions.

## The rollup job

**Placement:** runs on the scheduler singleton (scheduler must stay one replica)
which enqueues a single `public-feed-rollup` job, processed by a worker. Workers
use `DATABASE_URL_POOLED`. Worker repositories are exempt from the `teamId`-first
rule, so the cross-team reads here are allowed by design.

**Cadence:** daily (launches are daily-fresh). The weekly roundup is a query over
`week_bucket`, not a separate job.

**Window:** `now - 8 days` (1-day overlap so nothing is missed between runs;
idempotent upsert makes reprocessing safe).

```
1. Build domain -> PublicStore map. Upsert stores from distinct Competitor
   domains seen in the window. Skip stores where isPublishable = false.

2. LAUNCHES (Tier 1) - source: competitor_products, NOT events.
   SELECT distinct on (normalized domain, externalId)
     FROM competitor_products
     WHERE source = 'shopify_feed' AND publishedAt >= windowStart
   -> upsert PublicChange { kind: 'launch', occurredAt: publishedAt }

3. PRICE / PROMO / STOCK - source: competitor_events.
   SELECT FROM competitor_events
     WHERE detectedAt >= windowStart
       AND type IN ('price_changed','sale_started','sale_ended',
                    'promo_detected','out_of_stock','back_in_stock')
   Group by (domain, productExternalId, type, weekBucket).
   occurredAt = earliest detectedAt across teams in the group.
   - price_changed: re-assert >= 5% usable filter from payload old/newPrice;
     split into price_drop / price_rise by sign. (Already applied at write time
     via isMaterialPriceMove, but re-assert so a future threshold change cannot
     leak sub-threshold history into public.)
   - sale_started / promo_detected -> 'promo'
   - out_of_stock -> 'stockout', back_in_stock -> 'restock'
   -> upsert PublicChange.

4. Recompute per-store denormalized fields: productCount, lastChangeAt,
   category (mode of product_type), activityScore.

5. Prune PublicChange older than the public retention window.
```

## Read path (the feeds)

Pure reads against the two public tables, ISR like the status pages (never hit
Postgres on the hot path beyond the ISR revalidate).

- **New Product Launches Today** — `kind = 'launch' ORDER BY occurredAt DESC`
  for today.
- **What N Brands Changed This Week** — group by `weekBucket`, count by `kind`,
  surface top movers. Feeds newsletter + SEO.
- **New Promotions / Price Changes This Week** — filter by `kind`. The price feed
  only ever shows `price_drop` / `price_rise` (already >= 5%).

## The "fastest growing" trap

`activityScore` = launch velocity + restock frequency over trailing 30d. It is an
activity proxy, surfaced only as "Most active this week," never "fastest
growing." No `growth` field, no copy implying sales or traffic. Tier-2 surfaces
(`stockout`, bundle changes) ship explicitly labeled "directional."

## Retention

The public archive has its own window (recommend 90 days of `public_changes`,
stores kept indefinitely). It is decoupled from team plan retention: a Free-plan
team's 7-day retention must not shrink the public archive, and public never
extends a team's private retention. `check_results` partition and retention rules
are untouched.

## Build sequence

1. Add `published_at`: `ShopifyProduct` -> `ExtractedProduct` ->
   `CompetitorProduct` (migration + `upsertProduct`).
2. Migration for `public_stores` + `public_changes`.
3. Domain-normalize util + worker repo (`publicFeedRepository`, no `teamId`).
4. House-owned team + allowlist seeding (brands added as `full_catalog`
   competitors, crawled by the existing `shopify-feed-worker`).
5. `public-feed-rollup` worker + scheduler enqueue (singleton).
6. Public read repo + ISR pages.
7. Backfill: one-time rollup over existing `competitor_products.publishedAt` once
   captured (launches sparse until publish dates accumulate; price/promo backfill
   from existing events works immediately).

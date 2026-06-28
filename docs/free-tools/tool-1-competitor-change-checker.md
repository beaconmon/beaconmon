# Tool 1: Shopify Competitor Change Checker

**Priority:** 1 (build first)
**Slug:** `/tools/shopify-competitor-changes`
**Effort:** 1-2 days
**Backend required:** Yes

## What it does

A free, one-time scan of a competitor's Shopify store that returns a point-in-time snapshot and then calls Beaconmon's existing monitoring pipeline to check for any recent changes logged in the database. The key differentiator vs. every existing spy tool: this shows *what changed* (copy, prices, promotions, product additions), not just the static current state.

If the domain has been monitored before (by any Beaconmon team), surface the last 3-5 change events from the database. If it has not been monitored before, show a rich static snapshot (reusing the existing Shopify catalog scraper) and upsell continuous monitoring as "the only way to see changes over time."

This tool IS the product demo. Someone who uses it has already demonstrated purchase intent.

## Target keywords

- `shopify competitor change tracker free`
- `free shopify competitor monitor`
- `track changes on competitor shopify store`
- `shopify price change checker free`
- `what changed on shopify store`

## Competitive gap

Every existing Shopify spy tool (ShopScan, Koala Inspector, PPSPY, SellerCenter) shows: apps installed, theme, revenue estimates, best-selling products. None of them show *what changed on this store recently*. That is Beaconmon's specific capability. This tool is the only free tool in the market with that angle.

## Files to create

```
apps/web/app/(marketing)/tools/shopify-competitor-changes/page.tsx
apps/web/components/tools/CompetitorChangesTool.tsx
apps/web/app/api/tools/competitor-changes/route.ts
apps/web/lib/tools/competitor-changes.ts
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

## API contract

### Request
`POST /api/tools/competitor-changes`

```json
{ "url": "allbirds.com" }
```

### Response (happy path - domain has prior monitoring history)
```json
{
  "ok": true,
  "domain": "allbirds.com",
  "hasHistory": true,
  "snapshot": {
    "productCount": 142,
    "onSaleCount": 8,
    "currency": "USD",
    "takenAt": "2026-06-28T10:00:00Z"
  },
  "recentChanges": [
    {
      "detectedAt": "2026-06-27T14:22:00Z",
      "type": "price_drop",
      "summary": "Price dropped on 3 products",
      "detail": "Trail Runner SWT: $145 -> $109 (25% off)"
    },
    {
      "detectedAt": "2026-06-25T09:10:00Z",
      "type": "promo_launched",
      "summary": "Sale section launched",
      "detail": "12 products moved to sale with compare-at prices"
    }
  ],
  "cached": false
}
```

### Response (happy path - no prior history)
```json
{
  "ok": true,
  "domain": "brandnew-store.com",
  "hasHistory": false,
  "snapshot": {
    "productCount": 67,
    "onSaleCount": 0,
    "currency": "USD",
    "takenAt": "2026-06-28T10:00:00Z"
  },
  "recentChanges": [],
  "cached": false
}
```

### Response (not Shopify or unreachable)
```json
{ "ok": false, "reason": "not_shopify" }
{ "ok": false, "reason": "unreachable" }
```

## Backend implementation notes

**`apps/web/lib/tools/competitor-changes.ts`**

1. Call `buildSnapshot(domain)` from `@/lib/tools/snapshot` to get the current Shopify catalog state (reuse entirely, no new scraping needed).

2. Query the database for recent content change events on this domain. Look in the `check_results` table (or wherever content change events are stored) for the last 7 days. Join through monitors where `url LIKE '%domain%'`. Return up to 5 change events. If none found, return `hasHistory: false` and empty `recentChanges`.

3. Map raw DB rows to the `recentChanges` shape. The `type` field should be one of: `price_drop`, `promo_launched`, `product_added`, `product_removed`, `content_change`. Derive it from available data (e.g. if `on_sale_count` increased, it is `promo_launched`; if new products appeared, it is `product_added`).

4. This is a **public, unauthenticated** route. Do not expose private team data. Only expose aggregate change summaries, not which team was monitoring the store.

**`apps/web/app/api/tools/competitor-changes/route.ts`**

Follow `apps/web/app/api/tools/snapshot/route.ts` exactly for:
- SSRF guard: `isHostnameSafe(domain)` before any fetch
- Rate limiting: burst (5 req/60s) + hourly (20 req/3600s), keyed by client IP
- Redis cache: `tool:competitor-changes:${domain}`, TTL 2 hours for success, 30 min for failures
- Error handling: `AppError` / `ValidationError` pattern
- `export const runtime = 'nodejs'`

## UI state machine

The client component (`CompetitorChangesTool.tsx`) has 4 states:

```
idle -> loading -> success (hasHistory: true)
                -> success (hasHistory: false)  -- no prior data, show snapshot + upsell
                -> error
```

**`idle` state:** URL input + "Check for changes" button. Example domains: `gymshark.com`, `brooklinen.com`, `allbirds.com`.

**`loading` state:** Spinner + "Scanning store and checking change history..."

**`success (hasHistory: true)` state:**
- Header strip: domain, "Shopify", snapshot timestamp
- Stat row: product count, items on sale, "Last change detected X days ago"
- Change timeline: list of `recentChanges` with type icon (price tag, megaphone, plus, minus), date, summary text
- Conversion seam: "This is the last 7 days. Beaconmon catches changes the moment they happen." + CTA button

**`success (hasHistory: false)` state:**
- Header strip: domain, "Shopify", snapshot timestamp
- Stat row: product count, items on sale, in stock
- Blurred placeholder where the change timeline would be (3 fake blurred rows)
- Message: "No change history yet. Start monitoring this store to capture future changes." + CTA
- Show any currently-on-sale products (reuse SnapshotResult's on-sale list)

**`error` state:** Same as SnapshotTool error styling.

## Page structure

Follow `apps/web/app/(marketing)/tools/shopify-competitor-snapshot/page.tsx` exactly for layout. Adapt copy:

**Hero h1:** "See what changed on any Shopify competitor store"

**Meta description:** "Free tool to check if a Shopify competitor changed their prices, launched a promotion, or added products. No signup, no app install."

**Canonical:** `https://beaconmon.com/tools/shopify-competitor-changes`

**Two-column comparison section:**
- Left (free): "What a one-time check shows" -- current price snapshot, active promotions, product count, catalog sample
- Right (monitoring): "What ongoing monitoring adds" -- instant alert when a price drops, promo history over weeks, new product launch alerts, weekly intelligence digest

**How it works steps:**
1. Paste a competitor's Shopify store URL
2. Beaconmon reads the store's public catalog and checks our change database
3. If we have history on this store, you see recent price drops, promo launches, and product changes
4. Sign up to start capturing future changes with instant alerts

**FAQ (5 questions, use FAQPage schema):**
- "Can I see what changed on a Shopify store?" -- Yes, if Beaconmon has history on that store from any prior monitoring. New stores show a current snapshot.
- "Is this free?" -- The one-time check is completely free with no signup. Continuous monitoring is a paid plan with a free tier.
- "What kinds of changes does it detect?" -- Price drops, promotional markdowns, new products added, product removals, and content updates on key pages.
- "Does it work on non-Shopify stores?" -- This tool is Shopify-specific. Beaconmon monitoring supports WooCommerce and any website via CSS selectors.
- "How is this different from other Shopify spy tools?" -- Most spy tools show static information about a store: its theme, installed apps, or revenue estimates. This tool focuses on what changed over time, which is the intelligence that affects your pricing and promotion decisions.

**Internal links section:**
- `/shopify-competitor-monitoring`
- `/competitor-price-tracking`
- `/tools/shopify-competitor-snapshot`
- `/competitor-promotion-monitoring`

**Bottom CTA:** "Your competitors are changing prices and running promos right now. Beaconmon tells you the moment it happens."

## Add to hub page

In `apps/web/app/(marketing)/tools/page.tsx`, add to the `TOOLS` array:
```ts
{
  href: '/tools/shopify-competitor-changes',
  name: 'Shopify Competitor Change Checker',
  blurb: 'Check if a competitor recently dropped prices, launched a sale, or added products. See their change history in seconds.',
  tag: 'Shopify',
},
```

## Rate limits

```ts
const RATE_BURST  = { limit: 5,  windowSec: 60   };
const RATE_HOURLY = { limit: 20, windowSec: 3600  };
```

## Redis cache keys

```
tool:competitor-changes:${domain}   TTL: 7200s (2h) on success, 1800s on failure
```

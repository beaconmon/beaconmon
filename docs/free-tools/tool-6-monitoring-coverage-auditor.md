# Tool 6: Store Monitoring Coverage Auditor

**Priority:** 6
**Slug:** `/tools/monitoring-coverage`
**Effort:** 2-3 days
**Backend required:** Yes

## What it does

"Which pages of your store are you not monitoring?" Enter a store URL and the tool crawls the critical page types (homepage, a collection, a product page, cart, checkout entry point) and returns a coverage map showing which are up/healthy and which are unmonitored or broken. Each failing page gets a direct "Add to Beaconmon" deep link.

The framing flips the standard monitoring pitch from "should I monitor?" to "what are you not covering?" which is more concrete and more alarming. Most store owners who set up basic monitoring only watch their homepage -- this tool shows them all the pages that can break and aren't being watched.

## Target keywords

- `shopify monitoring coverage checker`
- `which shopify pages should I monitor`
- `ecommerce website monitoring audit`
- `shopify page monitoring gaps`
- `critical pages to monitor shopify store`

## Competitive gap

No tool in the market shows a store owner a coverage map of their critical pages. Existing tools (UptimeRobot, Beaconmon itself, Velprove) let you add monitors, but none tell you which pages you should be monitoring. This creates a natural pre-sale conversation: the tool shows the gaps, Beaconmon fills them.

## Files to create

```
apps/web/app/(marketing)/tools/monitoring-coverage/page.tsx
apps/web/components/tools/CoverageAuditor.tsx
apps/web/app/api/tools/coverage-audit/route.ts
apps/web/lib/tools/coverage-check.ts
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

## API contract

### Request
`POST /api/tools/coverage-audit`

```json
{ "url": "allbirds.com" }
```

### Response
```json
{
  "ok": true,
  "domain": "allbirds.com",
  "platform": "shopify",
  "checkedAt": "2026-06-28T10:00:00Z",
  "pages": [
    {
      "id": "homepage",
      "label": "Homepage",
      "url": "https://allbirds.com/",
      "status": "up",
      "httpStatus": 200,
      "responseMs": 312,
      "critical": true,
      "note": null
    },
    {
      "id": "collection",
      "label": "Collections page",
      "url": "https://allbirds.com/collections",
      "status": "up",
      "httpStatus": 200,
      "responseMs": 445,
      "critical": true,
      "note": null
    },
    {
      "id": "product",
      "label": "Product page (sample)",
      "url": "https://allbirds.com/products/mens-tree-runners",
      "status": "up",
      "httpStatus": 200,
      "responseMs": 398,
      "critical": true,
      "note": null
    },
    {
      "id": "cart",
      "label": "Cart",
      "url": "https://allbirds.com/cart",
      "status": "up",
      "httpStatus": 200,
      "responseMs": 290,
      "critical": true,
      "note": null
    },
    {
      "id": "checkout",
      "label": "Checkout entry",
      "url": "https://allbirds.com/checkouts",
      "status": "redirect",
      "httpStatus": 302,
      "responseMs": 180,
      "critical": true,
      "note": "Checkout redirects to Shopify's hosted checkout. This is normal. Monitor the entry point URL."
    }
  ],
  "summary": {
    "total": 5,
    "up": 4,
    "redirect": 1,
    "down": 0,
    "error": 0
  },
  "cached": false
}
```

**`status` values:** `"up"` (2xx), `"redirect"` (3xx), `"down"` (4xx/5xx), `"error"` (timeout/connection refused), `"skipped"` (could not determine URL).

## Backend implementation notes

**`apps/web/lib/tools/coverage-check.ts`**

The challenge is discovering the right URLs for each page type without requiring any credentials. For Shopify stores, this is solvable:

1. **Homepage:** `https://${domain}/` -- always the same.

2. **Collections:** `https://${domain}/collections` -- standard Shopify path. If this 404s, try `https://${domain}/collections/all`.

3. **Product page (sample):** Use the Shopify Products JSON feed (`https://${domain}/products.json?limit=1`) to get one product handle, then construct `https://${domain}/products/${handle}`. If the store is not Shopify or the feed is private, mark as `skipped`.

4. **Cart:** `https://${domain}/cart` -- standard Shopify path.

5. **Checkout:** `https://${domain}/checkouts` -- Shopify's checkout entry. Returns a 302 redirect to a session-specific URL. That is normal. Check that the redirect responds (don't follow to the session URL -- just verify the entry point is alive).

Run all 5 checks in parallel with `Promise.allSettled`. Set a 10s timeout per check. Use SSRF guard on the base domain once before any fetches (all URLs derive from the same validated domain, so one guard call is sufficient).

Do not attempt to crawl or discover URLs beyond this fixed list. Do not follow links. The fixed 5-page list is the MVP scope.

**`apps/web/app/api/tools/coverage-audit/route.ts`**

- Rate limits: burst 3/60s (lower -- this makes 5 outbound connections), hourly 10/3600s
- Redis cache: `tool:coverage:${domain}`, TTL 3 minutes
- SSRF guard on normalized domain
- `export const runtime = 'nodejs'`
- Timeout at 20s total (the 5 parallel checks each have 10s individual timeouts)

## UI state machine

States: `idle`, `loading`, `result`, `error`

**`idle`:** URL input + "Audit coverage" button. Examples: `gymshark.com`, `allbirds.com`.

**`loading`:** Spinner + "Checking 5 critical pages..." with a subtle animated progress indicator (just a pulsing bar, not a real progress tracker since the requests are parallel).

**`result`:** Coverage map (see below).

**`error`:** Error card.

## Result view layout

**Header:**
- Domain, platform badge ("Shopify"), checked-at timestamp
- Summary: "5 pages checked. 4 up, 0 down." or "1 page has an issue."

**Coverage map (5 rows):**
Each row shows:
- Status icon: green dot (up), amber arrow (redirect), red X (down), grey dash (skipped)
- Page label and URL (truncated)
- Response time in ms (for up/redirect)
- HTTP status badge
- Note (if any, e.g. the checkout redirect explanation)

**"Not yet monitored" framing:**
Below the coverage map, a callout:
"These are the pages where your store can fail without you knowing. Add them to Beaconmon to get alerted within 2 minutes of any issue."

Then a list of each page with an "Add to monitoring" button. Each button links to `/sign-up?ref=coverage-audit&pages=homepage,collection,product,cart,checkout` -- the query params prefill which monitors to create during onboarding (future enhancement, the ref is enough for now).

**If any page is `down`:**
Show a red alert bar at the top: "One or more pages returned an error. Your store may have an active issue." with a more urgent CTA.

## Page structure

**Hero h1:** "Which pages of your Shopify store are actually being monitored?"

**Subhead:** "Most stores only monitor their homepage. Check your cart, product pages, and checkout entry point too. One broken page can kill your conversion rate silently."

**Meta description:** "Free monitoring coverage audit for Shopify stores. Check if your homepage, collections, product pages, cart, and checkout entry are healthy and tell you which pages need monitoring."

**Canonical:** `https://beaconmon.com/tools/monitoring-coverage`

**"Why critical pages matter" section (3 examples):**
- Product page returns 404 after a theme update -- customers see an error, not the product. You don't know until your conversion rate tanks.
- Cart breaks after a Shopify app conflict -- customers add items but can't checkout. You find out from a customer complaint, not an alert.
- Collections page goes blank after a tag change -- your navigation is broken. Search engines start deindexing the collection.

**"Pages you should monitor" explainer:**
Simple table:
| Page | Why it matters | Shopify URL pattern |
|---|---|---|
| Homepage | First impression, SEO landing page | `yourstore.com/` |
| Collections | Navigation, SEO category pages | `yourstore.com/collections` |
| Product page | Direct revenue, SEO | `yourstore.com/products/[handle]` |
| Cart | Conversion critical | `yourstore.com/cart` |
| Checkout | Revenue critical | `yourstore.com/checkouts` |

**FAQ (5 questions):**
- "Which pages should I monitor on my Shopify store?" -- At minimum: your homepage, one collection page, one product page, the cart, and the checkout entry point. These are the pages where failures directly cost you revenue.
- "How do I know if my Shopify cart is broken?" -- Without monitoring, you typically find out when a customer contacts you or when you notice a sudden drop in orders. The coverage audit above checks your cart page directly and tells you if it is responding.
- "Can a Shopify product page go down without the homepage going down?" -- Yes. Shopify apps, theme liquid errors, and specific product template issues can take down individual product pages while the homepage remains healthy. This is why monitoring only the homepage is insufficient.
- "How often do individual Shopify pages break?" -- Most Shopify outages are not platform-wide. They are localized to specific pages, often triggered by theme updates, app installs, or third-party script errors. A homepage-only monitor misses most of these.
- "Does Beaconmon monitor individual Shopify pages?" -- Yes. You can set up separate monitors for each critical page, with 1-minute check intervals and instant alerts via email or Slack.

**Internal links:**
- `/tools/shopify-uptime-test`
- `/ecommerce-website-monitoring`
- `/ecommerce-uptime-monitoring-guide`
- `/pricing`

**Bottom CTA:** "One broken page can silently drain your conversion rate for hours. Beaconmon watches every critical page, every minute."

## Add to hub page

```ts
{
  href: '/tools/monitoring-coverage',
  name: 'Store Monitoring Coverage Auditor',
  blurb: 'Check which critical pages of your Shopify store are healthy and see exactly which ones you should be monitoring.',
  tag: 'Audit',
},
```

## Rate limits

```ts
const RATE_BURST  = { limit: 3,  windowSec: 60   };   // lower: 5 outbound connections per request
const RATE_HOURLY = { limit: 10, windowSec: 3600  };
```

## Redis cache

```
tool:coverage:${domain}   TTL: 180s (3 minutes)
```

## Implementation warning

This tool makes the most outbound connections of all the tools (5 per request). Keep the individual timeouts tight (8s each), run all 5 in parallel with `Promise.allSettled`, and never throw if one fails -- just mark it as `"error"`. A broken check on one page should not fail the whole audit.

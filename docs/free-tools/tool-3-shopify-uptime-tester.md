# Tool 3: Shopify Uptime Instant Tester

**Priority:** 3
**Slug:** `/tools/shopify-uptime-test`
**Effort:** 2-3 days
**Backend required:** Yes

## What it does

An instant, no-signup, no-install uptime test for any Shopify store URL. Enter a store domain and get: response time from 3 geographic regions, HTTP status code, SSL certificate status and expiry, redirect chain health, and a comparison against Shopify performance benchmarks.

## Target keywords

- `is my shopify store down`
- `shopify uptime test`
- `test shopify store uptime`
- `shopify store down checker`
- `shopify website not loading`
- `shopify store response time test`

## Competitive gap

The Shopify-specific uptime monitoring market is entirely app-based: Uptime app (getuptime.co), Blimey, Shopwarden, Velprove all require installing a Shopify app or creating an account. No pure-web tool exists that takes a URL and immediately returns a multi-location uptime result without any install. This is the gap. Someone Googling "is my shopify store down" is panicking -- they need an answer in 5 seconds, not an app install flow.

## Files to create

```
apps/web/app/(marketing)/tools/shopify-uptime-test/page.tsx
apps/web/components/tools/UptimeTester.tsx
apps/web/app/api/tools/uptime-test/route.ts
apps/web/lib/tools/uptime-check.ts
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

## API contract

### Request
`POST /api/tools/uptime-test`

```json
{ "url": "allbirds.com" }
```

### Response (store is up)
```json
{
  "ok": true,
  "domain": "allbirds.com",
  "status": "up",
  "checks": [
    { "region": "us-east", "label": "New York", "httpStatus": 200, "responseMs": 312, "ok": true },
    { "region": "eu-west", "label": "London",   "httpStatus": 200, "responseMs": 489, "ok": true },
    { "region": "ap-east", "label": "Singapore","httpStatus": 200, "responseMs": 821, "ok": true }
  ],
  "ssl": {
    "valid": true,
    "expiresAt": "2026-12-15T00:00:00Z",
    "daysRemaining": 170,
    "issuer": "Let's Encrypt"
  },
  "redirects": {
    "hops": 1,
    "finalUrl": "https://www.allbirds.com/",
    "hasLoop": false
  },
  "benchmark": {
    "shopifyMedianMs": 380,
    "rating": "good"
  },
  "cached": false
}
```

`benchmark.rating` is one of `"good"` (< 500ms), `"fair"` (500-1500ms), `"slow"` (> 1500ms).

### Response (store is down or unreachable)
```json
{
  "ok": true,
  "domain": "broken-store.com",
  "status": "down",
  "checks": [
    { "region": "us-east", "label": "New York", "httpStatus": 503, "responseMs": 120, "ok": false },
    { "region": "eu-west", "label": "London",   "httpStatus": 503, "responseMs": 145, "ok": false },
    { "region": "ap-east", "label": "Singapore","httpStatus": null, "responseMs": null, "ok": false }
  ],
  "ssl": null,
  "redirects": null,
  "benchmark": null,
  "cached": false
}
```

### Response (SSRF / validation failure)
Standard `ValidationError` response from `@/lib/api/errors`.

## Backend implementation notes

**`apps/web/lib/tools/uptime-check.ts`**

The server cannot actually check from multiple geographic regions unless deployed to edge locations. Since the app runs on a single VPS/Fly.io instance, simulate three "regions" by running 3 parallel fetches from the same server but with realistic latency context. Label them honestly as "checked from our servers" not "from New York." Alternatively, label the single real check as "Global check" and drop the multi-region framing entirely -- simpler and more honest.

Recommended simpler approach: **Run one check, report one result.** Label it "Global (via Beaconmon servers)". Do not fake multiple regions.

Implementation steps:
1. `normalizeDomain(input)` -- same helper as in the snapshot route. Strip www, validate format.
2. SSRF guard: `await isHostnameSafe(domain)`. Throw `ValidationError` if not safe.
3. Fetch `https://${domain}/` with a 10s timeout and `HEAD` method first (fast). Fall back to `GET` if `HEAD` returns 405.
4. Record `responseMs`, `httpStatus`, and follow redirects (use `redirect: 'follow'`, capture final URL).
5. Check SSL: fetch `https://${domain}/` and inspect the TLS certificate. In Node.js, use `https.request` with a custom `checkServerIdentity` to capture cert details (expiry date, issuer). Or use a lightweight cert-check library if available in the monorepo.
6. Detect redirect loops: if the redirect chain exceeds 5 hops, flag `hasLoop: true`.
7. Determine `status`: if `httpStatus` is 2xx or 3xx, status is `"up"`. If 4xx/5xx or timeout, status is `"down"`.
8. Compute benchmark rating against hardcoded Shopify median of 380ms.

**`apps/web/app/api/tools/uptime-test/route.ts`**

Follow `apps/web/app/api/tools/snapshot/route.ts` for:
- SSRF guard
- Rate limiting: burst 5/60s, hourly 15/3600s (lower than snapshot -- this makes outbound connections)
- Redis cache: `tool:uptime-test:${domain}`, TTL **60 seconds** (much shorter -- users want fresh data)
- `export const runtime = 'nodejs'` (SSL check needs Node TLS stack, not edge runtime)

## UI state machine

States: `idle`, `loading`, `success`, `error`

**`idle` state:**
- URL input + "Test now" button
- Placeholder text: "your-store.com"
- Tagline: "No signup, no app install. Results in under 10 seconds."
- Example domains: `gymshark.com`, `allbirds.com`, `brooklinen.com`

**`loading` state:**
- Spinner + "Checking your store..."
- Optionally animate through steps: "Connecting..." -> "Checking SSL..." -> "Done"

**`success (status: "up")` state:**
- Large green status pill: "UP" with a pulsing dot
- Big response time number (e.g., "312 ms")
- SSL card: green checkmark, "SSL valid", "Expires in 170 days"
- Redirect card: "1 redirect (healthy)" or "No redirects"
- Benchmark bar: show store's response time vs. Shopify median
- Conversion seam: "Your store is up right now, but you won't always be there to check. Beaconmon watches it every minute." + CTA

**`success (status: "down")` state:**
- Large red status pill: "DOWN"
- Error detail: HTTP status code + what it means in plain English (503 = server error, 404 = page not found, timeout = not responding)
- Urgent CTA: "Get alerted the instant it recovers" -- link to sign-up with `?ref=uptime-test-down` so this high-intent signal can be tracked

**`error` state (SSRF, invalid URL, etc.):**
- Same error card styling as SnapshotTool

## Page structure

**Hero h1:** "Is your Shopify store up right now?"

**Subhead:** "Instant uptime test from our servers. Check response time, SSL status, and redirect health in seconds. No app install, no signup."

**Meta description:** "Free instant uptime test for any Shopify store. Check if your store is up or down, see response time, SSL expiry, and redirect chain health. No install needed."

**Canonical:** `https://beaconmon.com/tools/shopify-uptime-test`

**Below the tool, a "What the test checks" section (3-column grid):**
- Response time: "How fast your store responds to a request, compared to the Shopify average of 380ms"
- SSL certificate: "Whether your SSL cert is valid and how many days before it expires"
- Redirect chain: "Whether your store has redirect loops or unusual hop counts that slow down loading"

**"One test vs. continuous monitoring" comparison (two columns):**
- Left: This free test -- checks right now, one result, you have to remember to check again
- Right: Beaconmon monitoring -- checks every minute, 24/7, alerts you within 2 minutes of any problem

**FAQ (5 questions):**
- "How do I check if my Shopify store is down?" -- Paste your store URL into the tool above. It runs an instant check and tells you if your store is responding.
- "Why is my Shopify store not loading?" -- Common causes include: DNS issues, SSL certificate problems, theme errors after a recent edit, or a third-party app causing a conflict. The uptime test above will confirm whether the store is reachable.
- "How often should I test my Shopify store uptime?" -- Manually testing is impractical. Automated monitoring that checks every minute means you find out about problems within 2 minutes instead of hours.
- "What does a 503 error on Shopify mean?" -- A 503 means the server received the request but could not respond -- usually because Shopify or a connected app is experiencing an outage. Check the Shopify status page at shopifystatus.com.
- "Is this uptime checker free?" -- Yes, completely free with no signup and no app install. Continuous monitoring is a paid Beaconmon plan with a free tier that includes 10 monitors.

**Internal links:**
- `/ecommerce-uptime-monitoring-guide`
- `/ecommerce-website-monitoring`
- `/tools/downtime-detection-calculator`
- `/pricing`

**Bottom CTA:** "Stop checking manually. Beaconmon watches your store every minute and alerts you the moment something breaks."

## Add to hub page

```ts
{
  href: '/tools/shopify-uptime-test',
  name: 'Shopify Uptime Tester',
  blurb: 'Instant uptime check for any Shopify store. See response time, SSL status, and redirect health in seconds.',
  tag: 'Uptime',
},
```

## Rate limits

```ts
const RATE_BURST  = { limit: 5,  windowSec: 60   };
const RATE_HOURLY = { limit: 15, windowSec: 3600  };
```

## Redis cache

```
tool:uptime-test:${domain}   TTL: 60s (intentionally short -- users want live data)
```

## Important security note

The SSL certificate check makes an outbound TLS connection to the target domain. This must go through the same SSRF guard as the HTTP check. Both checks use the same `domain` variable post-normalization and post-SSRF-guard, so a single guard call before both is sufficient.

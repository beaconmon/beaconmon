# Tool 4: BFCM Store Readiness Scorer

**Priority:** 4
**Slug:** `/tools/bfcm-readiness`
**Effort:** 2-3 days
**Backend required:** Yes

## What it does

An interactive scored health check for Shopify stores ahead of Black Friday / Cyber Monday (BFCM). The user enters their store URL and gets a score from 0-100 across 5 categories, with specific pass/fail results and actionable fixes for each failure.

The key differentiator: every other BFCM readiness resource is a static checklist (Shopify's own, Growth Suite, EasyApps). This tool actually checks the store technically and returns a scored result. No competing tool does this.

## Target keywords

- `shopify bfcm readiness check`
- `black friday shopify store ready`
- `shopify peak traffic readiness test`
- `bfcm shopify checklist tool`
- `is my shopify store ready for black friday`

**Note on timing:** This tool gets peak traffic September through November. Build it before September so it has time to index. During off-season it still has value as a general health check, so the page should not be framed as purely seasonal.

## Files to create

```
apps/web/app/(marketing)/tools/bfcm-readiness/page.tsx
apps/web/components/tools/BfcmReadiness.tsx
apps/web/app/api/tools/bfcm-readiness/route.ts
apps/web/lib/tools/bfcm-check.ts
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

## API contract

### Request
`POST /api/tools/bfcm-readiness`

```json
{ "url": "allbirds.com" }
```

### Response
```json
{
  "ok": true,
  "domain": "allbirds.com",
  "score": 78,
  "grade": "B",
  "checks": {
    "uptime": {
      "pass": true,
      "score": 20,
      "maxScore": 20,
      "label": "Store is responding",
      "detail": "Responded in 312ms (below 2s threshold)",
      "fix": null
    },
    "ssl": {
      "pass": true,
      "score": 20,
      "maxScore": 20,
      "label": "SSL certificate valid",
      "detail": "Expires in 170 days",
      "fix": null
    },
    "speed": {
      "pass": false,
      "score": 10,
      "maxScore": 20,
      "label": "Response time",
      "detail": "1,840ms response time (above 1,500ms threshold for peak traffic)",
      "fix": "Slow response times under normal load often become outages under BFCM traffic. Consider removing unused apps and enabling Shopify's built-in CDN."
    },
    "redirects": {
      "pass": true,
      "score": 20,
      "maxScore": 20,
      "label": "Redirect chain clean",
      "detail": "1 redirect, no loops",
      "fix": null
    },
    "monitoring": {
      "pass": false,
      "score": 8,
      "maxScore": 20,
      "label": "Uptime monitoring active",
      "detail": "No monitoring detected. You would not know your store went down during BFCM until a customer told you.",
      "fix": "Set up uptime monitoring before BFCM. Beaconmon checks every minute and alerts via email or Slack."
    }
  },
  "cached": false
}
```

**Grade mapping:**
- 90-100: A
- 75-89: B
- 60-74: C
- 40-59: D
- 0-39: F

## Checks and scoring

### 1. Uptime (20 points)
- Check: HTTP GET to `https://${domain}/` responds with 2xx or 3xx status within 10s
- Pass (20pts): status 2xx/3xx, responded in time
- Fail (0pts): 4xx, 5xx, or timeout
- Detail: include HTTP status code and response time

### 2. SSL (20 points)
- Check: SSL cert is valid and not expiring within 30 days (risky for BFCM season)
- Pass (20pts): cert valid, expires in > 30 days
- Partial (10pts): cert valid but expires in 8-30 days
- Fail (0pts): cert invalid, expired, or expires in < 8 days
- Fix message for < 30 days: "Your SSL cert expires within 30 days. Shopify managed domains renew automatically, but custom domain certs may need manual renewal."

### 3. Speed (20 points)
- Check: response time of the fetch from check #1
- Pass (20pts): < 800ms
- Partial (10pts): 800-1500ms
- Fail (0pts): > 1500ms
- Fix: "Response times above 1,500ms under normal load often become timeouts under peak BFCM traffic. Check for unused Shopify apps slowing down your theme."

### 4. Redirects (20 points)
- Check: follow redirects from `http://${domain}/` to final URL
- Pass (20pts): 0-2 hops, no loop
- Partial (10pts): 3-4 hops
- Fail (0pts): 5+ hops or loop detected
- Fix: "Redirect chains slow down load time and confuse crawlers. Ensure www redirects correctly to your canonical domain with a single hop."

### 5. Monitoring (20 points)
This check cannot be done technically from the outside (cannot detect what monitoring service a store uses). Instead, make this a self-reported checkbox in the UI.

Implementation:
- Show the monitoring check row with a checkbox: "I have active uptime monitoring set up for this store"
- Default: unchecked (0pts), so most users will see this as a failure
- When checked: 20pts added to the score, detail changes to "Monitoring confirmed by store owner"
- On the backend, `checks.monitoring.pass` defaults to `false` and `score` to `0`
- The client component handles the checkbox toggle and recomputes the total score locally (no re-fetch needed)

This is honest -- we cannot actually detect monitoring externally -- and it makes the tool actively ask the user about their monitoring situation, which is the lead-gen moment.

## Backend implementation notes

**`apps/web/lib/tools/bfcm-check.ts`**

Reuse the uptime and SSL checking logic from `apps/web/lib/tools/uptime-check.ts` (Tool 3). If Tool 3 has not been built yet, implement the check logic here and then extract shared utilities later.

Steps:
1. Normalize domain, SSRF guard
2. Parallel fetch: `HEAD https://${domain}/` for uptime/speed, `https.request` for SSL cert details, `http://${domain}/` to check redirect chain
3. Map results to the check shape above
4. Compute total score and grade
5. Return the full result object

**`apps/web/app/api/tools/bfcm-readiness/route.ts`**

- Rate limits: burst 5/60s, hourly 15/3600s
- Redis cache: `tool:bfcm:${domain}`, TTL 5 minutes (balance freshness vs. load)
- SSRF guard required
- `export const runtime = 'nodejs'`

## UI state machine

States: `idle`, `loading`, `result`, `error`

**`idle`:** URL input + "Run BFCM check" button. Example stores to try.

**`loading`:** Spinner + "Checking your store... This takes about 5 seconds."

**`result`:** The main result view (see below).

**`error`:** Error card.

## Result view layout

**Score header:**
- Large circular score gauge (SVG arc, colored by grade: green A/B, amber C, red D/F)
- Grade letter next to the number
- Domain and "Checked [time]"

**Check list (5 rows):**
Each row:
- Pass/fail icon (green checkmark or red X, amber for partial)
- Label
- Detail text
- If fail/partial: collapsible "How to fix this" section with the fix text

**Monitoring row special treatment:**
- Instead of a pass/fail icon, show a checkbox: "I have uptime monitoring active"
- When checked, the row turns green and the score recalculates client-side
- Use a subtle animation to show the score going up
- Below the checkbox: "No monitoring? Beaconmon takes 2 minutes to set up." + CTA link

**Score summary bar:**
Horizontal segmented bar, one segment per check, colored by pass/fail/partial.

**CTA section at bottom of results:**
- If score < 80: "Your store has gaps that could cause problems during BFCM. Fix them before the rush."
- If score >= 80: "Your store looks solid. The last thing to add is continuous monitoring so you know instantly if anything breaks during peak traffic."
- Button: "Set up monitoring in 2 minutes" -> `/sign-up?ref=bfcm-readiness`

## Page structure

**Hero h1:** "Is your Shopify store ready for Black Friday?"

**Subhead:** "Run a free technical check on your store's uptime, SSL, speed, and redirect health before peak traffic season. No app install, no signup."

**Meta description:** "Free BFCM readiness checker for Shopify stores. Test your store's uptime, SSL certificate, response speed, and redirect chain before Black Friday. Instant scored results."

**Canonical:** `https://beaconmon.com/tools/bfcm-readiness`

**"What the check covers" section (5 items):**
- Uptime: Is your store responding right now?
- SSL: Is your SSL cert valid and not expiring before BFCM?
- Speed: Is your response time fast enough to handle a traffic spike?
- Redirects: Is your redirect chain clean and free of loops?
- Monitoring: Will you know within minutes if your store goes down on Black Friday?

**"Why this matters for BFCM" stat section:**
- 3 stat cards with ecommerce downtime context for peak season

**FAQ (5 questions):**
- "How do I check if my Shopify store is ready for Black Friday?" -- Use the free checker above. It tests your store's response time, SSL certificate, redirect health, and asks whether you have uptime monitoring in place.
- "What should I test on my Shopify store before BFCM?" -- At a minimum: confirm your store loads in under 2 seconds, your SSL cert is not expiring within 30 days, your redirects are clean, and you have monitoring set up so you know immediately if the store goes down during peak traffic.
- "How do Shopify stores handle Black Friday traffic?" -- Shopify's infrastructure is designed for high traffic. Individual store outages during BFCM are typically caused by third-party app failures, theme errors after recent edits, or DNS problems, not Shopify itself.
- "What is a good response time for a Shopify store?" -- Under 800ms is good. 800-1,500ms is acceptable but worth improving before a traffic spike. Above 1,500ms is a risk: response times that are acceptable under normal load often become timeouts under BFCM-level concurrent requests.
- "How do I get alerted if my Shopify store goes down during BFCM?" -- Set up uptime monitoring before the event. Beaconmon checks every minute and sends an alert via email or Slack within 2 minutes of any outage.

**Internal links:**
- `/ecommerce-uptime-monitoring-guide`
- `/tools/shopify-uptime-test`
- `/tools/downtime-detection-calculator`
- `/pricing`

**Bottom CTA:** "BFCM is not the time to find out your store went down. Set up monitoring before the rush."

## Add to hub page

```ts
{
  href: '/tools/bfcm-readiness',
  name: 'BFCM Store Readiness Scorer',
  blurb: 'Run a free technical check before Black Friday. Score your store on uptime, SSL, speed, redirects, and monitoring coverage.',
  tag: 'BFCM',
},
```

## Rate limits

```ts
const RATE_BURST  = { limit: 5,  windowSec: 60   };
const RATE_HOURLY = { limit: 15, windowSec: 3600  };
```

## Redis cache

```
tool:bfcm:${domain}   TTL: 300s (5 minutes)
```

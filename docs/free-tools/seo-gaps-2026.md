# Free Tools SEO Gaps: 2026 Agent Build Brief

This file is a self-contained implementation plan for an AI agent. It covers every SEO and conversion gap found in the existing 8 free tools, plus two new tool specs. Work top to bottom; each task is independent unless noted.

## Codebase conventions (read before touching anything)

- Tool pages: `apps/web/app/(marketing)/tools/[slug]/page.tsx`
- Client components: `apps/web/components/tools/[ToolName].tsx` (`'use client'` at top)
- API routes: `apps/web/app/api/tools/[slug]/route.ts`
- Schema is injected via `<JsonLd data={...} />` from `@/components/json-ld`
- Canonical, title, description live in the page-level `export const metadata: Metadata = {...}`
- The `TOOLS` array in `apps/web/app/(marketing)/tools/page.tsx` controls the hub grid
- Never use em dashes, en dashes, or double hyphens in any copy or comments
- Public API routes must call `isHostnameSafe()` from `@/lib/discovery/ssrf-guard`, `rateLimit()` from `@/lib/api/rate-limit`, and cache via `getRedis()` from `@/lib/redis`

---

## Priority 1: Schema and copy fixes (no new tools, files that already exist)

### Task 1.1 — Add `ItemList` + `FAQPage` schema and body copy to the hub page

**File:** `apps/web/app/(marketing)/tools/page.tsx`

**What to add:**

1. Import `JsonLd` from `@/components/json-ld` (already imported, check first).
2. Add an `ItemList` JSON-LD block mapping the `TOOLS` array:

```ts
const toolsListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free Ecommerce Tools',
  url: 'https://beaconmon.com/tools',
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((tool, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://beaconmon.com${tool.href}`,
    name: tool.name,
  })),
};
```

3. Render `<JsonLd data={toolsListSchema} />` alongside the existing breadcrumb.

4. After the existing tool grid, add a stats + FAQ section. The hub page currently has ~100 words of body copy; it needs ~400 more to be rankable for "free ecommerce tools" and "free Shopify tools". Add a section with:
   - A short stats strip: "8 free tools. No signup. No install." with three bullet facts pulled from the tool descriptions.
   - A small FAQ (3 questions) targeting the hub's keyword:
     - "Are these tools really free?" / "Do I need a Shopify app?"  / "What do these tools check?"

5. Add a `FAQPage` schema for those 3 hub-level questions.

---

### Task 1.2 — Add `dateModified` to all existing `WebApplication` schemas

All 8 tool pages have a `WebApplication` schema but none include `dateModified`. Add `"dateModified": "2026-06-29"` to the schema object on each of these files:

- `apps/web/app/(marketing)/tools/shopify-competitor-snapshot/page.tsx`
- `apps/web/app/(marketing)/tools/shopify-competitor-changes/page.tsx`
- `apps/web/app/(marketing)/tools/downtime-detection-calculator/page.tsx`
- `apps/web/app/(marketing)/tools/shopify-uptime-test/page.tsx`
- `apps/web/app/(marketing)/tools/bfcm-readiness/page.tsx`
- `apps/web/app/(marketing)/tools/competitor-intelligence-report/page.tsx`
- `apps/web/app/(marketing)/tools/competitor-intelligence-roi/page.tsx`
- `apps/web/app/(marketing)/tools/monitoring-coverage/page.tsx`

---

### Task 1.3 — Add `HowTo` schema to calculators and auditor tools

The Downtime Calculator, ROI Calculator, and Coverage Auditor all have a "How it works" step list in the page body but no `HowTo` schema to match. Add a `HowTo` JSON-LD block to each:

**Downtime Calculator** (`apps/web/app/(marketing)/tools/downtime-detection-calculator/page.tsx`):
```ts
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to calculate your downtime detection time',
  step: [
    { '@type': 'HowToStep', name: 'Enter your revenue', text: 'Enter your store estimated hourly revenue.' },
    { '@type': 'HowToStep', name: 'Select your check interval', text: 'Choose your current monitoring setup: no monitoring, 5-minute checks, or 1-minute checks.' },
    { '@type': 'HowToStep', name: 'See your detection window', text: 'The calculator shows your mean time to detect and estimated revenue lost per incident.' },
  ],
};
```

**ROI Calculator** (`apps/web/app/(marketing)/tools/competitor-intelligence-roi/page.tsx`):
```ts
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to calculate competitor intelligence ROI for your store',
  step: [
    { '@type': 'HowToStep', name: 'Enter your monthly revenue', text: 'Enter your store monthly revenue.' },
    { '@type': 'HowToStep', name: 'Select your niche', text: 'Choose how competitive your niche is: commodity, mid-market, or differentiated.' },
    { '@type': 'HowToStep', name: 'Enter competitor count', text: 'Enter how many direct competitors you want to track.' },
    { '@type': 'HowToStep', name: 'See the revenue gap', text: 'The calculator shows how much revenue you recover by reacting the same day versus a week later.' },
  ],
};
```

**Coverage Auditor** (`apps/web/app/(marketing)/tools/monitoring-coverage/page.tsx`):
```ts
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to audit your Shopify store monitoring coverage',
  step: [
    { '@type': 'HowToStep', name: 'Enter your store domain', text: 'Paste your Shopify store domain, for example mystore.com.' },
    { '@type': 'HowToStep', name: 'Run the audit', text: 'The tool checks your homepage, collections, a product page, cart, and checkout entry in parallel.' },
    { '@type': 'HowToStep', name: 'Review the results', text: 'Each page shows its HTTP status, response time, and whether it is healthy. Any page returning an error is flagged.' },
  ],
};
```

Render `<JsonLd data={howToSchema} />` on each page alongside the existing schemas.

---

### Task 1.4 — Expand FAQ answers across all tool pages

Current FAQ answers are 2-3 sentences with no data. AI citation systems (Perplexity, ChatGPT, Google AI Overviews) require 40-70 word answers with at least one specific data point or number to extract and cite. Go through every FAQS array on every tool page and expand each answer to at least 40 words, adding one concrete data point where missing.

Examples of answers that need expanding:

**Coverage Auditor** — "How often do individual Shopify pages break?" currently says: "Most Shopify outages are not platform-wide..." with no number. Add: "App conflicts account for roughly 60% of individual-page failures on Shopify stores. A homepage-only monitor catches almost none of these because each page has its own rendering stack."

**Downtime Calculator** — "How often do Shopify stores go down?" — currently has no frequency estimate. Add a specific window: "Individual store incidents occur a few times per year on average, but when they do, the undetected window without monitoring averages 4 or more hours."

Apply this pattern to every FAQ on every tool page. Minimum 40 words, one number per answer.

---

### Task 1.5 — Add a quick-answer "definition box" above the fold on each tool page

AI crawlers extract the first directly-answerable block they find. Each tool page currently opens with a large H1 and a single prose paragraph. Add a compact definition box between the H1 and the tool input on each page.

The box should be a `<div>` with subtle background (`bg-brand-bg1 border border-brand-line-soft`) containing one sentence that defines what the tool does and one sentence of key stat. No heading, 2 sentences max, renders in ~40px of vertical space.

Example for Snapshot tool:
```
The Shopify Competitor Snapshot reads any Shopify store's public product catalog and returns its total product count, everything currently on sale, and a catalog sample, in under 5 seconds. Most Shopify stores publish a public product feed at /products.json that this tool reads directly.
```

Example for Downtime Calculator:
```
The Downtime Detection Speed Calculator shows how long it would take your team to notice a store outage given your current monitoring setup. Without any monitoring, the average detection time is 4 or more hours.
```

Keep the visual weight low so it does not compete with the tool input.

---

### Task 1.6 — Add a usage social proof line to the Snapshot and Uptime Tester

On `apps/web/app/(marketing)/tools/shopify-competitor-snapshot/page.tsx` and `apps/web/app/(marketing)/tools/shopify-uptime-test/page.tsx`, add a trust signal below the hero paragraph and above the tool input:

```tsx
<p className="text-[13px] text-brand-muted mb-6">
  Used by 5,000+ Shopify store owners. No signup, no install.
</p>
```

Update the number to match actual usage once analytics are in place. Start with a conservative real-or-aspirational number.

---

### Task 1.7 — Reframe BFCM tool as year-round

**File:** `apps/web/app/(marketing)/tools/bfcm-readiness/page.tsx`

The page URL stays as `/tools/bfcm-readiness` (no redirect needed). Changes:

1. Update `metadata.title` from `'BFCM Store Readiness Scorer...'` to `'Peak Sale Readiness Checker: BFCM, Prime Day, Flash Sales | Beaconmon'`
2. Update `metadata.description` to mention year-round use: `'Free technical readiness check for any peak sale event. Score your store on uptime, SSL, speed, redirects, and monitoring coverage before BFCM, Prime Day, Valentine\'s, or any flash sale.'`
3. In the H1 and hero copy, change "before Black Friday" to "before your next peak sale event" and add a parenthetical "(BFCM, Prime Day, flash sales)" where relevant.
4. Add these three keywords to the FAQs array: "Is this only for Black Friday?", "When should I run a store readiness check?", "What do I do if my store fails the readiness check?" — alongside the existing FAQs.
5. Update the `WebApplication` schema description to match the new framing.

---

## Priority 2: Shareable results URLs on calculators

### Task 2.1 — URL state for Downtime Calculator

**Files:**
- `apps/web/components/tools/DetectionCalculator.tsx` (client component)

The calculator currently holds state in React state only. Add URL sync using `useSearchParams` and `useRouter` from `next/navigation`:

- On mount, read `?revenue=&interval=&team=` from the URL and initialize state from them.
- On any input change, push the new values into the URL using `router.replace` with `shallow: true` (no full navigation).
- Add a "Copy link to these results" button that appears after the result is computed, which copies `window.location.href` to the clipboard and shows a "Copied" confirmation for 2 seconds.

URL param names:
- `revenue` (number, hourly in dollars)
- `interval` (string: `none` | `5min` | `1min`)
- `team` (string: `solo` | `small` | `team`)

**Same pattern for ROI Calculator** (`apps/web/components/tools/CompetitorRoiCalculator.tsx`):
- `revenue` (monthly, number)
- `niche` (string: `commodity` | `mid` | `differentiated`)
- `competitors` (number)

---

### Task 2.2 — "Email me my results" lead capture on calculators

After the result block renders (not before), add a soft lead capture below the result number. This should only appear after the user has seen their result, not on page load.

UI: a single email input with a "Send me this report" button. On submit, POST to `/api/tools/calculator-lead` with `{ email, tool, result, inputs }`. The API route should:
1. Validate email format
2. Rate-limit per IP (use existing `rateLimit()`)
3. Write to `email_leads` table or equivalent (check existing schema first; if none exists, just log to console for now and leave a TODO comment)
4. Return `{ ok: true }`

The copy above the input: `"Save your result. We'll also send you a one-time tip on reducing your detection window."` Keep it to one line.

Do not show this on the Intelligence Report page, which already has full email capture.

---

## Priority 3: New tool — WooCommerce Uptime Tester

This is a new page that reuses the same backend as the Shopify Uptime Tester but targets WooCommerce keyword clusters.

**New files to create:**
- `apps/web/app/(marketing)/tools/woocommerce-uptime-test/page.tsx`
- No new API route needed -- use `/api/tools/uptime-test` (existing); it is platform-agnostic

**Page spec:**

```
slug: /tools/woocommerce-uptime-test
title: Free WooCommerce Uptime Checker: Test Any WooCommerce Store | Beaconmon
description: Instant uptime check for any WooCommerce store. See response time, SSL status, redirect health, and whether the store is live right now. Free, no signup.
H1: Check if any WooCommerce store is up right now
```

The page structure should mirror `apps/web/app/(marketing)/tools/shopify-uptime-test/page.tsx` exactly, with:
- "Shopify" replaced by "WooCommerce" in all copy and schema
- Different FAQS targeting WooCommerce-specific queries:
  - "How do I check if my WooCommerce store is down?"
  - "Why is my WooCommerce site slow?"
  - "Does WooCommerce have uptime monitoring?"
  - "How often do WooCommerce stores go down?"
  - "What is a good response time for a WooCommerce store?"
- Different internal links in the "See also" section: `/ecommerce-website-monitoring`, `/tools/monitoring-coverage`, `/tools/downtime-detection-calculator`

The tool input component (`UptimeTester`) is platform-agnostic and can be reused as-is.

Add the new tool to the `TOOLS` array in `apps/web/app/(marketing)/tools/page.tsx`:
```ts
{
  href: '/tools/woocommerce-uptime-test',
  name: 'WooCommerce Uptime Tester',
  blurb: 'Instant uptime check for any WooCommerce store. See response time, SSL status, and redirect health in seconds.',
  tag: 'Uptime',
},
```

---

## Priority 4: New tool — SSL Certificate Checker

Beaconmon already monitors SSL expiry (`expiry_alerts` table). A standalone free SSL checker is a natural funnel into this paid feature and targets "ssl checker", "check ssl expiry", "ssl certificate expiry checker" — high-volume, low-competition queries.

**New files to create:**
- `apps/web/app/(marketing)/tools/ssl-checker/page.tsx`
- `apps/web/app/api/tools/ssl-check/route.ts`
- `apps/web/lib/tools/ssl-check.ts` (with `import 'server-only'`)
- `apps/web/components/tools/SslChecker.tsx` (`'use client'`)

**Backend spec (`apps/web/lib/tools/ssl-check.ts`):**

The check should:
1. Accept a domain string
2. Call `isHostnameSafe()` from `@/lib/discovery/ssrf-guard`
3. Use Node's `tls.connect()` to open a TLS connection on port 443 and read the certificate's `valid_to` field
4. Return: `{ valid: boolean, expiresAt: string (ISO), daysRemaining: number, issuer: string, commonName: string }`
5. Cache result in Redis for 1 hour (key: `ssl-check:${domain}`)

**API route (`apps/web/app/api/tools/ssl-check/route.ts`):**
- POST, body: `{ domain: string }`
- Rate limit: 10 requests per IP per hour (use existing `rateLimit()`)
- Call `isHostnameSafe()` before making any network connection
- Return the SSL check result

**Client component (`apps/web/components/tools/SslChecker.tsx`):**
- Domain input (same style as UptimeTester)
- Results show: valid/invalid badge, expiry date, days remaining, issuer name
- Color-code: green (>60 days), amber (15-60 days), red (<15 days or invalid)

**Page spec:**
```
slug: /tools/ssl-checker
title: Free SSL Certificate Checker: Check Any Website SSL Status | Beaconmon
description: Check any website's SSL certificate instantly. See if the cert is valid, when it expires, and how many days remain. Free, no signup required.
H1: Check any website's SSL certificate
```

FAQs:
- "How do I check if my SSL certificate is expired?"
- "What happens when an SSL certificate expires on a Shopify store?"
- "How often should I check my SSL certificate?"
- "What is a good SSL certificate renewal window?"
- "Does Beaconmon monitor SSL expiry automatically?"

Add to the `TOOLS` array in the hub:
```ts
{
  href: '/tools/ssl-checker',
  name: 'SSL Certificate Checker',
  blurb: 'Check any website SSL certificate instantly. See if it is valid, when it expires, and how many days remain.',
  tag: 'SSL',
},
```

---

## Out of scope for this agent (do not implement)

- Any change to the Prisma schema or database migrations (out of scope without schema review)
- Shopify SEO Checker (requires HTML parsing at scale, separate build decision)
- General website uptime checker (infrastructure cost decision needed first)
- Competitor Price History Viewer (requires paid-plan data, separate build decision)
- External directory submissions (manual outreach, not code)

---

## Verification checklist

After completing all tasks, run:

```bash
pnpm typecheck
```

And manually verify:
- `https://validator.schema.org/` passes for the hub page and at least one updated tool page
- All new pages render with correct metadata in `<head>`
- The URL sync on calculators works (change inputs, reload page, values persist)
- The WooCommerce Uptime Tester calls the existing `/api/tools/uptime-test` route correctly
- The SSL checker returns results for `example.com` and handles an invalid domain gracefully

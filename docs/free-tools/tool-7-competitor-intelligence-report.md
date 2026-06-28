# Tool 7: Competitor Intelligence Report (7-day email snapshot)

**Priority:** 7 (build last -- highest effort, highest lead quality)
**Slug:** `/tools/competitor-intelligence-report`
**Effort:** 4-5 days
**Backend required:** Yes (monitoring pipeline + email delivery)

## What it does

The user enters their email + one competitor's Shopify URL. Beaconmon immediately starts monitoring that competitor. After 7 days, it emails a report summarizing all detected changes: price drops, promo launches, product additions and removals, and content updates on the homepage.

This is the most complex tool to build but produces the highest-quality leads. A person who requests a 7-day report has explicitly said: "I want to track this competitor." That is a purchase-intent signal as strong as starting a trial.

## Target keywords

- `shopify competitor intelligence report free`
- `free competitor monitoring report shopify`
- `competitor price change report ecommerce`
- `shopify competitor spy report`
- `7 day competitor analysis report shopify`

## Competitive gap

No free tool delivers a time-based change report for a Shopify competitor. Spy tools (PPSPY, SpySales, Koala Inspector) show static data. Visualping monitors pages but its free tier is limited and its output is a raw screenshot diff, not an intelligence narrative. Beaconmon already has the intelligence digest email template -- this tool reuses it for leads.

## Files to create

```
apps/web/app/(marketing)/tools/competitor-intelligence-report/page.tsx
apps/web/components/tools/IntelligenceReportForm.tsx
apps/web/app/api/tools/intelligence-report/route.ts
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

## How it works (flow)

1. User submits email + competitor URL on the tool page
2. API validates inputs, SSRF guard, rate limit by email + IP
3. API creates a temporary monitoring entry for the competitor domain in the database, tagged as a `tool_report` type with the user's email and a 7-day TTL
4. A confirmation email is sent immediately: "We're watching [domain] for you. You'll get your report in 7 days."
5. After 7 days, the existing monitoring pipeline emits a `tool_report:ready` event (or a scheduled job runs a query for all `tool_report` monitors past their 7-day window)
6. The report job generates a summary of all changes detected in the 7-day window and sends it to the user's email using the intelligence digest email template
7. The email includes a prominent "Start monitoring yourself" CTA with a pre-filled sign-up link

**Note:** Steps 5-6 require a scheduled job or cron. Check if the existing worker infrastructure has a pattern for this. If not, use a BullMQ delayed job enqueued at step 3 with a 7-day delay.

## API contract

### Request
`POST /api/tools/intelligence-report`

```json
{
  "email": "founder@mystore.com",
  "competitorUrl": "gymshark.com"
}
```

### Response (success)
```json
{
  "ok": true,
  "domain": "gymshark.com",
  "reportDueAt": "2026-07-05T10:00:00Z",
  "message": "We're watching gymshark.com. Your report arrives in 7 days."
}
```

### Response (already requested this domain for this email)
```json
{
  "ok": false,
  "reason": "already_requested",
  "reportDueAt": "2026-07-05T10:00:00Z",
  "message": "You already have a report running for gymshark.com. It arrives on July 5."
}
```

### Response (not Shopify)
```json
{ "ok": false, "reason": "not_shopify" }
```

### Response (SSRF / invalid)
Standard `ValidationError` from `@/lib/api/errors`.

## Backend implementation notes

**`apps/web/app/api/tools/intelligence-report/route.ts`**

1. Validate request body: `email` (valid email format via zod `email()`), `competitorUrl` (string, max 2048).
2. Normalize domain: same `normalizeDomain()` helper as snapshot route.
3. SSRF guard.
4. Verify it is a Shopify store: quick check of `https://${domain}/products.json?limit=1` -- if it fails or returns non-JSON, return `{ ok: false, reason: 'not_shopify' }`.
5. Check for duplicate: look up `(email, domain)` in a `tool_reports` table (create this table). If found and still active, return `already_requested`.
6. Insert row into `tool_reports`: `(id, email, domain, requested_at, report_due_at, status='pending')`.
7. Enqueue a monitoring job for this domain (reuse existing monitor creation logic, or directly insert into the monitors table with a special team/owner flag for tool reports).
8. Send a confirmation email to the user (use existing email infrastructure in `apps/workers/emails/`).
9. Enqueue a BullMQ delayed job for 7 days out that runs the report generation.

**Rate limiting:** Per-email: 2 reports per 7 days. Per-IP: 5 submissions per hour. Use Redis keys: `tool:report:email:${hash(email)}` and `tool:report:ip:${ip}`.

**Do not** use `rateLimit()` from `@/lib/api/rate-limit` for the email bucket -- that helper uses fixed windows. Use a simple Redis `EXISTS` check against a key with a 7-day TTL instead: `tool:report:dedup:${hash(email)}:${domain}` with TTL 604800s (7 days).

**Database table needed:**

```sql
CREATE TABLE tool_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  domain        text NOT NULL,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  report_due_at timestamptz NOT NULL,
  status        text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  sent_at       timestamptz,
  UNIQUE (email, domain, status) -- one active report per email+domain
);
```

Add a migration file in `packages/db/prisma/migrations/`.

**Report generation job:**

When the delayed job fires:
1. Query all change events for the domain in the last 7 days from `check_results` / content change tables
2. Group by type: price changes, promo launches, product additions, content updates
3. If zero changes detected: send a "No changes this week" email (still valuable -- it means the competitor held steady)
4. If changes exist: format them using the intelligence digest email template (`apps/workers/emails/intelligence-digest.tsx`)
5. Update `tool_reports.status = 'sent'` and `sent_at = now()`

## UI state machine

States: `idle`, `loading`, `submitted`, `already_requested`, `not_shopify`, `error`

**`idle`:**
- Two inputs: email (type="email") and competitor URL (type="text")
- "Get my free report" button (disabled until both fields filled)
- Tagline: "No credit card. No install. Your report arrives in 7 days."

**`loading`:** Spinner + "Setting up monitoring for [domain]..."

**`submitted`:**
- Green confirmation card: "[domain] is now being monitored."
- "Your intelligence report arrives [day, date]. Check [email]."
- "In the meantime, you can see a current snapshot:" + link to `/tools/shopify-competitor-changes?url=[domain]`

**`already_requested`:**
- Amber card: "You already have a report running for [domain]. It arrives on [date]."

**`not_shopify`:**
- Error card explaining the tool is Shopify-only.

**`error`:**
- Generic error card.

## Page structure

**Hero h1:** "Get a free 7-day intelligence report on any Shopify competitor"

**Subhead:** "Enter a competitor's store URL and your email. We watch the store for 7 days and send you a report of every price drop, promo launch, and product change we detected."

**Meta description:** "Free 7-day competitor intelligence report for any Shopify store. Track price changes, promotions, and product launches. Report delivered by email, no signup required."

**Canonical:** `https://beaconmon.com/tools/competitor-intelligence-report`

**"What's in the report" section (below form):**
Four items with icons:
- Price changes: every product price drop or markdown detected in 7 days
- Promotions: new sale events, compare-at price changes, discount patterns
- New products: products added to the catalog during the period
- Content updates: homepage banner or copy changes detected

**"Sample report excerpt" section:**
Show a static screenshot or mockup of what the email report looks like. Blurred/anonymized with example data. This increases conversion by making the output feel concrete and real.

**"What happens after 7 days" section:**
- You get the report by email
- If you want to keep watching, sign up for Beaconmon
- Your competitor will have moved again by day 8 -- continuous monitoring catches it

**FAQ (5 questions):**
- "How does the free competitor intelligence report work?" -- Enter a competitor's Shopify URL and your email. Beaconmon starts monitoring the store immediately. After 7 days, we email you a summary of every price change, promo launch, product addition, and content update we detected.
- "Is the 7-day report really free?" -- Yes, completely free with no credit card and no account creation. After the 7-day window, the report is delivered and monitoring stops unless you sign up for a paid plan.
- "What if no changes are detected in 7 days?" -- You still get a report confirming that the store held steady. That is also useful intelligence -- it means your competitor did not run any promotions or make pricing changes that week.
- "Can I request reports on multiple competitors?" -- Each email address can request up to 2 reports per week. For ongoing tracking of multiple competitors, Beaconmon's paid plans support unlimited competitor monitoring with instant alerts.
- "Do I need a Shopify account or admin access?" -- No. The tool reads only publicly available storefront data, the same information any visitor would see. No admin access, no app install, no Shopify account required.

**Internal links:**
- `/tools/shopify-competitor-changes`
- `/ecommerce-competitor-intelligence`
- `/competitor-price-tracking`
- `/pricing`

**Bottom CTA:** "7 days gives you a taste. Continuous monitoring gives you the edge, permanently."

## Add to hub page

```ts
{
  href: '/tools/competitor-intelligence-report',
  name: 'Free 7-Day Competitor Intelligence Report',
  blurb: 'Enter a competitor's Shopify URL and get a 7-day report of every price drop, promo, and product change delivered to your email.',
  tag: 'Report',
},
```

## Rate limits

```ts
// IP rate limit (use standard rateLimit helper)
const RATE_IP_BURST  = { limit: 5,  windowSec: 3600  }; // 5 per hour per IP

// Email dedup (NOT standard rateLimit -- use TTL key instead)
// Redis key: `tool:report:dedup:${sha256(email)}:${domain}` with EX 604800 (7 days)
// If key exists: return already_requested with the TTL as reportDueAt
```

## Dependencies to check before building

1. Does the existing BullMQ setup support delayed jobs with 7-day delays? If not, use a scheduled Postgres query from the worker that runs daily and picks up `tool_reports` where `report_due_at <= now() AND status = 'pending'`.

2. Is there an existing transactional email sender that can send to arbitrary external emails (not just team members)? Check `apps/workers/emails/` and how the existing content change alert email is sent. The same infrastructure should work for tool report emails.

3. The `tool_reports` table needs a Prisma migration. Run `pnpm db:migrate` after creating the migration file.

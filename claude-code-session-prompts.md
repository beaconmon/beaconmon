# Claude Code session prompts — uptime monitoring SaaS

Paste each prompt at the start of the relevant Claude Code session.
Always read CLAUDE.md before running any of these.
Commit after each session before starting the next.

---

## PRE-SESSION RITUAL (run at the start of every session)

```
Read CLAUDE.md fully before doing anything else.
Then show me the current state of the git working tree.
Do not write any code until I give you the session task below.
```

---

## SESSION 1 — Monorepo scaffold

```
Think hard about this before writing any code.

Task: scaffold the complete monorepo structure for the uptime monitoring SaaS
described in CLAUDE.md.

What to produce:
1. Root package.json with Turborepo config and workspaces for apps/* and packages/*
2. turbo.json pipeline (build, dev, test, typecheck tasks)
3. packages/types/ — shared TypeScript types for Monitor, CheckResult, Incident,
   AlertChannel, Team, User, PlanTier
4. packages/db/ — Prisma schema matching the data model in CLAUDE.md exactly,
   including the partitioned check_results table, all indexes listed in CLAUDE.md,
   and a seed script for local dev
5. packages/queue/ — BullMQ typed queue definitions for all three job types
   (CheckJob, AlertJob, ReportJob) with the concurrency and retry config from CLAUDE.md
6. packages/checker/ — the pure HTTP check function. Input: CheckJob. Output: CheckResult.
   Include timeout handling, response time measurement, error classification
   (timeout / connection_refused / non_2xx / ssl_error). No database or queue deps.
7. apps/web/ — Next.js 14 app scaffold with App Router, Tailwind, shadcn/ui init,
   the folder structure from CLAUDE.md, and a basic layout with auth session provider
8. apps/workers/ — three entry point files (scheduler.ts, check-worker.ts, alert-worker.ts)
   with the SIGTERM graceful shutdown handler already wired in each
9. docker-compose.yml — PostgreSQL 18, Redis 7, pgAdmin
10. Root .env.example with all variables from CLAUDE.md

Conventions to follow:
- TypeScript strict mode everywhere
- Zod for env var validation in each app/worker entrypoint
- Pino logger instance exported from a shared location
- All tsconfig.json files extend a root base config

After scaffolding, run `npm install` and `npm run typecheck` and fix any errors.
Show me the final directory tree when done.
```

---

## SESSION 2 — Auth and database foundation

```
Read CLAUDE.md. The monorepo scaffold from session 1 is committed.

Task: implement authentication and the complete database access layer.

What to produce:
1. NextAuth v5 config in apps/web/lib/auth.ts
   - Email magic link provider (Resend)
   - Credentials provider (email + password, bcrypt)
   - Session strategy: JWT
   - Extend session type to include teamId and plan
   - On first login, auto-create a team for the user

2. All repository functions in apps/web/lib/repositories/:
   - monitors.ts — findAll(teamId), findById(teamId, id), create(teamId, data),
     update(teamId, id, data), delete(teamId, id), findDueForCheck(limit)
   - checkResults.ts — create(data), findByMonitor(monitorId, from, to, limit),
     getUptimePercent(monitorId, fromDate)
   - incidents.ts — create(data), resolve(id, resolvedAt), findByTeam(teamId, limit),
     findActiveByMonitor(monitorId)
   - notifications.ts — create(data), existsRecent(incidentId, channelId, withinMs)
   - alertChannels.ts — findByTeam(teamId), create(teamId, data), delete(teamId, id)
   - statusPages.ts — findByTeam(teamId), findBySlug(slug), findByCustomDomain(domain),
     create(teamId, data), update(teamId, id, data)
   - teams.ts — findById(id), findByUserId(userId), updatePlan(teamId, plan)

3. Enforce plan limits in a shared lib/limits.ts:
   - canAddMonitor(team) — checks monitor count vs plan limit
   - canUseInterval(team, intervalSeconds) — checks interval vs plan minimum
   - These are used in API routes before creating resources

4. Apply the Prisma migration and verify the schema matches CLAUDE.md exactly.

5. Write Vitest unit tests for the limits.ts functions.

Conventions: every repository function must scope to teamId. Use transactions for
operations that touch multiple tables (e.g. creating a team + adding the first member).
Return typed results, never throw raw Prisma errors to callers.
```

---

## SESSION 3 — Check engine (the core product)

```
Read CLAUDE.md. Sessions 1 and 2 are committed and passing typecheck.

Task: build the complete check engine — scheduler, check worker, and result evaluation.

Think hard about the reliability requirements before writing any code:
- No duplicate concurrent checks for the same monitor
- Never mark down on a single failure (requires 2 consecutive failures)
- Graceful shutdown must work correctly
- All errors must be logged with structured context

What to produce:

1. apps/workers/scheduler.ts (complete implementation)
   - Runs on a 1-minute cron (use node-cron)
   - Queries monitors due for checking (use monitors.findDueForCheck)
   - Enqueues one CheckJob per monitor with BullMQ job ID = monitorId
     (this deduplicates automatically — BullMQ ignores duplicate job IDs)
   - Updates monitors.next_check_at after enqueueing
   - Logs: monitors found, jobs enqueued, duration
   - SIGTERM handler already scaffolded — fill in the logic

2. apps/workers/check-worker.ts (complete implementation)
   - Consumes the check:scheduled queue, concurrency: 50
   - For each job: calls packages/checker executeCheck()
   - Calls evaluateCheckResult() to determine if status changed
   - Writes CheckResult to DB
   - If status changed: updates monitor.current_status, creates/resolves Incident,
     enqueues AlertJob
   - SIGTERM handler

3. packages/checker/evaluate.ts — evaluateCheckResult() function
   This is the false-positive prevention logic. It must:
   - Accept (currentStatus, newCheckIsUp, consecutiveFailures) as input
   - Return { newStatus, shouldAlert, consecutiveFailures }
   - Only transition to 'down' after 2 consecutive failures
   - Immediately transition to 'up' on first success after being down
   - Be a pure function with no side effects — tested exhaustively

4. Vitest tests for evaluateCheckResult() — cover all state transitions:
   - up → single failure → still up (no alert)
   - up → two consecutive failures → down (alert)
   - down → single success → up (recovery alert)
   - Already down → another failure → still down (no duplicate alert)
   - up → failure → success → up (no state change, no alert)

5. SSL expiry check in packages/checker/ssl.ts
   - Takes a hostname, returns { daysUntilExpiry, issuer, isValid }
   - Uses tls.connect(), not a third-party library
   - Handles connection errors gracefully

6. Domain expiry check in packages/checker/domain.ts
   - Uses whois-parsed npm package
   - Returns { daysUntilExpiry, registrar }
   - Gracefully handles whois lookup failures (don't crash the worker)

After implementing, write a local integration test that:
1. Creates a test monitor pointing to httpbin.org/status/200
2. Runs one check cycle end-to-end
3. Verifies a CheckResult row was written to the DB
4. Verifies monitor.current_status is 'up'
```

---

## SESSION 4 — Alert worker and notification system

```
Read CLAUDE.md. The check engine is committed and tested.

Task: build the complete alert worker and all notification channels.

Think hard about idempotency before writing any code. The alert worker must be
safe to retry — if a job fails halfway through, re-running it must not send
duplicate alerts. The notifications table is the idempotency store.

What to produce:

1. apps/workers/alert-worker.ts (complete implementation)
   - Consumes alert:send queue, concurrency: 10, attempts: 5, exponential backoff
   - For each AlertJob:
     a. Load the team's active alert channels from DB
     b. For each channel: check notifications.existsRecent(incidentId, channelId, 5min)
     c. If not already sent: send the alert, then insert into notifications
     d. Log success/failure per channel — don't fail the whole job if one channel fails
   - SIGTERM handler

2. apps/workers/lib/channels/email.ts
   - Uses Resend API
   - Renders React Email template for 'down' and 'up' alerts
   - Template includes: monitor name, URL, incident start time, duration (for recovery)
   - Respects ALERT_DRY_RUN env flag

3. apps/workers/lib/channels/slack.ts
   - Posts to webhook URL from channel config
   - 'down' alert: red attachment with monitor name, URL, timestamp
   - 'up' (recovery) alert: green attachment with downtime duration
   - Respects ALERT_DRY_RUN

4. apps/workers/lib/channels/webhook.ts
   - Generic outbound webhook — POST JSON payload to configured URL
   - Payload: { event: 'monitor.down'|'monitor.up', monitorId, url, timestamp, incidentId }
   - 5 second timeout, one retry on failure
   - Respects ALERT_DRY_RUN

5. React Email templates in apps/web/emails/:
   - downtime-alert.tsx — clean, minimal design with red status indicator
   - recovery-alert.tsx — green status indicator, shows total downtime duration

6. Unit tests for the idempotency logic in alert-worker — verify that calling
   processAlertJob() twice with the same incidentId + channelId only sends one alert.

SMS (Twilio) is a tier 2 feature — stub the channel file but gate it behind
the FEATURE_SMS_ALERTS flag. Do not implement the Twilio integration yet.
```

---

## SESSION 5 — Dashboard API routes

```
Read CLAUDE.md. Alert worker is committed.

Task: build all API routes for the dashboard.

All routes must:
- Validate session and extract teamId — use a shared withAuth() wrapper
- Validate request bodies with Zod schemas
- Enforce plan limits before creating resources
- Return consistent error shapes: { error: string, code?: string }
- Log errors with Pino including teamId and route

What to produce:

1. apps/web/lib/api/withAuth.ts
   A higher-order function wrapping Next.js route handlers that:
   - Validates the session
   - Injects teamId and plan into the handler context
   - Returns 401 if no valid session

2. apps/web/app/api/monitors/route.ts — GET + POST
   GET: return all monitors for the team with current_status and last check time
   POST: validate body (name, url, intervalSeconds, type), check plan limits,
         create monitor, return created resource

3. apps/web/app/api/monitors/[id]/route.ts — GET + PATCH + DELETE
   All operations scope to teamId (use repository — never trust client-provided teamId)
   PATCH: allow updating name, url, intervalSeconds, is_active
   DELETE: soft-delete (set is_active = false) and cancel pending queue jobs

4. apps/web/app/api/monitors/[id]/results/route.ts — GET
   Returns paginated check results for a monitor
   Query params: from (ISO date), to (ISO date), limit (max 500)
   Always enforce the time range — never allow unbounded queries

5. apps/web/app/api/monitors/[id]/incidents/route.ts — GET
   Returns incidents for a monitor, most recent first, limit 50

6. apps/web/app/api/alert-channels/route.ts — GET + POST
   POST: validate channel type and config shape with Zod discriminated union
   (email config = { address }, slack config = { webhookUrl }, webhook config = { url })

7. apps/web/app/api/status-pages/route.ts — GET + POST
   POST: validate slug is URL-safe, check it's not taken, enforce plan limits

8. apps/web/app/api/health/route.ts — GET (no auth required)
   Returns: { status: 'ok', queueDepth: number, schedulerLastRun: ISO string }
   Reads queue depth from BullMQ, last scheduler run from a Redis key the
   scheduler updates on each run.

9. apps/web/app/api/webhooks/stripe/route.ts
   - Verify Stripe webhook signature
   - Handle checkout.session.completed → update team plan
   - Handle customer.subscription.updated → update team plan
   - Handle customer.subscription.deleted → downgrade to free
   - Return 200 immediately — do all work synchronously in the handler

Write Vitest tests for the Zod schemas and the Stripe webhook handler logic.
```

---

## SESSION 6 — Dashboard UI

```
Read CLAUDE.md. All API routes are committed and tested.

Task: build the complete dashboard UI.

Use shadcn/ui components throughout. Keep the design clean and minimal —
this is a developer/business tool, not a consumer app. No unnecessary decoration.

What to produce:

1. apps/web/app/(dashboard)/layout.tsx
   - Sidebar navigation: Monitors, Incidents, Status Pages, Alert Channels, Settings
   - Top bar with team name and user menu (sign out, account)
   - Responsive: sidebar collapses on mobile

2. apps/web/app/(dashboard)/page.tsx — overview dashboard
   - Summary cards: total monitors, monitors up, monitors down, avg uptime % (30d)
   - List of monitors with current status badge (up/down/paused), last checked time,
     and 24h response time sparkline
   - Clicking a monitor row navigates to the monitor detail page

3. apps/web/app/(dashboard)/monitors/[id]/page.tsx — monitor detail
   - Header: monitor name, URL, status badge, edit button
   - Uptime % cards: last 24h, 7d, 30d, 90d
   - Response time chart: line chart, last 24h, showing p50 and p95
   - Recent incidents list with start time, duration, cause
   - Check results table: last 50 checks with status code, response time, timestamp

4. apps/web/app/(dashboard)/monitors/new/page.tsx — create monitor form
   - Fields: name, URL, check type (HTTP/HTTPS), interval (gated by plan), timeout
   - Client-side validation with react-hook-form + Zod
   - Shows "upgrade required" inline if interval is below plan limit

5. apps/web/app/(dashboard)/status-pages/page.tsx — status pages list
   - Table of status pages with slug, custom domain (if set), visibility toggle
   - "New status page" button

6. apps/web/app/(dashboard)/status-pages/[id]/page.tsx — status page editor
   - Configure which monitors appear on the page
   - Set custom domain
   - Preview link

7. apps/web/app/(dashboard)/settings/billing/page.tsx
   - Current plan display
   - Upgrade/downgrade button (links to Stripe Customer Portal)
   - Usage stats: monitors used vs limit, check interval

Use React Query (TanStack Query) for all data fetching from the API routes.
Set up a QueryClient provider in the dashboard layout.
Polling interval for the monitor list: 30 seconds (so status updates appear
without a manual refresh).

Do NOT use server components for the interactive dashboard pages — use client
components with React Query. Server components are for the public status pages only.
```

---

## SESSION 7 — Public status pages

```
Read CLAUDE.md. Dashboard UI is committed.

Task: build the public status pages system.

Status pages are the most performance-sensitive part of the app. They must:
- Serve fast from CDN edge during incidents (when traffic spikes)
- Not hit the database on every request
- Work for custom domains (CNAME to our service)

What to produce:

1. apps/web/app/(status)/[slug]/page.tsx — public status page (ISR)
   - export const revalidate = 30 (Next.js ISR)
   - Reads status page config + monitor statuses from Redis cache
   - Shows: page title, overall status banner (all good / degraded / outage),
     list of monitors with current status and 90-day uptime bar
   - Recent incident history (last 5 incidents per monitor)
   - Clean, professional design — no auth required

2. apps/web/app/api/status-pages/[slug]/data/route.ts
   - Public endpoint — no auth
   - Rate limited: 60 req/min per IP (use Upstash ratelimit)
   - Returns status page data, served from Redis cache (TTL: 30s)
   - Cache key: status_page:${slug}
   - On cache miss: query DB, write to cache, return

3. apps/web/middleware.ts — custom domain routing
   - Reads the Host header
   - If Host matches a known custom domain (check Redis hash: custom_domains),
     rewrite the request to /(status)/[slug] with the correct slug
   - If Host is the main app domain, pass through normally
   - On startup, seed the Redis custom_domains hash from the DB

4. Cache warming function in apps/web/lib/cache/statusPages.ts
   - warmStatusPageCache(slug) — fetches fresh data from DB, writes to Redis
   - Called by: the check worker after any status transition on a monitored resource
     that is included in a status page
   - This means status pages reflect new incidents within seconds, not 30s

5. Custom domain setup instructions page in the dashboard
   - Show the CNAME record the user needs to add
   - Show DNS propagation check (ping our API to verify the domain resolves)

Write a test that verifies the middleware correctly rewrites custom domain
requests to the right slug, including the Redis lookup.
```

---

## SESSION 8 — Billing and plan enforcement

```
Read CLAUDE.md. Status pages are committed.

Task: complete the Stripe billing integration and enforce all plan limits.

What to produce:

1. apps/web/lib/stripe.ts — complete Stripe client
   - createCheckoutSession(teamId, priceId) → Stripe Checkout URL
   - createPortalSession(teamId) → Stripe Customer Portal URL
   - getSubscription(stripeCustomerId) → current plan details

2. apps/web/app/(dashboard)/settings/billing/page.tsx — update with real data
   - Show current plan name, renewal date, amount
   - "Upgrade" button (checkout) and "Manage billing" button (portal)
   - Usage bars: monitors X/Y, team members X/Y

3. Stripe webhook handler — verify it handles all three events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   Each must update the team.plan in the DB atomically.

4. Plan limit enforcement — verify these are in place:
   - POST /api/monitors: check canAddMonitor() before creating
   - POST /api/monitors with interval: check canUseInterval() before creating
   - POST /api/status-pages: check status page limit before creating
   - Scheduler: skip monitors where team plan has been downgraded below their
     configured interval (log a warning, don't crash)

5. Upgrade prompt components in apps/web/components/ui/upgrade-prompt.tsx
   - Inline prompt: shown when a resource creation hits a plan limit
   - Shows current plan, limit reached, and a "Upgrade to Pro" CTA

6. Free tier: after 14 days, show a non-blocking banner prompting upgrade
   - Track team.created_at — show banner if on free plan after 14 days
   - Dismissible per session (localStorage), reappears after 7 days

Test the webhook handler against all three Stripe event types using
Stripe's test fixtures. Verify plan correctly updates in DB for each.
```

---

## SESSION 9 — Observability, hardening, and launch prep

```
Read CLAUDE.md. Billing is committed. This is the final session before launch.

Task: wire up all observability and harden the system for production.

Think hard about what can go wrong in production before writing any code.
This session is about reliability, not features.

What to produce:

1. Sentry integration
   - apps/web: @sentry/nextjs — capture unhandled route errors and React errors
   - apps/workers: @sentry/node — capture unhandled job failures
   - Sentry.captureException() in all BullMQ job failure handlers
   - Add sentryMonitorSlug to the scheduler so Sentry Cron Monitors tracks
     whether the scheduler runs on time

2. Pino structured logging — verify everywhere
   - Audit all three worker files: every meaningful action has a log entry
   - Required fields: service, monitorId or teamId (where applicable), durationMs
   - Error logs always include the err object (Pino serializes it correctly)
   - No console.log anywhere in worker code (add an ESLint rule to enforce this)

3. /api/health endpoint — production-ready
   - Queue depth per queue
   - Worker heartbeat (workers write a Redis key every 30s, health checks it)
   - Scheduler last run time
   - DB connectivity (one lightweight query)
   - Returns 200 if healthy, 503 if any critical check fails

4. Rate limiting — verify everywhere
   - /api/monitors (POST): 20 creates per hour per team
   - /api/status-pages/[slug]/data: 60 req/min per IP
   - /api/auth/*: 10 attempts per 15 min per IP (prevent brute force)

5. SIGTERM graceful shutdown — test all three workers
   - Write a test that sends SIGTERM to a running worker and verifies
     it waits for in-flight jobs before exiting (use a slow mock check)

6. Database connection pooling
   - Verify workers use DATABASE_URL_POOLED (PgBouncer)
   - Verify web app uses DATABASE_URL (direct, for migrations)
   - Add a startup check that logs the connection pool size

7. Check results retention policy
   - Add a maintenance worker job (runs daily) that deletes check_results
     older than the team's plan retention window
   - Free: 7 days, Pro: 90 days, Business: 365 days
   - Use DELETE ... WHERE checked_at < $cutoff LIMIT 10000 (batched, not bulk)

8. Pre-launch smoke test script at scripts/smoke-test.ts
   - Creates a test user and team
   - Creates one monitor
   - Manually triggers one check cycle
   - Verifies a CheckResult was written
   - Verifies the health endpoint returns 200
   - Cleans up test data
   Run this in CI before every deploy.

9. Final: update CLAUDE.md "What has been built" checklist to reflect
   everything that is now complete.
```

---

## ONGOING — adding features (use this template)

For any new feature session, use this template:

```
Read CLAUDE.md fully.

Current state: [briefly describe what's been built so far]

Task: [one clearly scoped feature]

Before writing any code, explain your implementation plan:
- What files will you create or modify?
- What DB schema changes are needed (if any)?
- What are the edge cases and how will you handle them?
- What tests will you write?

Wait for my approval of the plan before proceeding.

Constraints:
- Follow all conventions in CLAUDE.md
- Scope all DB queries to teamId
- No changes to the check engine without running the evaluate.test.ts suite
- Commit-ready output: no TODOs, no placeholder code
```

---

## DEBUGGING — use this when something is broken

```
Read CLAUDE.md.

Problem: [describe exactly what is happening vs. what you expect]

Here is the error:
[paste full error with stack trace]

Here are the relevant files:
#[filename1]
#[filename2]

Do NOT speculatively refactor anything outside the immediate problem.
Fix the specific bug, explain why it happened, and suggest one sentence
about how to prevent the same class of bug in the future.
```

---

## REVIEW SESSION — use before merging any significant feature

```
Read CLAUDE.md.

Review the following files for:
1. Security issues (especially: unscoped DB queries, missing auth checks,
   unvalidated user input reaching the DB or queue)
2. Missing error handling (unhandled promise rejections, missing try/catch in workers)
3. Violations of CLAUDE.md conventions
4. Missing or inadequate logging
5. Any code that could cause false positive alerts (changes to evaluate.ts logic)

Files to review:
#[list files changed in this feature]

For each issue found: file name, line number, issue description, suggested fix.
Do not rewrite the files — just report findings. I will decide what to fix.
```

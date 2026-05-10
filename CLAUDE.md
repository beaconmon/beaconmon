# Uptime monitoring SaaS — Claude Code project guide

This file is read automatically by Claude Code at the start of every session.
Keep it updated as decisions are made. It is the single source of truth for
conventions, architecture, and things that must never change without discussion.

---

## Project overview

A bootstrapped website uptime and performance monitoring SaaS. Users add monitors,
the system polls them on a schedule, detects downtime, and sends alerts via email,
Slack, or webhook. Includes public status pages, SSL/domain expiry warnings, and
deep content change monitoring.

**Target users:** freelancers, agencies, small e-commerce businesses.
**Business model:** freemium subscription — Free / Pro ($19/mo, $15/mo annual) / Business ($59/mo, $47/mo annual).
**Trial:** 14-day trial, no card required. Pro trial auto-starts at signup; Business trial starts when clicking the Business CTA (/sign-up?plan=business → POST /api/billing/set-trial-plan).
**Stack:** Next.js, Node.js workers, PostgreSQL, Redis, BullMQ, Paddle, Resend.

---

## Repository structure

```
/
├── apps/
│   ├── web/                     # Next.js 16 app (App Router)
│   │   ├── app/
│   │   │   ├── (dashboard)/     # Auth-gated routes
│   │   │   ├── (status)/        # Public status pages (ISR)
│   │   │   └── api/             # API route handlers
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn/ui base components
│   │   │   └── monitors/        # Domain-specific components
│   │   └── lib/
│   │       ├── auth.ts          # Better Auth config
│   │       ├── paddle.ts        # Paddle client + webhook helpers
│   │       └── repositories/    # All DB access goes here
│   └── workers/
│       ├── scheduler.ts         # Cron — enqueues check jobs + purges old partitions
│       ├── check-worker.ts      # Consumes check-scheduled queue
│       ├── content-worker.ts    # Consumes content-check queue
│       └── alert-worker.ts      # Consumes alert-send queue
├── packages/
│   ├── db/                      # Prisma schema, client, migrations
│   ├── queue/                   # BullMQ job definitions + typed queues
│   ├── checker/                 # Pure check logic (HTTP, TCP, SSL, domain, content)
│   ├── logger/                  # Pino createLogger(service) factory — shared by all apps/workers
│   ├── tsconfig/                # Shared tsconfig bases: base.json, nextjs.json, node.json
│   └── types/                   # Shared TypeScript types
├── CLAUDE.md                    # This file
├── docker-compose.yml           # Local dev: postgres:17 (prod targets PG 18 when stable) + redis + pgadmin
└── turbo.json                   # Turborepo pipeline config
```

---

## Technology decisions (do not change without discussion)

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | SSR for status pages, API routes, one deploy |
| ORM | Prisma | Type safety, migration management |
| Queue | BullMQ + Redis | Reliable job processing, retry logic, concurrency control |
| Auth | Better Auth | Email magic link + credentials, session-based |
| Billing | Paddle | Subscriptions, webhooks, customer portal. MoR — no tax handling needed |
| Email | Resend | Transactional email, React Email templates |
| SMS | Twilio | Alert SMS (tier 2 — Business plan only) |
| HTML parsing | cheerio | Content monitoring, lightweight, no browser needed |
| Logging | Pino | Structured JSON logs, queryable in Axiom |
| Error tracking | Sentry | Automatic exception capture in workers |
| Styling | Tailwind CSS + shadcn/ui | Fast UI, accessible components |
| Package manager | pnpm | Workspace linking, faster installs, stricter dep isolation |
| Monorepo | Turborepo | Shared packages, parallel builds |
| Deployment | Hetzner Cloud + Dokploy | Self-hosted PaaS on a single VPS, Docker-managed multi-service stack. Postgres on Neon, Redis self-hosted in the stack. |
| DNS/CDN | Cloudflare | SSL termination, DDoS, status page edge caching |

---

## Monitor types

Six monitor types ship at launch. Each has distinct check logic and alert conditions.

| Type | What it checks | Alert condition | Creates incident? |
|---|---|---|---|
| `http` | Status code, response time | Non-2xx response OR response time > threshold | Yes |
| `ssl` | Certificate validity, days remaining | Tiered warnings: 30d, 14d, 7d | No — `expiry_alerts` |
| `domain` | WHOIS-based domain expiry | Tiered warnings: 30d, 14d, 7d | No — `expiry_alerts` |
| `tcp` | TCP port open/closed | Port unreachable | Yes |
| `keyword` | Keyword present/absent in response body | Keyword condition fails | Yes |
| `content` | HTML page content (price, text, etc.) | Any detected change | No — notification only |

**Content monitoring notes:**
- HTML-only parsing via `cheerio`. No JavaScript rendering (no Playwright).
- A `requires_js` boolean is reserved in the schema for future browser-based checks.
- Users target a CSS selector or check the full page body.
- A snapshot of the last-seen content is stored on the monitor record.
- Changes trigger a notification, not an incident (no `resolved_at` concept).

**HTTP monitor extras:**
- `response_time_threshold_ms` — optional per-monitor alert threshold for slow responses.
- `keyword` + `keyword_condition` — inline keyword check without a separate monitor.

---

## Architecture rules — enforced always

### 1. Web app and workers never call each other directly
Communication happens only through the job queue (BullMQ) or the shared database.
The web app writes monitor configs to the DB. Workers read the queue, execute checks,
write results to the DB, and enqueue alert jobs. No direct HTTP calls between services.

### 2. All database access goes through repositories
No raw Prisma calls in route handlers or worker code. Web-facing DB operations live
in `apps/web/lib/repositories/` — every function takes `teamId` as its first argument
and scopes all queries to that team. This is the tenant isolation boundary.

Worker-only repositories live in `packages/db/src/repositories/` and are imported as
`@beaconmon/db`. These operate on trusted job payloads (monitorId from the queue) and
do not require teamId scoping since the data was already tenant-scoped at enqueue time.

```typescript
// CORRECT
const monitors = await monitorRepository.findAll(teamId);

// NEVER do this in a route handler
const monitors = await prisma.monitor.findMany();
```

### 3. Tenant isolation is not optional
Every query that touches user data must have a `WHERE team_id = $teamId` clause.
The repository pattern enforces this. If you are ever writing a query without
scoping to a teamId, stop and reconsider.

### 4. Check results table is always partitioned
The `check_results` table uses PostgreSQL range partitioning on `checked_at` with
monthly partitions. Never query this table without a time range in the WHERE clause.
Index: `(monitor_id, checked_at DESC)` — always use this for dashboard queries.

### 5. Alerts must be idempotent
Before sending any alert, check the `notifications` table for an existing record
with the same `(incident_id, channel_id)` within the last 5 minutes. If one exists,
skip sending. This prevents duplicate alerts on worker retries.

### 6. Workers must handle SIGTERM gracefully
Every worker process registers a SIGTERM handler that pauses the queue, waits for
in-flight jobs to complete (10-second timeout), disconnects the DB, then exits.
Dokploy sends SIGTERM on redeploy. Without this, you get corrupted check state.

### 7. Never mark a monitor down on a single failed check
A monitor transitions to `down` status only after 2 consecutive failed checks.
This lives in the `evaluateCheckResult()` function in `packages/checker/`.
Do not bypass this logic anywhere.

### 8. Status pages are ISR, not SSR
Public status pages use Next.js ISR with `revalidate: 30`. Status page data is
read from Redis cache, not directly from Postgres. During incidents, thousands of
users refresh the status page — this must not hit the database.

### 9. SSL and domain expiry are warnings, not incidents
SSL and domain expiry checks write to the `expiry_alerts` table, not the `incidents`
table. They have no `resolved_at`. Never route expiry notifications through the
incident pipeline.

### 10. Content monitoring uses HTML-only parsing
The `content-worker` uses `cheerio` to parse HTML. Never use Playwright or any
headless browser in the worker fleet — it creates unacceptable memory pressure on
the single-VPS Dokploy stack. The `requires_js` flag on monitors is reserved for a
future browser-render tier and must not be acted on until that tier is built.

### 11. check_results queries must respect plan retention limits
Repository functions that query `check_results` must clamp the `from` date to the
team's plan retention window (Free=7d, Pro=90d, Business=365d). Do not expose data
beyond the plan limit even though the underlying partitions may contain it.

---

## Environment variables

All services share the same variable schema. In production, set vars in Dokploy's
environment-variable UI for the stack — Dokploy writes them to `.env` which
`docker-compose.production.yml` interpolates. Use `.env.local` for local dev
(gitignored). Never commit secrets.

```bash
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_POOLED=postgresql://...  # PgBouncer URL for workers

# Redis
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://yourdomain.com

# Paddle
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRO_PRICE_ID=
PADDLE_BUSINESS_PRICE_ID=
PADDLE_PRO_ANNUAL_PRICE_ID=
PADDLE_BUSINESS_ANNUAL_PRICE_ID=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=
NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID=
NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID=
NEXT_PUBLIC_PADDLE_BUSINESS_ANNUAL_PRICE_ID=

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=alerts@yourdomain.com

# SMS (tier 2 — Business plan only)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Error tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=        # Same value as SENTRY_DSN — needed for client-side capture
SENTRY_AUTH_TOKEN=             # CI only — for source map uploads to Sentry
SENTRY_MONITOR_SLUG=beaconmon-scheduler  # Sentry Cron Monitor slug for the scheduler

# Storage (tier 2 — reports)
R2_BUCKET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Slack OAuth (incoming-webhook scope)
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Multi-location checks (Cloudflare Workers — deployed 2026-05-07)
FEATURE_MULTI_LOCATION=true
REGION_PROBE_SECRET=             # 32+ char shared secret; also set via: wrangler secret put REGION_PROBE_SECRET
CF_PROBE_URL_US_EAST=https://beaconmon-probe-us-east.beaconmon.workers.dev
CF_PROBE_URL_US_WEST=https://beaconmon-probe-us-west.beaconmon.workers.dev
CF_PROBE_URL_EU_WEST=https://beaconmon-probe-eu-west.beaconmon.workers.dev
CF_PROBE_URL_AP_SOUTHEAST=https://beaconmon-probe-ap-southeast.beaconmon.workers.dev
CF_PROBE_URL_SA_EAST=https://beaconmon-probe-sa-east.beaconmon.workers.dev

# Feature flags
ALERT_DRY_RUN=false              # Set to true in dev to log alerts instead of sending
FEATURE_SMS_ALERTS=false
FEATURE_HEARTBEAT=false          # Post-launch: inverse monitoring (your service pings us)
FEATURE_AGENCY=false
```

---

## Data model summary

### Core tables

**`teams`** — the billing and ownership unit. Users belong to teams. Columns include `trial_ends_at`.

**`users`** — authenticated users. One user can belong to multiple teams.

**`team_members`** — join table with role (`owner`, `admin`, `viewer`).
- `owner` — full access + billing management
- `admin` — full access except billing
- `viewer` — read-only, no create/edit/delete

**`team_invitations`** — pending email invites. Columns: `id, team_id, email, role, token, expires_at, accepted_at`. Token is a signed, expiring value (7-day TTL).

**`subscriptions`** — Stripe subscription state. Columns: `id, team_id, stripe_customer_id, stripe_subscription_id, plan, status, trial_ends_at, current_period_end`.

**`monitors`** — the thing being monitored. Key columns:
- `type` — enum: `http | ssl | domain | tcp | keyword | content`
- `current_status` — denormalized cache: `up | down | paused`
- `is_active` — boolean; false = paused (scheduler skips it)
- `interval_seconds` — per-monitor, clamped to plan minimum at API layer
- `config` — jsonb for type-specific settings (port number, selector, etc.)
- `response_time_threshold_ms` — nullable; HTTP only
- `keyword` — nullable; HTTP/keyword monitors
- `keyword_condition` — enum: `present | absent`
- `content_snapshot` — nullable text; content monitors store last-seen HTML here
- `content_last_changed_at` — nullable timestamp
- `requires_js` — boolean, reserved (always false at launch)

**`check_results`** — partitioned table. One row per check execution. Purged after 365 days via partition drop.

**`incidents`** — one row per downtime event. Columns include `started_at`, `resolved_at`, `resolution_type` (`automatic | manual`). Manual resolution suppresses further alerts but does not change `monitors.current_status`.

**`expiry_alerts`** — SSL and domain expiry warnings (not incidents). Columns: `id, team_id, monitor_id, type (ssl|domain), days_remaining, threshold, sent_at`.

**`alert_channels`** — where to send alerts. `type` enum + `config` jsonb pattern makes adding new channel types a code-only change (no schema migration). Launch channels: `email | slack | webhook`. Tier 2: `sms`.

**`notifications`** — log of sent alerts. Used for idempotency checks.

**`status_pages`** — public status page config. `slug` for subdomain, `custom_domain` for CNAME.

**`status_page_monitors`** — join table controlling which monitors appear on a status page. Columns: `id, status_page_id, monitor_id, display_order`.

### Status page content (at launch)
- Overall system status ("All systems operational" / "Partial outage" / "Major outage")
- Per-monitor status for exposed monitors
- 90-day uptime % per monitor
- Active incident banner
- Incident history

### Key indexes to maintain
```sql
-- Always present — dashboard and check comparison queries
CREATE INDEX check_results_monitor_time ON check_results (monitor_id, checked_at DESC);

-- For scheduler — find monitors due for checking
CREATE INDEX monitors_next_check ON monitors (next_check_at) WHERE is_active = true;

-- For status page custom domain lookup
CREATE UNIQUE INDEX status_pages_custom_domain ON status_pages (custom_domain)
  WHERE custom_domain IS NOT NULL;
```

---

## Queue job types

All job definitions live in `packages/queue/`. TypeScript types are enforced.

```typescript
// check-scheduled — enqueued by scheduler per active non-content monitor
type CheckJob = {
  monitorId: string;
  url: string;
  type: 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword';
  intervalSeconds: number;
  timeoutMs: number;
}

// content-check — enqueued by scheduler for content monitors
type ContentCheckJob = {
  monitorId: string;
  url: string;
  intervalSeconds: number;
}

// alert-send — enqueued by check worker on status transition
type AlertJob = {
  incidentId: string;
  monitorId: string;
  teamId: string;
  type: 'down' | 'up';
  durationMs?: number;   // only present for 'up' (recovery)
}

// report-generate — enqueued weekly for paid users (tier 2)
type ReportJob = {
  teamId: string;
  periodStart: string;
  periodEnd: string;
}
```

Queue configuration:
- `check-scheduled` — concurrency: 50 per worker, attempts: 1 (no retries — wait for next interval)
- `content-check` — concurrency: 10 per worker, attempts: 2
- `alert-send` — concurrency: 10, attempts: 5, backoff: exponential (alerts must eventually send)
- `report-generate` — concurrency: 2, attempts: 3

---

## API route conventions

All API routes live under `apps/web/app/api/`.

```
/api/monitors                        GET (list), POST (create)
/api/monitors/[id]                   GET, PATCH, DELETE
/api/monitors/[id]/pause             POST — toggle is_active
/api/monitors/[id]/results           GET — paginated check results (clamped to plan retention)
/api/incidents                       GET — list incidents for team
/api/incidents/[id]/resolve          PATCH — manual resolution
/api/status-pages                    GET, POST
/api/status-pages/[slug]/data        GET — public, rate-limited, Redis-cached
/api/team/invitations                GET (list), POST (send invite)
/api/team/invitations/[token]/accept POST — public endpoint, accepts invite
/api/webhooks/paddle                 POST — Paddle webhook handler
/api/health                          GET — queue depth, worker status (internal monitoring)
```

Route handler pattern — always follow this:

```typescript
// apps/web/app/api/monitors/route.ts
import { auth } from '@/lib/auth';
import { monitorRepository } from '@/lib/repositories/monitors';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.teamId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const monitors = await monitorRepository.findAll(session.user.teamId);
    return Response.json(monitors);
  } catch (err) {
    logger.error({ err, teamId: session.user.teamId }, 'Failed to list monitors');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Coding conventions

### TypeScript
- Strict mode always on (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow
- Zod for all external input validation (API bodies, env vars, job payloads)
- Return `Result<T, E>` types from repository functions, not raw throws

### Error handling
- Workers: catch all errors in job handlers, log with `logger.error()`, let BullMQ handle retries
- API routes: never expose internal error details to clients
- Use Sentry for unexpected exceptions: wrap worker `process()` in try/catch with `Sentry.captureException`

### Logging (Pino)
```typescript
// Every log must include service name and relevant entity IDs
logger.info({ service: 'check-worker', monitorId, durationMs }, 'Check completed');
logger.error({ service: 'alert-worker', incidentId, err }, 'Alert send failed');

// Never use console.log in production code
```

### Testing
- Unit tests: Vitest for pure functions (especially `packages/checker/`)
- Integration tests: Test repositories against a real test DB (use Docker in CI)
- No mocking of the database in tests — use test transactions that roll back
- Test file co-location: `foo.ts` → `foo.test.ts` in the same directory

---

## Feature flags

Use environment variables for feature flags at MVP scale.
No feature flag service needed until > $10k MRR.

```typescript
export const features = {
  smsAlerts: process.env.FEATURE_SMS_ALERTS === 'true',
  multiLocation: process.env.FEATURE_MULTI_LOCATION === 'true',
  heartbeatMonitoring: process.env.FEATURE_HEARTBEAT === 'true',
  agencyDashboard: process.env.FEATURE_AGENCY === 'true',
};
```

---

## Plan tiers and limits

```typescript
export const PLAN_LIMITS = {
  free: {
    monitors: 10,
    checkIntervalSeconds: 300,   // 5 minutes minimum
    historyDays: 7,
    statusPages: 1,
    teamMembers: 1,
    alertChannels: 1,
  },
  pro: {
    monitors: 25,
    checkIntervalSeconds: 60,    // 1 minute minimum
    historyDays: 90,
    statusPages: 3,
    teamMembers: 5,
    alertChannels: 5,
  },
  business: {
    monitors: -1,                // unlimited
    checkIntervalSeconds: 30,    // 30 seconds minimum
    historyDays: 365,
    statusPages: -1,
    teamMembers: -1,
    alertChannels: -1,
  },
} as const;
```

Check intervals are **per-monitor configurable** within plan bounds. Enforce the
minimum at the API layer on create and update. Never trust client-sent interval values.

```typescript
const minInterval = PLAN_LIMITS[team.plan].checkIntervalSeconds;
if (input.intervalSeconds < minInterval) {
  return error(400, `Your plan minimum check interval is ${minInterval}s`);
}
```

---

## Onboarding flow

1. User signs up via email magic link (Better Auth)
2. A personal team is auto-created (named "{User}'s Workspace", renameable)
3. 14-day Pro trial auto-starts — no card required
4. User lands on an empty dashboard with a single "Add your first monitor" CTA
5. No multi-step wizard

---

## Data retention

- `check_results` is partitioned monthly. All data retained for **365 days**.
- A nightly scheduler job identifies and drops monthly partitions older than 365 days.
- Per-plan query limits (7d / 90d / 365d) are enforced in the repository layer, not the storage layer.
- No per-team data deletion at the storage layer (revisit for GDPR compliance post-launch).

---

## Local development

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
pnpm install

# Apply DB migrations
pnpm run db:migrate

# Start all services in watch mode
pnpm run dev
# This runs concurrently:
#   - Next.js dev server (port 3000)
#   - Check worker (tsx watch)
#   - Content worker (tsx watch)
#   - Alert worker (tsx watch)
#   - Scheduler (tsx watch)

# Run tests
pnpm run test

# Type check all packages
pnpm run typecheck
```

---

## Deployment (Hetzner + Dokploy)

Stack at a glance:

- **Compute:** one Hetzner CPX22 VPS in Nuremberg running Dokploy, which orchestrates the seven app containers + Redis defined in `docker-compose.production.yml`.
- **Postgres:** Neon (`aws-us-east-2`). Migrations run from a developer laptop against the direct URL; web + workers use the pooled URL at runtime.
- **Redis:** self-hosted in the stack (AOF on, `noeviction` for BullMQ). Not Upstash — BullMQ's per-command billing pattern makes Upstash expensive.
- **Edge:** Cloudflare proxies `beaconmon.com` to the Hetzner public IP. Dokploy provisions the origin Let's Encrypt cert.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) gates merges with typecheck + lint + tests + Docker build. Dokploy auto-deploys on push to `main`.

Seven services in the Compose stack, all from the same Docker image with different `command:` overrides:

| Service | Start command | Scale |
|---|---|---|
| web | `pnpm run start:web` | 1 instance, auto-restart |
| check-worker | `pnpm run start:worker:checks` | Start 1, scale to N |
| content-worker | `pnpm run start:worker:content` | 1 instance |
| alert-worker | `pnpm run start:worker:alerts` | 1 instance |
| escalation-worker | `pnpm run start:worker:escalation` | 1 instance |
| report-worker | `pnpm run start:worker:report` | 1 instance |
| scheduler | `pnpm run start:scheduler` | 1 instance (must be singleton) |

**Deploy checklist before going live:**
- [ ] `DATABASE_URL` and `DATABASE_URL_POOLED` both point to the **Neon pooled URL** at runtime (only laptop migrations use the direct URL)
- [ ] `ALERT_DRY_RUN=false` in production
- [ ] Paddle webhook endpoint registered and `PADDLE_WEBHOOK_SECRET` set
- [ ] `SENTRY_DSN` set in Dokploy env vars (propagates to all services)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set (client-side error capture)
- [ ] `SENTRY_AUTH_TOKEN` set in GitHub Actions secrets if uploading source maps
- [ ] Create a Sentry Cron Monitor with slug `beaconmon-scheduler` (or whatever `SENTRY_MONITOR_SLUG` is set to)
- [ ] Health check endpoint responding at `/api/health` with all workers showing `alive: true`
- [ ] Run `pnpm smoke-test` after deploy before flipping DNS
- [ ] Self-monitoring: add `https://beaconmon.com` as a monitor after deploy
- [ ] Hetzner backups enabled on the VPS

**Observability / rate limiting added in production hardening:**
- Worker heartbeats: each worker writes `worker:heartbeat:{name}` to Redis every 30s (TTL 120s)
- Health endpoint (`/api/health`) checks: Redis + queue depths + scheduler last run + worker heartbeats + DB ping. Returns 503 if Redis or DB fails.
- Rate limits: POST /api/monitors → 20/hr per team; POST /api/auth/* → 10/15min per IP (fail-open on Redis unavailability); GET /api/status-pages/[id]/data → 60/min per IP
- Sentry cron monitor: scheduler reports check-in status every tick (uses 1-minute interval in Sentry)
- Per-plan retention cleanup runs daily in the scheduler (Free 7d, Pro 90d; Business is handled by partition purge)

---

## What has been built (update this as you go)

- [x] Monorepo scaffold (Turborepo, packages, apps)
- [x] Docker-compose local dev environment
- [x] Prisma schema and initial migration
- [x] Better Auth setup (email magic link)
- [x] Team auto-creation on signup + 14-day Pro trial
- [x] Team invitation flow (`team_invitations` table, email invite link)
- [x] Paddle subscription integration (`subscriptions` table, customer portal)
- [x] Paddle billing gates (plan limits enforced at API layer + scheduler throttle)
- [x] Monitor CRUD API (all 6 types)
- [x] Per-monitor pause/unpause (`is_active` toggle)
- [x] BullMQ queue setup (packages/queue)
- [x] Check worker (HTTP, SSL, domain, TCP, keyword)
- [x] Content worker (HTML-only change detection via cheerio)
- [x] Scheduler (cron → enqueue check jobs + nightly partition purge + daily retention cleanup)
- [x] Alert worker (email via Resend, Slack webhook, generic webhook)
- [x] Expiry alerts (SSL + domain, tiered warnings at 30/14/7 days)
- [x] Incident management (auto + manual resolution)
- [x] Dashboard UI (monitor list, status, response time)
- [x] Status page (ISR, Redis cache, 90-day uptime %, incident history)
- [x] Sentry integration (@sentry/nextjs for web, @sentry/node for workers, cron monitor on scheduler)
- [x] Pino structured logging in all workers (no console.log; ESLint rule enforces this)
- [x] Graceful shutdown handlers on all workers (10s drain timeout)
- [x] Graceful shutdown unit tests (shutdown.test.ts)
- [x] Worker heartbeats (Redis, 30s interval, read by /api/health)
- [x] /api/health — queue depth + worker heartbeats + DB ping + scheduler last run
- [x] Rate limiting — POST /api/monitors (20/hr/team), POST /api/auth/* (10/15min/IP)
- [x] Per-plan check_results retention cleanup (daily, batched DELETE, Free 7d / Pro 90d)
- [x] Smoke test script (`pnpm smoke-test`) — DB + Redis + check cycle + health endpoint
- [x] Deploy-aware monitoring (deploy_events table, webhook + manual buttons, alert suppression, 30-min auto-expire)
- [x] SLO / error budget tracking (per-monitor SLO target, fast/slow burn-rate alerts, plan-gated)
- [x] Content snapshot history + diff view (content_snapshots table, list + diff API, plan-gated retention 3/30/90)
- [x] Competitor tracking preset (is_competitor flag on monitors, `/api/monitors/competitor-presets` endpoint with suggested selectors)
- [x] Multi-location checks (Cloudflare Workers) — post-launch
- [x] Heartbeat monitoring — post-launch
- [x] Scheduled maintenance windows — post-launch
- [ ] SMS alerts (Twilio) — tier 2, Business plan only
- [ ] Agency multi-client dashboard — post-launch

---

## Known decisions and tradeoffs

- **No microservices.** Workers are separate processes in a monorepo, not separate
  services with their own repos. This keeps operational complexity low for a solo founder.

- **Prisma over raw SQL.** Migration management and type safety outweigh the
  performance cost at our scale. If query performance becomes an issue, use
  `prisma.$queryRaw` for specific hot paths.

- **ISR over edge functions for status pages.** Simpler to reason about, sufficient
  for our SLA. Revisit if status page load > 500ms at scale.

- **No event sourcing.** Simple state transitions (up/down) stored directly in
  `incidents` table. Event sourcing adds complexity we don't need until > $50k MRR.

- **BullMQ over a managed queue (SQS, etc.)** Lower cost at our scale, simpler local
  dev (Redis is already required), and BullMQ's dashboard (Bull Board) is useful for
  debugging. Revisit if reliability becomes an issue.

- **Per-monitor interval, plan minimum enforced at API layer.** Users can set any
  interval per monitor as long as it meets their plan's minimum. The scheduler reads
  `next_check_at` per monitor — no plan-level interval override needed.

- **Manual incident resolution suppresses alerts, does not change monitor status.**
  Setting `resolution_type = 'manual'` closes the incident for alerting purposes but
  `monitors.current_status` stays `down` until checks recover. This prevents a
  resolved incident from masking continued downtime.

- **365-day partition retention; per-plan limits enforced in query layer.**
  Dropping partitions per-team would require partial partition management — not
  worth the complexity at this scale. All partitions live for 365 days; the
  repository clamps queries to the plan's `historyDays` limit.

- **14-day Pro trial, no card required.** Highest-converting approach for freemium.
  The free plan limits (10 monitors, 5-min interval) are too restrictive to act as a
  real trial. Trial state tracked in `teams.trial_ends_at` and `subscriptions.status`.

- **HTML-only content monitoring.** Playwright adds ~300MB RAM per instance and
  would dominate the single Hetzner VPS. The vast majority of target use cases (pricing pages,
  legal disclaimers) are server-rendered. `requires_js` is reserved in the schema
  for a future browser-render tier.

- **Email + Slack + generic webhook at launch.** The `type` enum + `config` JSONB
  pattern on `alert_channels` means adding SMS, Discord, or PagerDuty requires no
  schema migration — just a new handler in the alert worker.

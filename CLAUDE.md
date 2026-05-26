# CLAUDE.md

## What this is

Beaconmon is a bootstrapped SaaS for uptime monitoring, competitor intelligence, and content change monitoring focused on eCommerce businesses, especially Shopify and WooCommerce stores.

Core positioning:
- Competitor intelligence for eCommerce
- Website uptime and performance monitoring
- Content and pricing change detection
- Intelligence digests and monitoring automation

## Commands

```bash
pnpm dev             # start everything
pnpm typecheck       # before committing
pnpm test            # Vitest
pnpm db:migrate      # after schema changes
pnpm db:generate     # regenerate Prisma client after schema changes
pnpm db:seed         # seed initial data

# Run a single package
pnpm --filter @beaconmon/workers dev
pnpm --filter @beaconmon/web dev
pnpm --filter @beaconmon/checker test
```

## Non-obvious constraints (read before touching these areas)

**Tenant isolation is the hard rule.** Every web-facing repository function takes `teamId` as its first argument. There are no exceptions. Worker repositories (`packages/db/src/repositories/`) are exempt because job payloads are already tenant-scoped at enqueue time.

**Workers use `DATABASE_URL_POOLED`, not `DATABASE_URL`.** The direct URL is only for migrations run from a laptop.

**Never mark a monitor down on a single failure.** Two consecutive failures required. Logic lives in `evaluateCheckResult()` in `packages/checker/`. Do not bypass it.

**Scheduler must stay at one replica.** It is a singleton. Scaling it causes duplicate jobs.

**Redis uses `noeviction` policy with AOF durability.** BullMQ job data must not be evicted. Never change the eviction policy.

**SSL/domain expiry writes to `expiry_alerts`, not `incidents`.** They are warnings with no `resolved_at`. Never route them through the incident pipeline.

**Status pages are ISR (revalidate: 30) reading from Redis.** They must not hit Postgres directly. During incidents, hundreds of users may refresh simultaneously.

**`check_results` is range-partitioned by month.** Always include a time range in WHERE clauses. Queries must also clamp to the team's plan retention window (enforced in the repository layer, not at the DB layer).

**Alert sends must be idempotent.** Check `notifications` for `(incident_id, channel_id)` within the last 5 minutes before sending.

**Content monitoring is HTML-only (cheerio).** `requires_js` exists in the schema but must not be acted on. No Playwright in the worker fleet; RAM pressure on the single VPS would be fatal.

## Domain decisions worth knowing

**Freemius, not Stripe.** Freemius is the MoR so we don't handle tax. Billing cycle is an integer (1 = monthly, 12 = annual). One plan ID per tier, not two.

**Competitor tracking is a first-class feature.** The `is_competitor` flag on monitors and the `/api/monitors/competitor-presets` endpoint exist specifically for the e-commerce ICP. Content monitors are the primary mechanism for tracking competitor price and promo changes.

**Manual incident resolution suppresses alerts but does not change monitor status.** `monitors.current_status` stays `down` until checks recover. This is intentional to prevent masking continued downtime.

**AI features are Growth/Scale only and fail open.** `AI_PROVIDER=noop` is the safe default. If a real provider is configured without `AI_API_KEY`, it falls back to noop rather than erroring.

**The onboarding wizard targets e-commerce from step 1.** Step 1 detects Shopify/WooCommerce. Step 3 is competitor setup. All monitors are created in bulk at the end of step 3, not incrementally.

## Writing style

Never use em dashes, en dashes, or double hyphens in any user-facing copy or comments. Use commas, periods, or restructure the sentence.

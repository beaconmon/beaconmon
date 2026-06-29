# Shopify App Pre-Submission Plan

Status: **Planned, not started.** Implement in a fresh session, one session per heading below.
Last updated: 2026-06-29.

## Goal

Get the embedded Shopify app (`apps/shopify`) ready for App Store submission by:
1. Turning the competitor tab from an intent-capture teaser into a **functional competitor intelligence screen**, wired to the existing engine.
2. Surfacing ICP-resonant uptime data (revenue-at-risk, 30-day history, BFCM mode).
3. A small commodity-polish pass last.

This plan supersedes the original three-phase "Beaconmon Shopify App Pre-Submission Build" spec, which was written as if competitor monitoring were greenfield. **It is not.** See "Critical context" below.

---

## Critical context: the competitor engine already exists

The original spec proposed building a keyword/Levenshtein `classifyCompetitorEvent.ts`, a new `competitor_events` table, and competitor branching in the incident alert job. **Do none of that.** A complete, AI-based competitor intelligence engine already exists in the main app and workers. The Shopify app just needs to drive it.

What exists today (verified 2026-06-29):

- **Domain model** (`packages/db/prisma/schema.prisma`): `Competitor` (catalog discovery + data tiers), `CompetitorPage` (URL + selector content monitoring with snapshots), `CompetitorProduct` (catalog with prices/variants/stock), `CompetitorEvent` (types: `product_added`, `product_removed`, `price_changed`, `stock_changed`, `out_of_stock`, `back_in_stock`, `site_changed`, `promo_detected`, `sale_started`, `sale_ended`; `significance` low/medium/high), `CompetitorDecision` (`ignore`/`match`/`counter`/`leapfrog`), `CompetitorNotificationChannel` (links a competitor to an `AlertChannel`). Migration `0004_competitor_event_significance`.
- **Worker pipeline** (`apps/workers/process-competitor-page-check-job.ts`): runs `runContentCheck` (cheerio, HTML-only), hashes/diffs snapshots, dedups via Redis, classifies changes with **AI** (`runAiAnalysisIfEligible` -> noise/pricing/site_changed) plus rule-based + AI significance (`packages/ai/src/significance.ts`). Suppresses high-confidence noise. Persists snapshot + event atomically. Sends the `first-competitor-change` lifecycle email.
- **Catalog discovery**: Shopify-platform competitors get `dataTier: 'full_catalog'` and an extraction fallback ladder (Shopify feed -> products.json -> sitemap JSON-LD -> limited), producing product-level `price_changed` / `out_of_stock` / `back_in_stock` events. Non-Shopify competitors start `limited`.
- **Notification pipeline**: `apps/workers/process-competitor-notify-job.ts` (+ test) and `competitor-notify-worker.ts` are separate from the incident alert path. Fires when a `CompetitorNotificationChannel` is configured for the competitor.
- **Web API + repository**: `apps/web/app/api/competitors/` (create, list, delete, events, discovery, products CSV, events CSV, detect) over `apps/web/lib/repositories/competitors.ts` (`competitorRepository`), which is fully teamId-scoped and has every method we need: `create` (also creates a default tracked `CompetitorPage`), `countActive`, `findAll`, `findById`, `softDelete`, `findEvents` (cursor paginated, includes `decision`), `addPage`, `findChannels`/`addChannel`/`removeChannel`, `upsertDecision`/`deleteDecision`, `findProducts`, `findEventsForExport`, `findFeed`.
- **Scheduler auto-pickup** (`apps/workers/scheduler.ts`): scans `competitor_pages` where the competitor is active and `nextCheckAt <= now OR null`, and periodically re-enqueues catalog syncs. **So once the Shopify app creates a `Competitor` + `CompetitorPage`, all monitoring/classification/notification happens automatically. No scheduler or worker changes are needed for competitor monitoring.**
- **Plan limits** (`packages/types/src/plan.ts`): `competitorMonitors` = **free: 1**, growth: 5, scale: 25, enterprise: -1. The funnel-to-paid cap is already built; reuse it.
- **`apps/shopify` already depends on** `@beaconmon/db`, `@beaconmon/queue`, `@beaconmon/types`, `@beaconmon/emails`. It can drive the engine directly.

### The Shopify app's current state
`apps/shopify/app/routes/app.competitors.tsx` is a **pure teaser**: it stores requested domains in `shopifyInstall.competitorIntent` (JSON array, cap 10) and shows mock/global preview product cards. It never creates real `Competitor` records.

### teamId resolution in the Shopify app
`authenticate.admin(request)` -> `session.shop` -> `prisma.shopifyInstall.findUnique({ where: { shop } })` -> `install.teamId` (nullable until the `afterAuth` provisioning hook in `apps/shopify/app/shopify.server.ts` -> `lib/provision.server.ts` backfills it). Handle `teamId === null` gracefully (provisioning still in flight).

---

## Locked decisions (from planning interview, 2026-06-29)

- **Wire to the existing engine.** Do not rebuild classification, do not add a table, do not use `monitors.is_competitor`.
- **v1 competitor features**: add / list / remove + **events feed** (baseline), plus **product price & stock feed**, **one-tap decision actions** (Match/Counter/Ignore), and **CSV export**. Competitor catalog view is **deferred to v2**.
- **Alert wiring**: on competitor add, **auto-wire the store owner email** as an `AlertChannel` and link it via `CompetitorNotificationChannel`, so the merchant is alerted with zero config. They can add more channels later.
- **Teaser data migration**: **show the saved `competitorIntent` list and let the merchant activate one** as their live competitor (respects free cap = 1). Do not silently auto-convert.
- **Commodity items** (SSL card, response time, Discord channel, multiple recipients) are a deprioritized final polish pass.
- **Competitor flip confirmed**: ship functional competitor monitoring pre-submission (overrides the earlier "intent-capture only until v2" MVP decision).

---

## Constraints to honor (from CLAUDE.md)

- **Tenant isolation**: every web-facing repository function takes `teamId` first. The promoted competitor repository must keep this. Worker repos are exempt.
- **No Playwright / HTML-only** content monitoring (cheerio). The engine already complies; do not introduce anything `requires_js`.
- **Status pages are ISR from Redis** — the settings link is just a URL string; never query Postgres for it.
- **`check_results` is range-partitioned by month** — always include a time range in WHERE clauses and clamp to the team's plan retention window in the repository layer.
- **Workers use `DATABASE_URL_POOLED`**; the scheduler stays at one replica (singleton).
- **Writing style**: no em dashes, en dashes, or double hyphens in user-facing copy or comments.
- After code changes, run `pnpm typecheck`, `pnpm test`, and `graphify update .`.

---

## Session A — Shared: promote the competitor repository (prep)

The teamId-scoped `competitorRepository` lives in `apps/web/lib/repositories/competitors.ts` and cannot be imported by `apps/shopify`. Promote it so both apps share one implementation.

1. Move `competitorRepository` (and its exported row/types) into `packages/db` (e.g. `packages/db/src/repositories/competitors-team.ts`, exported from the package index). Keep it teamId-first.
2. It currently throws `NotFoundError` / `ValidationError` from `@/lib/api/errors`. Replace with package-neutral typed errors exported from `@beaconmon/db` (or have methods return null and let each app's route translate to its HTTP error). Decide one approach and apply consistently.
3. Update `apps/web` imports to the new location; keep the web API behavior identical. Re-export from the old path if that minimizes churn.
4. The **create-with-discovery side effects** (enqueue `catalog-sync` to the Shopify feed queue, set the dedup guard key, set `discoveryState: 'syncing'`) currently live in `apps/web/app/api/competitors/route.ts`. Either (a) extract a small `provisionCompetitorDiscovery({ competitorId, teamId, domain, platform }, { queue, redis })` helper that both apps call with injected `@beaconmon/queue` instances, or (b) replicate the ~15-line block in the Shopify route. Prefer (a) if it stays free of new cross-package coupling.

Done when: `pnpm typecheck` and `pnpm test` pass and the web competitor API is unchanged.

---

## Session B — Shopify competitor wiring (the core)

Rewrite `apps/shopify/app/routes/app.competitors.tsx` from teaser to functional, plus resource routes. Use Polaris components (match existing file). All copy follows the no-dash style.

**Loader** (`teamId` from install):
- `competitorRepository.findAll(teamId)` for the monitored list (show `discoveryState`: syncing/ready/failed).
- For the single competitor, recent events via `findEvents(teamId, competitorId, { limit })`, including `decision`. Format `price_changed` (old -> new price from `payload`), `out_of_stock`/`back_in_stock`, `promo_detected`, `site_changed`, with significance badges.
- The saved `shopifyInstall.competitorIntent` list (for the activate-from-teaser flow).
- Team plan for the cap, and whether an owner-email channel exists.

**Action** (intent-dispatched):
- `create`: enforce `PLAN_LIMITS[plan].competitorMonitors` via `countActive(teamId)`; validate public http(s) URL; `competitorRepository.create(teamId, { name, url, platform })`; provision discovery (Session A step 4); **auto-wire owner email**: ensure an email `AlertChannel` exists for `install.ownerEmail` (use the alert-channels repository, `packages/db/src/repositories/alert-channels.ts`) then `addChannel(teamId, competitorId, channelId)`. Default page interval stays the model default (`3600s`); do not set 300s (single-VPS load). BFCM tightening is handled in Session D.
- `activate-from-intent`: same as `create` but seeded from a saved `competitorIntent` domain; remove it from the intent array on success.
- `delete`: `competitorRepository.softDelete(teamId, id)`.
- `decision`: `competitorRepository.upsertDecision(teamId, eventId, response, note, decidedBy)` where `response` in {match, counter, ignore}; `decidedBy = install.ownerEmail ?? 'shopify'`. Support clearing via `deleteDecision`.

**Resource route** for CSV export: `apps/shopify/app/routes/api.competitors.$id.events[.]csv.tsx` (or similar) using `findEventsForExport(teamId, id, { days })`. Stream `text/csv`.

**UI**:
- Primary CTA "Add competitor store" (disabled / upgrade note at cap = 1).
- Monitored competitor card: status dot, discovery state, last check, last event summary, "View events", "Remove".
- Events feed with product price/stock changes, significance badges, and Match/Counter/Ignore buttons per event.
- Keep an upgrade teaser below for monitoring more than 1 competitor.
- If `teamId` is null (provisioning in flight), show a friendly "setting things up" state.

Done when: a merchant can add a competitor, see it reach `ready`, receive events as the engine produces them, record a decision, export CSV, and remove it. Verify the scheduler picks up the new `CompetitorPage` (no extra wiring expected).

---

## Session C — ICP uptime surfacing (Phase 1 ICP + status page)

`apps/shopify/app/routes/app._index.tsx`, `app.settings.tsx`, new `app.history.tsx`, and one migration.

- **Revenue at risk**: add `shopify_installs.settings Json NOT NULL DEFAULT '{}'` migration. Settings input "Average hourly revenue" stored there. On `_index`, when the storefront monitor is currently down, show a yellow banner: "Your store has been down for N minutes. Estimated revenue impact: ~$X" where `X = (downtimeMins / 60) * avgHourlyRevenue`. Only show if revenue is set. Needs open-incident start time (incidents repository) for downtime duration.
- **30-day uptime history**: new `app.history.tsx` tab. Query `check_results` grouped by day with a time range, **clamped to the team's plan retention window**. Header "99.x% uptime last 30 days" + a 30-square heatmap + a flat incident list. This uptime number is the key review-conversion signal.
- **Public status page link**: read-only field in `app.settings.tsx` with `https://beaconmon.com/status/[teamSlug]` + copy button + one line of context. No backend work.

Done when: revenue banner math is correct and gated, history renders with retention clamping, status link copies.

---

## Session D — BFCM mode (Phase 3)

`apps/workers/scheduler.ts` + a badge on `app._index.tsx`.

- Add `getEffectiveInterval(monitor)` and `isBFCMWeek()` (~Nov 25 to Dec 3) and `isShopifyTeam(teamId)` (a `ShopifyInstall` exists). During BFCM week, floor Shopify-team monitor intervals at 60s, applied at scheduler read time only (no new jobs, singleton rule holds). Decide whether this also tightens that team's `CompetitorPage` cadence or only uptime monitors.
- Badge on the status home during BFCM week: "BFCM protection active, checking every 60s". Also a listing marketing asset.

Done when: intervals tighten only during the window for Shopify teams, with no scheduler scaling.

---

## Session E — Commodity polish (deprioritized, last)

`apps/shopify/app/routes/app._index.tsx` and `app.settings.tsx`. Build only after A to D land.

- **SSL card** on status home from `expiry_alerts` (warning-only, never the incident pipeline; no `resolved_at`).
- **Response time** under the storefront status: avg/min/max from `check_results` last 24h (time-ranged query).
- **Discord channel** in settings (the `discord.ts` channel handler already exists; just `alertChannels.upsertForTeam`).
- **Multiple email recipients** (the email channel schema already accepts `recipients: string[]`; cap 3 for free).

---

## Explicitly out of scope (do not build)

- `classifyCompetitorEvent.ts` keyword/Levenshtein classifier (the AI engine is superior).
- A new `competitor_events` table (exists).
- Competitor branching in the incident alert job (`process-alert-job.ts`) (competitor notifications are a separate pipeline).
- `monitors.is_competitor` based competitor monitoring (the `Competitor`/`CompetitorPage` model is the real one).
- Competitor catalog/products browse view (v2).

## Verify at implementation start

- What plan does a freshly provisioned Shopify install's team get? Confirm it is `free` so `competitorMonitors: 1` applies. Check `lib/provision.server.ts`.
- The alert-channels repository email-channel upsert signature (`packages/db/src/repositories/alert-channels.ts`) for the auto-wire step.
- Whether moving `competitorRepository` into `packages/db` pulls in any web-only imports beyond the error classes.

## Suggested execution

A (prep) -> B (core competitor wiring), then C and D in parallel, then E. B is the differentiator and the priority. Sessions touch mostly disjoint files; only `app._index.tsx` is shared (C, D, E) and `schema.prisma` (A is repo-only; C adds the settings column).

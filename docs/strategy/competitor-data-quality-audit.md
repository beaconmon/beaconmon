# Competitor data-quality audit

A pre-launch and ongoing health audit of every competitor we monitor, written for
the moment we point this data at outreach. The premise: the snapshot we show a
prospect ("here is what your competitor changed this week") is only as good as the
competitor data behind it. A stale price, a phantom product, an event storm, or an
alert that silently never fires turns that snapshot from a hook into an
embarrassment. This audit surfaces those failure modes automatically.

Scope is the competitor intelligence tables only: `competitors`,
`competitor_pages`, `competitor_products`, `competitor_events`,
`competitor_notification_channels` (joined to `alert_channels`).

## How to run

The audit is a read-only script that mirrors `competitor-coverage-report.ts`. It
never writes.

```bash
pnpm db:generate                                          # once, generates the client
DATABASE_URL=<direct prod URL> tsx scripts/competitor-data-audit.ts
DATABASE_URL=<direct prod URL> tsx scripts/competitor-data-audit.ts --json   # for dashboards/cron
```

Use the direct `DATABASE_URL`, not the pooled one (same convention as the coverage
report). Human output groups findings by severity with a few sample rows each;
`--json` emits `{ generatedAt, totalChecks, flaggedChecks, bySeverity, findings }`
for a dashboard or an alert rule.

Thresholds live as named constants at the top of the script and are derived from
the scheduler's real cadence (`apps/workers/scheduler.ts`): `full_catalog` syncs
hourly, `selected_products` daily plus a weekly sitemap rescan, `limited`
re-probes weekly. "Stale" means well past that cadence, not merely idle. Tune the
constants in one place if cadence changes.

## What it checks

34 checks across five lenses. Severity reflects customer impact, not row count.

### Discovery and sync health (is the data fresh and real)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `stuck_syncing` | critical | `discoveryState=syncing` for >60m | A worker died mid-sync; the lock expired but state never moved. The competitor is frozen and emits nothing. |
| `discovery_failed` | high | active competitors in `failed` | Last sync errored; the feed is silently stale until it recovers. |
| `pending_stuck` | high | `pending` >2h after creation | Created (often in onboarding) but never picked up. The customer's first impression is an empty competitor. |
| `full_catalog_stale` | high | hourly tier, no sync in 6h | Prices and stock shown are out of date; change events are being missed. |
| `selected_stale` | medium | daily tier, no sync in 50h | Tracked PDPs are not refreshing. |
| `limited_zombie` | medium | `limited` + `not_applicable` | `markLimited()` excludes these from all scheduling, so they never re-probe and produce zero intelligence forever, yet still count as "monitored." |
| `ready_but_empty` | high | `ready` catalog tier, 0 products | Sync reported success on an empty result; dashboards and snapshots show nothing. |

### Product data integrity (is each product correct)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `zero_or_negative_price` | high | available, price <= 0, excluding obvious free items | The extractor defaults to "0" with no usable variant; poisons price events and digests. Free samples/gifts/shipping lines are filtered out so the remainder is a real artifact or a junk SKU. |
| `null_price_available` | medium | available, price null | Cannot appear in price comparisons, undercutting the core value prop. |
| `invalid_discount` | high | `0 < compare_at_price < current_price` | A real "was" price below the current price implies a negative discount; sale logic and shown savings become wrong. Excludes `compare_at=0` (see `compare_at_zero`). |
| `compare_at_zero` | low | `compare_at_price = 0` with a real current price | Absence of a sale price stored as 0 instead of null; benign but forces every consumer to special-case 0 and is what makes a naive discount check noisy. |
| `mixed_currency` | medium | >1 currency per competitor | The USD fallback fired on some syncs; comparisons mix units. |
| `stale_available_products` | medium | available, unseen 8d on hourly tier | Should have been marked unavailable; a phantom product inflating the catalog. |
| `empty_title_or_handle` | low | blank title/handle | Renders as a broken blank row to the customer. |
| `cross_source_duplicate` | medium | same SKU across sources | `(competitor_id, source, external_id)` uniqueness lets one SKU exist twice; double-counts and can emit phantom events. |

### Competitor record hygiene (is the entity well formed)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `duplicate_competitor` | high | same domain twice in a team | Double syncing, double events, a duplicated entry in the customer view and snapshot. |
| `malformed_domain` | high | scheme/path/space/uppercase in domain | Fails `validateCompetitorDomain` at sync and silently never syncs. |
| `platform_tier_mismatch` | low | platform vs tier disagree | `full_catalog` implies a Shopify feed; mismatches signal a mislabel. |
| `weak_name` | low | name blank or equal to domain | The name is the headline in digests and the outreach snapshot. |
| `monitoring_nothing` | high | active, no products, no pages | Monitored in name only; zero intelligence while counting toward plan and coverage. |

### Content page health (is change detection actually running)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `page_down` | high | active, >=2 consecutive failures | Two failures is the down threshold; a down page detects no changes. |
| `page_never_checked` | medium | active, never checked, >2h old | Never scheduled or never succeeded; no baseline, no detection. |
| `page_schedule_stalled` | high | `next_check_at` >2h in the past | Scheduling stalled for this page (scheduler down or page wedged). |
| `page_no_snapshot` | medium | checked >1d ago, no snapshot hash | Fetch returns nothing usable (blocked, empty, selector miss); nothing to diff. |
| `page_off_domain` | high | page URL host not on competitor domain | Monitoring the wrong site; attributes another site's changes here. Heuristic, review samples. |
| `duplicate_page` | low | same URL twice per competitor | Doubles fetch load and can emit duplicate events. |
| `page_interval_too_low` | low | interval < 5m | Over-fetches one storefront; risks a rate-limit or IP block that breaks all its checks. |

### Event quality and customer value (is the signal trustworthy and worth it)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `event_storm` | high | >200 add/remove for one competitor in a day | Signature of a sync glitch (e.g. partial pagination flagging the whole catalog removed), not real merchandising. Floods the digest, erodes trust. |
| `price_event_missing_payload` | medium | `price_changed` missing old/new price | The digest renders from `payload.oldPrice/newPrice`; missing either breaks the line. |
| `event_orphan_refs` | medium | price/sale event with no product, site event with no page | Cannot be traced back to what changed, so the customer cannot act. |
| `future_event` | medium | `detected_at` in the future | Clock or ingestion bug; breaks digest windowing and the coverage report's trailing-window math. |
| `no_events_ready_competitor` | info | `full_catalog` ready >30d, zero events ever | Either genuinely static (low value to track) or the diff engine is not firing. Eyeball before using in outreach. |

### Alert reliability (does the customer actually get told)

| Check | Sev | Flags | Why it matters |
| --- | --- | --- | --- |
| `high_sig_no_channel` | high | high-significance events, no channel wired | The most important changes have nowhere to send. The customer never hears about them. |
| `channel_disabled` | high | wired channel `is_active=false` or `disabled_at` set | Looks configured but the alert worker skips it; alerts silently never deliver. |
| `channel_team_mismatch` | critical | link `team_id` != channel `team_id` | Tenant-isolation violation: one team's competitor could route alerts to another team's channel. Investigate immediately. |

## How to triage the output

Work top-down by severity:

1. **critical** (`stuck_syncing`, `channel_team_mismatch`): act now. A tenant
   mismatch is a security/isolation incident, not a data-quality nit.
2. **high**: these directly degrade the outreach snapshot or break alerting. Clear
   before pointing this data at any prospect.
3. **medium**: correctness issues that mostly hurt over time or at the margins.
   Schedule them.
4. **low / info**: hygiene and judgement calls. `no_events_ready_competitor` and
   `weak_name` are review prompts, not bugs.

Each finding prints a one-line `why` and `fix`, plus sample row ids/domains so you
can jump straight to the offenders.

## Wiring it into continuous monitoring

The point is not a one-time sweep. Run it on a schedule and alert on regressions:

- **Cadence**: nightly is plenty; the slowest cadence we audit against is weekly.
- **Mechanism**: `tsx scripts/competitor-data-audit.ts --json` from a cron or the
  scheduler host, piped to wherever you watch metrics.
- **Alert rule**: page on any `critical`; open a ticket on a sustained rise in
  `high`. A reasonable gate is "fail the job if `bySeverity.critical > 0` or
  `bySeverity.high` exceeds an agreed baseline." The script itself never sets a
  non-zero exit on findings (so a cron does not flap); enforce the threshold in the
  wrapper that consumes the JSON.
- **Trend**: store the nightly `bySeverity` counts. A slow climb in
  `full_catalog_stale` or `event_storm` is an early warning that a worker or the
  feed is degrading before customers notice.

## Limitations and heuristics

- `page_off_domain` uses a substring match of the bare domain in the URL. A
  competitor on `shop.com` will accept `www.shop.com`, but unusual CDN or
  vanity-domain setups can produce false positives. Review the samples.
- `cross_source_duplicate` keys on SKU; products with no SKU are not compared.
- `mixed_currency` flags the symptom (multiple currencies on one competitor), not
  the cause; confirm against the store's `meta.json` before mass-normalizing.
- Thresholds are deliberately conservative so the signal stays high. Adjust the
  constants if your tolerance differs; they are all named at the top of the script.
- Scope is competitor data quality only. Pipeline throughput (queue depth, worker
  health) and the outreach-prospect linkage are out of scope here by design.

## Findings

### 2026-06-16 (first run, prod via tunnel)

Dataset shape, which frames everything below: **641 active competitors owned by
just 2 teams**. Only **2 are `full_catalog`**, 0 `selected_products`, and **639
are `limited`** (637 of those are `not_applicable` zombies named after their
domain). This is a seeded/import set, not live customer data, and its product
catalog intelligence is almost entirely empty.

```
Checks run: 35   Flagged: 9
By severity: CRITICAL 1   HIGH 4   MEDIUM 2   LOW 2   INFO 0

[CRITICAL] stuck_syncing                 1     ritualcoffee.com frozen in "syncing" since 2026-06-13
[HIGH]     high_sig_no_channel          31     high-sig events but no channel; only 1 competitor wired, 55 high-sig events/30d
[HIGH]     zero_or_negative_price      924     0-priced, non-free SKUs (artifacts or junk like "Shipping Charge")
[HIGH]     invalid_discount            404     genuine negative discounts (compare_at>0 and < current)
[HIGH]     page_down                    64     content pages >=2 failures (youthtothepeople.com at 96)
[MEDIUM]   limited_zombie              638     permanently not_applicable; zero catalog intelligence forever
[MEDIUM]   mixed_currency                3     AUD/USD, GBP/USD, EUR/USD on one storefront each
[LOW]      weak_name                   638     name == domain (same cohort as limited_zombie)
[LOW]      compare_at_zero            3505     sale price absent, stored as 0 not null
```

Interpretation:

- The two `full_catalog` competitors are the only ones producing real product
  intelligence. The 639 `limited` competitors are "monitored" in name but deliver
  no catalog data, so any outreach snapshot leaning on price/product changes can
  only be built from those two plus content-page diffs.
- `high_sig_no_channel` and the single wired channel mean alerting is effectively
  unconfigured across the set. Expected if these are outreach seeds with no
  customer to notify; a real gap the moment either team is a live account.
- `zero_or_negative_price` (924) and `invalid_discount` (404) are concentrated in
  the two catalog competitors and are worth a targeted extractor fix.

This run is what prompted tightening `invalid_discount` (was 3909, of which 3505
were `compare_at=0`) and `zero_or_negative_price` (was 1296, of which 372 were
obvious free items), and adding `compare_at_zero`.

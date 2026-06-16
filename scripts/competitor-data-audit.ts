#!/usr/bin/env tsx
/**
 * Competitor data-quality audit. Read-only. Run against the prod DB.
 *
 * Sweeps the competitor intelligence tables (competitors, competitor_pages,
 * competitor_products, competitor_events, competitor_notification_channels) for
 * anything that degrades data quality, monitoring accuracy, alert reliability,
 * onboarding experience, or the customer value of the intelligence we surface.
 * Each check counts offending rows and prints a few samples so the issue is
 * actionable. Nothing is mutated.
 *
 * The thresholds are derived from the scheduler's real cadence (apps/workers/
 * scheduler.ts): full_catalog syncs hourly, selected_products daily plus a
 * weekly sitemap rescan, limited re-probes weekly. A competitor that has not
 * synced well past its cadence is stale, not merely idle.
 *
 * Companion doc: docs/strategy/competitor-data-quality-audit.md explains every
 * check, why it matters, and how to remediate.
 *
 * Environment:
 *   DATABASE_URL  required, direct (not pooled)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/competitor-data-audit.ts
 *   DATABASE_URL=... tsx scripts/competitor-data-audit.ts --json   # machine output for dashboards/cron
 *
 * Prereq: run `pnpm db:generate` first (same generated client as
 * competitor-coverage-report.ts).
 */

import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const JSON_OUTPUT = process.argv.includes('--json');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

// ─── Thresholds (tied to scheduler cadence; tune in one place) ──────────────────
const STUCK_SYNCING_MIN = 60; // catalog-sync lock TTL is 15m (900s); >60m syncing = crashed mid-run
const PENDING_STUCK_HOURS = 2; // scheduler enqueues every ~10s; pending should clear fast
const FULL_CATALOG_STALE_HOURS = 6; // hourly cadence: 6 missed cycles
const SELECTED_STALE_HOURS = 50; // daily cadence: ~2 missed days
const STALE_AVAILABLE_DAYS = 8; // full_catalog refreshes hourly; still-available but unseen for 8d is wrong
const PAGE_NEVER_CHECKED_HOURS = 2;
const PAGE_SCHEDULE_STALL_HOURS = 2;
const PAGE_NO_SNAPSHOT_DAYS = 1;
const PAGE_MIN_INTERVAL_SEC = 300; // below 5m risks rate-limiting / blocking a competitor
const EVENT_STORM_PER_DAY = 200; // add/remove flood in one day = sync glitch (the pagination false-positive signature)
const FUTURE_EVENT_SKEW_HOURS = 1;
const NO_EVENTS_AGE_DAYS = 30;
const SAMPLE_LIMIT = 20;

// Titles that legitimately carry a 0 price (free samples, gifts, shipping/fee
// line items). These are not extraction artifacts, so the zero-price check
// excludes them to keep the signal high.
const FREE_ITEM_TITLE_RX = `free|sample|gift|shipping|deluxe|registry|charge|donation|tip`;

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type Category =
  | 'data-integrity'
  | 'monitoring-accuracy'
  | 'alert-reliability'
  | 'onboarding'
  | 'customer-value';

interface Check {
  key: string;
  category: Category;
  severity: Severity;
  title: string;
  why: string;
  fix: string;
  // countSql must return a single column `n` (int). sampleSql returns a few
  // identifying columns, capped at SAMPLE_LIMIT.
  countSql: string;
  sampleSql: string;
}

interface Finding extends Check {
  count: number;
  samples: Record<string, unknown>[];
}

const ACTIVE = `is_active AND deleted_at IS NULL`;

const checks: Check[] = [
  // ── Discovery / sync health ──────────────────────────────────────────────────
  {
    key: 'stuck_syncing',
    category: 'monitoring-accuracy',
    severity: 'critical',
    title: 'Competitors stuck in "syncing"',
    why: 'A worker set discoveryState=syncing then died; the lock has long expired but the state never moved. The competitor is frozen and emits no events.',
    fix: 'Inspect worker logs around updated_at, then reset discoveryState to pending so the scheduler re-enqueues it.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE discovery_state='syncing' AND updated_at < now() - interval '${STUCK_SYNCING_MIN} minutes'`,
    sampleSql: `SELECT id, name, domain, updated_at AS stuck_since FROM competitors WHERE discovery_state='syncing' AND updated_at < now() - interval '${STUCK_SYNCING_MIN} minutes' ORDER BY updated_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'discovery_failed',
    category: 'monitoring-accuracy',
    severity: 'high',
    title: 'Active competitors in "failed" discovery state',
    why: 'Last sync errored. No fresh products or events until it recovers, so the intelligence feed is silently stale.',
    fix: 'Read discovery_error. Fix the feed/URL or downgrade the tier; clear the error once a sync succeeds.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE discovery_state='failed' AND ${ACTIVE}`,
    sampleSql: `SELECT id, domain, data_tier, discovery_error FROM competitors WHERE discovery_state='failed' AND ${ACTIVE} ORDER BY updated_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'pending_stuck',
    category: 'onboarding',
    severity: 'high',
    title: 'Competitors stuck "pending" since creation',
    why: 'Created (often during onboarding) but never picked up by a sync. The customer sees an empty competitor on first impression.',
    fix: 'Confirm the scheduler is running and the catalog queue is draining; check Redis schedule keys for this competitor id.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE discovery_state='pending' AND ${ACTIVE} AND created_at < now() - interval '${PENDING_STUCK_HOURS} hours'`,
    sampleSql: `SELECT id, name, domain, platform, created_at FROM competitors WHERE discovery_state='pending' AND ${ACTIVE} AND created_at < now() - interval '${PENDING_STUCK_HOURS} hours' ORDER BY created_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'full_catalog_stale',
    category: 'monitoring-accuracy',
    severity: 'high',
    title: 'full_catalog competitors not synced within cadence',
    why: `Hourly feed but no successful sync in ${FULL_CATALOG_STALE_HOURS}h. Prices and stock shown to the customer are out of date and change events are being missed.`,
    fix: 'Check the shopify-feed worker and the Redis shopify:scheduled lock; verify products.json still responds for the domain.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE data_tier='full_catalog' AND discovery_state='ready' AND ${ACTIVE} AND (discovery_synced_at IS NULL OR discovery_synced_at < now() - interval '${FULL_CATALOG_STALE_HOURS} hours')`,
    sampleSql: `SELECT id, domain, discovery_synced_at FROM competitors WHERE data_tier='full_catalog' AND discovery_state='ready' AND ${ACTIVE} AND (discovery_synced_at IS NULL OR discovery_synced_at < now() - interval '${FULL_CATALOG_STALE_HOURS} hours') ORDER BY discovery_synced_at ASC NULLS FIRST LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'selected_stale',
    category: 'monitoring-accuracy',
    severity: 'medium',
    title: 'selected_products competitors past daily cadence',
    why: `Fallback tier should sync daily; no success in ${SELECTED_STALE_HOURS}h means the tracked PDPs are not refreshing.`,
    fix: 'Check the catalog-sync queue and whether the tracked pages started blocking automated access.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE data_tier='selected_products' AND discovery_state='ready' AND ${ACTIVE} AND (discovery_synced_at IS NULL OR discovery_synced_at < now() - interval '${SELECTED_STALE_HOURS} hours')`,
    sampleSql: `SELECT id, domain, discovery_synced_at FROM competitors WHERE data_tier='selected_products' AND discovery_state='ready' AND ${ACTIVE} AND (discovery_synced_at IS NULL OR discovery_synced_at < now() - interval '${SELECTED_STALE_HOURS} hours') ORDER BY discovery_synced_at ASC NULLS FIRST LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'limited_zombie',
    category: 'customer-value',
    severity: 'medium',
    title: 'Permanently limited competitors (not_applicable)',
    why: 'markLimited() set discoveryState=not_applicable, which the scheduler excludes from all catalog scheduling. These never re-probe and produce zero product intelligence forever.',
    fix: 'Decide per competitor: add tracked product URLs and reset to pending to retry, or deactivate so it stops counting as monitored for outreach.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE data_tier='limited' AND discovery_state='not_applicable' AND ${ACTIVE}`,
    sampleSql: `SELECT id, domain, platform, discovery_error FROM competitors WHERE data_tier='limited' AND discovery_state='not_applicable' AND ${ACTIVE} ORDER BY updated_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'ready_but_empty',
    category: 'data-integrity',
    severity: 'high',
    title: 'Ready competitors with zero products',
    why: 'Marked ready on a catalog tier but no products exist. The catalog sync reported success on an empty result, so dashboards and snapshots show an empty competitor.',
    fix: 'Re-run the sync; if the feed truly returns nothing, downgrade the tier or correct the domain.',
    countSql: `SELECT count(*)::int AS n FROM competitors c WHERE c.discovery_state='ready' AND c.data_tier IN ('full_catalog','selected_products') AND c.${ACTIVE} AND NOT EXISTS (SELECT 1 FROM competitor_products p WHERE p.competitor_id = c.id)`,
    sampleSql: `SELECT c.id, c.domain, c.data_tier, c.discovery_synced_at FROM competitors c WHERE c.discovery_state='ready' AND c.data_tier IN ('full_catalog','selected_products') AND c.${ACTIVE} AND NOT EXISTS (SELECT 1 FROM competitor_products p WHERE p.competitor_id = c.id) ORDER BY c.discovery_synced_at DESC NULLS LAST LIMIT ${SAMPLE_LIMIT}`,
  },

  // ── Product data integrity ───────────────────────────────────────────────────
  {
    key: 'zero_or_negative_price',
    category: 'data-integrity',
    severity: 'high',
    title: 'Available products priced <= 0 (excluding obvious free items)',
    why: 'shopifyToExtracted defaults to "0" when a product has no usable variant, so a non-free product at 0 is an extraction artifact that poisons price events and digests. Obvious free items (samples, gifts, shipping/fee lines) are excluded; what remains is either a real artifact or a junk SKU that should not be tracked as a product.',
    fix: 'Re-extract from the source; if a variant truly has no price, do not track it as an available product. Consider filtering fee/sample SKUs at ingest.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products WHERE current_price IS NOT NULL AND current_price <= 0 AND is_available AND lower(coalesce(title,'')) !~ '${FREE_ITEM_TITLE_RX}'`,
    sampleSql: `SELECT id, competitor_id, title, current_price, source FROM competitor_products WHERE current_price IS NOT NULL AND current_price <= 0 AND is_available AND lower(coalesce(title,'')) !~ '${FREE_ITEM_TITLE_RX}' LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'null_price_available',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Available products with no price',
    why: 'An available product with a null price cannot appear in price comparisons or the outreach snapshot, undercutting the core value prop.',
    fix: 'Check the extractor for the product source; backfill price or mark unavailable.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products WHERE current_price IS NULL AND is_available`,
    sampleSql: `SELECT id, competitor_id, title, source FROM competitor_products WHERE current_price IS NULL AND is_available LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'invalid_discount',
    category: 'data-integrity',
    severity: 'high',
    title: 'Genuine negative discount (0 < compare_at_price < current_price)',
    why: 'A real struck-through "was" price that is lower than the current price implies a negative discount; sale_started logic and any savings shown to the customer become wrong. compare_at_price = 0 is excluded here because it means "no sale price" stored as 0 rather than null, a separate modeling issue tracked by compare_at_zero.',
    fix: 'Re-extract; usually a variant-mismatch where price and compare_at came from different variants.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products WHERE compare_at_price > 0 AND current_price IS NOT NULL AND compare_at_price < current_price`,
    sampleSql: `SELECT id, competitor_id, title, current_price, compare_at_price, currency FROM competitor_products WHERE compare_at_price > 0 AND current_price IS NOT NULL AND compare_at_price < current_price LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'compare_at_zero',
    category: 'data-integrity',
    severity: 'low',
    title: 'compare_at_price stored as 0 instead of null',
    why: 'The absence of a sale price is being persisted as 0 rather than null. It is benign for display but it forces every consumer to special-case 0, and it is what makes a naive "compare_at < current" check noisy.',
    fix: 'Normalize 0 to null at ingest and in a one-off backfill so absence is represented consistently.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products WHERE compare_at_price = 0 AND current_price > 0`,
    sampleSql: `SELECT competitor_id, count(*)::int AS rows FROM competitor_products WHERE compare_at_price = 0 AND current_price > 0 GROUP BY competitor_id ORDER BY rows DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'mixed_currency',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Competitors with products in multiple currencies',
    why: 'A single storefront should resolve one base currency (meta.json). Mixed currencies mean the USD fallback fired on some syncs, so price comparisons mix units (a £ vs $ apples-to-oranges).',
    fix: 'Confirm meta.json currency resolves; normalize historical rows to the store currency.',
    countSql: `SELECT count(*)::int AS n FROM (SELECT competitor_id FROM competitor_products GROUP BY competitor_id HAVING count(DISTINCT currency) > 1) g`,
    sampleSql: `SELECT competitor_id, count(DISTINCT currency)::int AS currencies, string_agg(DISTINCT currency, ',') AS list FROM competitor_products GROUP BY competitor_id HAVING count(DISTINCT currency) > 1 LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'stale_available_products',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Available products not seen in recent full_catalog syncs',
    why: `On an hourly feed, an available product unseen for ${STALE_AVAILABLE_DAYS}d should have been marked unavailable. It is a phantom product inflating the catalog and may have been silently delisted.`,
    fix: 'Verify markMissingUnavailable is firing (it is skipped on partial pagination); reconcile against the live feed.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products p JOIN competitors c ON c.id = p.competitor_id WHERE p.is_available AND c.data_tier='full_catalog' AND c.discovery_state='ready' AND p.last_seen_at < now() - interval '${STALE_AVAILABLE_DAYS} days'`,
    sampleSql: `SELECT p.id, p.competitor_id, p.title, p.last_seen_at FROM competitor_products p JOIN competitors c ON c.id = p.competitor_id WHERE p.is_available AND c.data_tier='full_catalog' AND c.discovery_state='ready' AND p.last_seen_at < now() - interval '${STALE_AVAILABLE_DAYS} days' ORDER BY p.last_seen_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'empty_title_or_handle',
    category: 'data-integrity',
    severity: 'low',
    title: 'Products with empty title or handle',
    why: 'A product with no title/handle renders as a blank row in digests and the feed, looking broken to the customer.',
    fix: 'Tighten the extractor to skip products without a title; clean existing rows.',
    countSql: `SELECT count(*)::int AS n FROM competitor_products WHERE coalesce(trim(title),'')='' OR coalesce(trim(handle),'')=''`,
    sampleSql: `SELECT id, competitor_id, external_id, source FROM competitor_products WHERE coalesce(trim(title),'')='' OR coalesce(trim(handle),'')='' LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'cross_source_duplicate',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Same SKU tracked under multiple sources',
    why: 'The unique key is (competitor_id, source, external_id), so the same SKU ingested via both shopify_feed and jsonld becomes two rows. This double-counts the catalog and can emit phantom add/remove events.',
    fix: 'Deduplicate by SKU/GTIN across sources; prefer the feed row when present.',
    countSql: `SELECT count(*)::int AS n FROM (SELECT competitor_id, lower(sku) FROM competitor_products WHERE coalesce(sku,'')<>'' GROUP BY competitor_id, lower(sku) HAVING count(DISTINCT source) > 1) g`,
    sampleSql: `SELECT competitor_id, lower(sku) AS sku, count(*)::int AS rows, string_agg(DISTINCT source, ',') AS sources FROM competitor_products WHERE coalesce(sku,'')<>'' GROUP BY competitor_id, lower(sku) HAVING count(DISTINCT source) > 1 LIMIT ${SAMPLE_LIMIT}`,
  },

  // ── Competitor record hygiene ────────────────────────────────────────────────
  {
    key: 'duplicate_competitor',
    category: 'data-integrity',
    severity: 'high',
    title: 'Same domain tracked twice within a team',
    why: 'Two active competitor rows for one domain in one team means double syncing, double events, and a confusing duplicated entry in the customer view and outreach snapshot.',
    fix: 'Merge into one; soft-delete the duplicate.',
    countSql: `SELECT count(*)::int AS n FROM (SELECT team_id, lower(domain) FROM competitors WHERE ${ACTIVE} GROUP BY team_id, lower(domain) HAVING count(*) > 1) g`,
    sampleSql: `SELECT team_id, lower(domain) AS domain, count(*)::int AS copies FROM competitors WHERE ${ACTIVE} GROUP BY team_id, lower(domain) HAVING count(*) > 1 ORDER BY copies DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'malformed_domain',
    category: 'data-integrity',
    severity: 'high',
    title: 'Malformed competitor domains',
    why: 'A domain holding a scheme, path, space, or uppercase will fail validateCompetitorDomain at sync time and silently never sync. Legacy rows can still carry these.',
    fix: 'Normalize to a bare lowercase host (no scheme/path); re-run discovery.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE ${ACTIVE} AND (domain LIKE '%/%' OR domain LIKE '%:%' OR domain LIKE '% %' OR domain <> lower(domain) OR trim(domain)='')`,
    sampleSql: `SELECT id, domain, platform FROM competitors WHERE ${ACTIVE} AND (domain LIKE '%/%' OR domain LIKE '%:%' OR domain LIKE '% %' OR domain <> lower(domain) OR trim(domain)='') LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'platform_tier_mismatch',
    category: 'data-integrity',
    severity: 'low',
    title: 'Platform and tier disagree',
    why: 'full_catalog implies a Shopify products.json feed, so platform=other with full_catalog is inconsistent; platform=shopify that ended at not_applicable suggests a mislabel or a blocked store.',
    fix: 'Reconcile the platform label with the actual extraction outcome.',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE ${ACTIVE} AND ((platform='other' AND data_tier='full_catalog') OR (platform='shopify' AND discovery_state='not_applicable'))`,
    sampleSql: `SELECT id, domain, platform, data_tier, discovery_state FROM competitors WHERE ${ACTIVE} AND ((platform='other' AND data_tier='full_catalog') OR (platform='shopify' AND discovery_state='not_applicable')) LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'weak_name',
    category: 'customer-value',
    severity: 'low',
    title: 'Competitors with a weak/missing name',
    why: 'A blank name or one identical to the domain reads as low-quality in digests and the outreach snapshot, where the competitor name is the headline.',
    fix: 'Backfill a human brand name (often available from the storefront title/og:site_name).',
    countSql: `SELECT count(*)::int AS n FROM competitors WHERE ${ACTIVE} AND (name IS NULL OR trim(name)='' OR lower(trim(name))=lower(domain))`,
    sampleSql: `SELECT id, name, domain FROM competitors WHERE ${ACTIVE} AND (name IS NULL OR trim(name)='' OR lower(trim(name))=lower(domain)) LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'monitoring_nothing',
    category: 'customer-value',
    severity: 'high',
    title: 'Active competitors tracking nothing',
    why: 'Active and limited with no products and no active pages: it is monitored in name only and delivers zero intelligence, yet still counts toward the customer plan and outreach coverage.',
    fix: 'Add tracked product URLs or content pages, or deactivate.',
    countSql: `SELECT count(*)::int AS n FROM competitors c WHERE c.${ACTIVE} AND c.data_tier='limited' AND NOT EXISTS (SELECT 1 FROM competitor_products p WHERE p.competitor_id=c.id) AND NOT EXISTS (SELECT 1 FROM competitor_pages pg WHERE pg.competitor_id=c.id AND pg.is_active)`,
    sampleSql: `SELECT c.id, c.domain, c.discovery_state, c.discovery_error FROM competitors c WHERE c.${ACTIVE} AND c.data_tier='limited' AND NOT EXISTS (SELECT 1 FROM competitor_products p WHERE p.competitor_id=c.id) AND NOT EXISTS (SELECT 1 FROM competitor_pages pg WHERE pg.competitor_id=c.id AND pg.is_active) ORDER BY c.created_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },

  // ── Competitor page health ───────────────────────────────────────────────────
  {
    key: 'page_down',
    category: 'monitoring-accuracy',
    severity: 'high',
    title: 'Content pages failing (>= 2 consecutive)',
    why: 'Two consecutive failures is the down threshold. A down page detects no content/price changes, so competitor promo and copy changes slip through.',
    fix: 'Check the URL and selector; the page may have moved or started blocking the fetcher.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages WHERE is_active AND consecutive_failures >= 2`,
    sampleSql: `SELECT id, competitor_id, url, consecutive_failures, last_checked_at FROM competitor_pages WHERE is_active AND consecutive_failures >= 2 ORDER BY consecutive_failures DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'page_never_checked',
    category: 'monitoring-accuracy',
    severity: 'medium',
    title: 'Active pages never checked',
    why: 'An active page created hours ago with no last_checked_at was never scheduled or never succeeded once. No baseline snapshot means no change detection at all.',
    fix: 'Confirm scheduler enqueues competitor-page-check; inspect the page queue.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages WHERE is_active AND last_checked_at IS NULL AND created_at < now() - interval '${PAGE_NEVER_CHECKED_HOURS} hours'`,
    sampleSql: `SELECT id, competitor_id, url, created_at FROM competitor_pages WHERE is_active AND last_checked_at IS NULL AND created_at < now() - interval '${PAGE_NEVER_CHECKED_HOURS} hours' ORDER BY created_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'page_schedule_stalled',
    category: 'monitoring-accuracy',
    severity: 'high',
    title: 'Pages with next_check_at far in the past',
    why: 'The scheduler advances next_check_at on every enqueue. A value hours in the past means scheduling stalled for this page (scheduler down, or the page wedged).',
    fix: 'Verify the single scheduler replica is healthy; check for a stuck page-check job.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages WHERE is_active AND next_check_at IS NOT NULL AND next_check_at < now() - interval '${PAGE_SCHEDULE_STALL_HOURS} hours'`,
    sampleSql: `SELECT id, competitor_id, url, next_check_at FROM competitor_pages WHERE is_active AND next_check_at IS NOT NULL AND next_check_at < now() - interval '${PAGE_SCHEDULE_STALL_HOURS} hours' ORDER BY next_check_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'page_no_snapshot',
    category: 'monitoring-accuracy',
    severity: 'medium',
    title: 'Checked pages that never captured a snapshot',
    why: 'Checked at least a day ago but last_snapshot_hash is still null. The fetch is returning nothing usable (blocked, empty, or selector matched nothing), so there is no content to diff.',
    fix: 'Validate the selector against the live page; the page may require JS (unsupported) or be blocking.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages WHERE is_active AND last_checked_at IS NOT NULL AND last_snapshot_hash IS NULL AND last_checked_at < now() - interval '${PAGE_NO_SNAPSHOT_DAYS} days'`,
    sampleSql: `SELECT id, competitor_id, url, selector, last_checked_at FROM competitor_pages WHERE is_active AND last_checked_at IS NOT NULL AND last_snapshot_hash IS NULL AND last_checked_at < now() - interval '${PAGE_NO_SNAPSHOT_DAYS} days' ORDER BY last_checked_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'page_off_domain',
    category: 'data-integrity',
    severity: 'high',
    title: 'Content pages pointing off the competitor domain',
    why: 'A page URL whose host does not contain the competitor domain is monitoring the wrong site, attributing another site changes to this competitor. (Heuristic substring match; review samples.)',
    fix: 'Correct the page URL to the competitor domain or remove it.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages pg JOIN competitors c ON c.id = pg.competitor_id WHERE pg.is_active AND position(c.domain in pg.url) = 0`,
    sampleSql: `SELECT pg.id, pg.competitor_id, c.domain, pg.url FROM competitor_pages pg JOIN competitors c ON c.id = pg.competitor_id WHERE pg.is_active AND position(c.domain in pg.url) = 0 LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'duplicate_page',
    category: 'data-integrity',
    severity: 'low',
    title: 'Same URL tracked by multiple pages of one competitor',
    why: 'Duplicate page rows double the fetch load on the competitor site and can emit the same change event twice.',
    fix: 'Deactivate the redundant page.',
    countSql: `SELECT count(*)::int AS n FROM (SELECT competitor_id, url FROM competitor_pages WHERE is_active GROUP BY competitor_id, url HAVING count(*) > 1) g`,
    sampleSql: `SELECT competitor_id, url, count(*)::int AS copies FROM competitor_pages WHERE is_active GROUP BY competitor_id, url HAVING count(*) > 1 ORDER BY copies DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'page_interval_too_low',
    category: 'monitoring-accuracy',
    severity: 'low',
    title: 'Pages polled more often than every 5 minutes',
    why: 'A sub-5-minute interval over-fetches one storefront, risking rate-limiting or an IP block that then breaks every check for that competitor.',
    fix: 'Raise interval_seconds to a polite cadence unless there is a deliberate reason.',
    countSql: `SELECT count(*)::int AS n FROM competitor_pages WHERE is_active AND interval_seconds < ${PAGE_MIN_INTERVAL_SEC}`,
    sampleSql: `SELECT id, competitor_id, url, interval_seconds FROM competitor_pages WHERE is_active AND interval_seconds < ${PAGE_MIN_INTERVAL_SEC} ORDER BY interval_seconds ASC LIMIT ${SAMPLE_LIMIT}`,
  },

  // ── Event quality ────────────────────────────────────────────────────────────
  {
    key: 'event_storm',
    category: 'monitoring-accuracy',
    severity: 'high',
    title: 'Add/remove event storms in a single day',
    why: `More than ${EVENT_STORM_PER_DAY} product_added/removed events for one competitor in a day is the signature of a sync glitch (e.g. partial pagination flagging the whole catalog removed), not real merchandising. It floods the digest and erodes trust.`,
    fix: 'Inspect the sync that produced the spike; verify markMissingUnavailable only runs on complete fetches.',
    countSql: `SELECT count(*)::int AS n FROM (SELECT competitor_id, date_trunc('day', detected_at) d FROM competitor_events WHERE type IN ('product_added','product_removed') AND detected_at > now() - interval '30 days' GROUP BY competitor_id, date_trunc('day', detected_at) HAVING count(*) > ${EVENT_STORM_PER_DAY}) g`,
    sampleSql: `SELECT competitor_id, date_trunc('day', detected_at)::date AS day, count(*)::int AS events FROM competitor_events WHERE type IN ('product_added','product_removed') AND detected_at > now() - interval '30 days' GROUP BY competitor_id, date_trunc('day', detected_at) HAVING count(*) > ${EVENT_STORM_PER_DAY} ORDER BY events DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'price_event_missing_payload',
    category: 'data-integrity',
    severity: 'medium',
    title: 'price_changed events missing old/new price',
    why: 'The digest renders price changes from payload.oldPrice/newPrice. Missing either leaves a blank or broken line in the customer-facing digest.',
    fix: 'Patch the event producer; backfilling is usually not worth it, so focus on stopping new ones.',
    countSql: `SELECT count(*)::int AS n FROM competitor_events WHERE type='price_changed' AND detected_at > now() - interval '90 days' AND (payload->>'oldPrice' IS NULL OR payload->>'newPrice' IS NULL)`,
    sampleSql: `SELECT id, competitor_id, detected_at FROM competitor_events WHERE type='price_changed' AND detected_at > now() - interval '90 days' AND (payload->>'oldPrice' IS NULL OR payload->>'newPrice' IS NULL) ORDER BY detected_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'event_orphan_refs',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Events missing their expected product/page reference',
    why: 'A price_changed with no product_id, or a site_changed with no page_id, cannot be linked back to what changed, so the customer cannot act on it.',
    fix: 'Ensure the producer always sets the foreign key for these event types.',
    countSql: `SELECT count(*)::int AS n FROM competitor_events WHERE detected_at > now() - interval '90 days' AND ((type IN ('price_changed','sale_started','sale_ended') AND product_id IS NULL) OR (type IN ('site_changed','promo_detected') AND page_id IS NULL))`,
    sampleSql: `SELECT id, competitor_id, type, detected_at FROM competitor_events WHERE detected_at > now() - interval '90 days' AND ((type IN ('price_changed','sale_started','sale_ended') AND product_id IS NULL) OR (type IN ('site_changed','promo_detected') AND page_id IS NULL)) ORDER BY detected_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'future_event',
    category: 'data-integrity',
    severity: 'medium',
    title: 'Events detected in the future',
    why: 'detected_at beyond now indicates a clock or ingestion bug. Future timestamps break digest windowing and the trailing-window aggregates the coverage report relies on.',
    fix: 'Trace the producer setting detected_at; correct the offending rows.',
    countSql: `SELECT count(*)::int AS n FROM competitor_events WHERE detected_at > now() + interval '${FUTURE_EVENT_SKEW_HOURS} hours'`,
    sampleSql: `SELECT id, competitor_id, type, detected_at FROM competitor_events WHERE detected_at > now() + interval '${FUTURE_EVENT_SKEW_HOURS} hours' ORDER BY detected_at DESC LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'no_events_ready_competitor',
    category: 'customer-value',
    severity: 'info',
    title: 'Long-ready full_catalog competitors with zero events ever',
    why: `Ready on a full feed for over ${NO_EVENTS_AGE_DAYS} days but never produced a single event. Either genuinely static (low value to track) or the diff engine is not firing. Worth eyeballing before using in outreach.`,
    fix: 'Spot-check one against the live store; if truly static, it may not be worth monitoring.',
    countSql: `SELECT count(*)::int AS n FROM competitors c WHERE c.${ACTIVE} AND c.data_tier='full_catalog' AND c.discovery_state='ready' AND c.created_at < now() - interval '${NO_EVENTS_AGE_DAYS} days' AND NOT EXISTS (SELECT 1 FROM competitor_events e WHERE e.competitor_id=c.id)`,
    sampleSql: `SELECT c.id, c.domain, c.created_at FROM competitors c WHERE c.${ACTIVE} AND c.data_tier='full_catalog' AND c.discovery_state='ready' AND c.created_at < now() - interval '${NO_EVENTS_AGE_DAYS} days' AND NOT EXISTS (SELECT 1 FROM competitor_events e WHERE e.competitor_id=c.id) ORDER BY c.created_at ASC LIMIT ${SAMPLE_LIMIT}`,
  },

  // ── Alert reliability ────────────────────────────────────────────────────────
  {
    key: 'high_sig_no_channel',
    category: 'alert-reliability',
    severity: 'high',
    title: 'High-significance events with no notification channel',
    why: 'A competitor produced high-significance changes in the last 30 days but has no notification channel wired, so the alert worker has nowhere to send. The customer never hears about the change that matters most.',
    fix: 'Wire a competitor_notification_channel, or surface a default channel during competitor setup.',
    countSql: `SELECT count(*)::int AS n FROM competitors c WHERE c.${ACTIVE} AND EXISTS (SELECT 1 FROM competitor_events e WHERE e.competitor_id=c.id AND e.significance='high' AND e.detected_at > now() - interval '30 days') AND NOT EXISTS (SELECT 1 FROM competitor_notification_channels nc WHERE nc.competitor_id=c.id)`,
    sampleSql: `SELECT c.id, c.domain FROM competitors c WHERE c.${ACTIVE} AND EXISTS (SELECT 1 FROM competitor_events e WHERE e.competitor_id=c.id AND e.significance='high' AND e.detected_at > now() - interval '30 days') AND NOT EXISTS (SELECT 1 FROM competitor_notification_channels nc WHERE nc.competitor_id=c.id) LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'channel_disabled',
    category: 'alert-reliability',
    severity: 'high',
    title: 'Competitor channels that are disabled',
    why: 'The channel is wired to the competitor but the alert worker skips it (is_active=false or disabled_at set, e.g. after a plan downgrade). Alerts look configured but silently never deliver.',
    fix: 'Re-enable the channel or point the competitor at an active one.',
    countSql: `SELECT count(*)::int AS n FROM competitor_notification_channels nc JOIN alert_channels a ON a.id = nc.channel_id WHERE a.is_active = false OR a.disabled_at IS NOT NULL`,
    sampleSql: `SELECT nc.competitor_id, a.id AS channel_id, a.name, a.type, a.disabled_reason FROM competitor_notification_channels nc JOIN alert_channels a ON a.id = nc.channel_id WHERE a.is_active = false OR a.disabled_at IS NOT NULL LIMIT ${SAMPLE_LIMIT}`,
  },
  {
    key: 'channel_team_mismatch',
    category: 'alert-reliability',
    severity: 'critical',
    title: 'Competitor channel links crossing tenants',
    why: 'A competitor_notification_channel whose team_id does not match its alert_channel team_id is a tenant-isolation violation: one team competitor could route alerts to another team channel.',
    fix: 'Investigate immediately; delete the cross-tenant link and audit how it was created.',
    countSql: `SELECT count(*)::int AS n FROM competitor_notification_channels nc JOIN alert_channels a ON a.id = nc.channel_id WHERE a.team_id <> nc.team_id`,
    sampleSql: `SELECT nc.competitor_id, nc.team_id AS link_team, a.team_id AS channel_team, a.id AS channel_id FROM competitor_notification_channels nc JOIN alert_channels a ON a.id = nc.channel_id WHERE a.team_id <> nc.team_id LIMIT ${SAMPLE_LIMIT}`,
  },
];

// ─── Runner ─────────────────────────────────────────────────────────────────────
const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

async function runCheck(check: Check): Promise<Finding> {
  const countRows = (await prisma.$queryRawUnsafe(check.countSql)) as Array<{ n: number }>;
  const count = Number(countRows[0]?.n ?? 0);
  let samples: Record<string, unknown>[] = [];
  if (count > 0) {
    samples = (await prisma.$queryRawUnsafe(check.sampleSql)) as Record<string, unknown>[];
  }
  return { ...check, count, samples };
}

function severityLabel(s: Severity): string {
  return { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW', info: 'INFO' }[s];
}

async function main(): Promise<void> {
  const findings: Finding[] = [];
  for (const check of checks) {
    findings.push(await runCheck(check));
  }

  const flagged = findings.filter((f) => f.count > 0);

  if (JSON_OUTPUT) {
    const bySeverity = Object.fromEntries(
      SEVERITY_ORDER.map((s) => [s, flagged.filter((f) => f.severity === s).length])
    );
    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalChecks: checks.length,
          flaggedChecks: flagged.length,
          bySeverity,
          findings: flagged.map((f) => ({
            key: f.key,
            category: f.category,
            severity: f.severity,
            title: f.title,
            count: f.count,
            samples: f.samples,
          })),
        },
        // serialize any stray BigInt/Date safely
        (_k, v) => (typeof v === 'bigint' ? Number(v) : v),
        2
      )
    );
    return;
  }

  console.log('Competitor data-quality audit');
  console.log(`Generated ${new Date().toISOString()}`);
  console.log('');

  // Summary line
  const counts = SEVERITY_ORDER.map((s) => `${severityLabel(s)} ${flagged.filter((f) => f.severity === s).length}`);
  console.log(`Checks run: ${checks.length}   Flagged: ${flagged.length}`);
  console.log(`By severity: ${counts.join('   ')}`);
  console.log('');

  if (flagged.length === 0) {
    console.log('No data-quality issues detected. Nice.');
    return;
  }

  // Sort: severity, then category, then count desc
  flagged.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
      a.category.localeCompare(b.category) ||
      b.count - a.count
  );

  for (const f of flagged) {
    console.log('─'.repeat(80));
    console.log(`[${severityLabel(f.severity)}] ${f.title}  (${f.count} rows)`);
    console.log(`  check:    ${f.key}   category: ${f.category}`);
    console.log(`  why:      ${f.why}`);
    console.log(`  fix:      ${f.fix}`);
    if (f.samples.length > 0) {
      const shown = f.samples.length;
      const more = f.count > shown ? `  (showing ${shown} of ${f.count})` : '';
      console.log(`  samples:${more}`);
      for (const row of f.samples) {
        const cells = Object.entries(row).map(([k, v]) => `${k}=${formatCell(v)}`);
        console.log(`    - ${cells.join('  ')}`);
      }
    }
    console.log('');
  }

  console.log('─'.repeat(80));
  console.log('Re-run with --json to feed a dashboard or alert. This script never writes.');
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return String(v);
  return String(v);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

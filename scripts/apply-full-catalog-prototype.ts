#!/usr/bin/env tsx
/**
 * PROTOTYPE: promote a handful of static Shopify competitors to full_catalog so
 * the running prod scheduler starts producing price/product change hooks.
 *
 * Bounded, reversible production writes. Caps at ~12 competitors.
 *
 * Background
 * ----------
 * These competitors were seeded data_tier='limited', discovery_state='not_applicable'
 * to avoid server load, so the catalog scheduler ignores them and they only get a
 * weak homepage content-diff. The scheduler (apps/workers/scheduler.ts) enqueues a
 * shopify-feed job hourly (lock EX 3300, NX) for competitors where
 * discovery_state != 'not_applicable' AND data_tier='full_catalog'. Flipping
 * tier -> full_catalog and state -> pending makes the already-running workers pick
 * them up automatically (worker drives pending -> syncing -> ready and populates
 * products.json-derived products).
 *
 * Selection
 * ---------
 *   - Team "Outreach Research" (id below)
 *   - competitor is_active and not deleted
 *   - its content page is_active with consecutive_failures = 0
 *   - 0 competitor_events in the last 30 days (genuinely static today)
 *   - NOT marked 'deactivate'/'fix_url' in scripts/_remediation_plan.json
 *   - GENUINE Shopify: GET https://<domain>/products.json?limit=1 with a browser UA
 *     must return HTTP 200 with a JSON body containing a non-empty products[] array
 *   - take the first ~12 that pass
 *
 * Writes (bounded, reversible)
 * ----------------------------
 *   For each selected competitor, BEFORE writing append the old values to
 *   scripts/_applied_full_catalog.json (the revert record), then:
 *     UPDATE competitors
 *        SET data_tier='full_catalog', discovery_state='pending',
 *            discovery_error=NULL, updated_at=now()
 *      WHERE id=<competitorId>
 *   Only the competitors table is touched. competitor_pages is left alone.
 *
 * Revert
 * ------
 *   For each entry in scripts/_applied_full_catalog.json, set the id back to
 *   data_tier='limited', discovery_state='not_applicable'.
 *
 * Environment:
 *   DATABASE_URL  required, direct (prod via SSH tunnel on localhost)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/apply-full-catalog-prototype.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const TEAM_ID = 'cmqanmrxy000007ofptlnmx07'; // Outreach Research
const MAX_PROMOTE = 12;
const EVENT_WINDOW_DAYS = 30;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REMEDIATION_PATH = join(__dirname, '_remediation_plan.json');
const APPLIED_PATH = join(__dirname, '_applied_full_catalog.json');

type RemediationEntry = { competitorId: string; domain: string; action: string };
type AppliedEntry = {
  competitorId: string;
  domain: string;
  old_data_tier: string;
  old_discovery_state: string;
};

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

/** GET https://<domain>/products.json?limit=1 and verify a genuine Shopify response. */
async function isGenuineShopify(domain: string): Promise<boolean> {
  const url = `https://${domain}/products.json?limit=1`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json,*/*' },
      redirect: 'follow',
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (res.status !== 200) return false;
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return false; // not a JSON body
    }
    const products = (body as { products?: unknown })?.products;
    return Array.isArray(products) && products.length > 0;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const since = new Date(Date.now() - EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Excluded by remediation plan (deactivate / fix_url).
  const remediation: RemediationEntry[] = JSON.parse(readFileSync(REMEDIATION_PATH, 'utf8'));
  const excludedIds = new Set(
    remediation
      .filter((r) => r.action === 'deactivate' || r.action === 'fix_url')
      .map((r) => r.competitorId),
  );

  // Candidate competitors: Outreach Research, active, not deleted, with at least
  // one active page that has consecutive_failures = 0.
  const candidates = await prisma.competitor.findMany({
    where: {
      teamId: TEAM_ID,
      isActive: true,
      deletedAt: null,
      pages: { some: { isActive: true, consecutiveFailures: 0 } },
    },
    select: { id: true, domain: true, dataTier: true, discoveryState: true },
    orderBy: { domain: 'asc' },
  });

  // Static filter: 0 competitor_events in the trailing window.
  const recentEvents = await prisma.competitorEvent.groupBy({
    by: ['competitorId'],
    where: { detectedAt: { gte: since }, competitorId: { in: candidates.map((c) => c.id) } },
    _count: { _all: true },
  });
  const hasRecentEvents = new Set(recentEvents.map((e) => e.competitorId));

  const eligible = candidates.filter(
    (c) => !excludedIds.has(c.id) && !hasRecentEvents.has(c.id),
  );

  console.log(`Team Outreach Research candidates (active + clean page): ${candidates.length}`);
  console.log(`  excluded by remediation (deactivate/fix_url): ${candidates.filter((c) => excludedIds.has(c.id)).length}`);
  console.log(`  excluded for events in last ${EVENT_WINDOW_DAYS}d: ${candidates.filter((c) => hasRecentEvents.has(c.id)).length}`);
  console.log(`  eligible (static) to test for Shopify: ${eligible.length}`);
  console.log('');

  // Probe products.json until we collect MAX_PROMOTE genuine Shopify stores.
  const selected: typeof eligible = [];
  let tested = 0;
  let rejected = 0;
  for (const c of eligible) {
    if (selected.length >= MAX_PROMOTE) break;
    tested++;
    const ok = await isGenuineShopify(c.domain);
    if (ok) {
      selected.push(c);
      console.log(`  [shopify ] ${c.domain} -> queued for promotion`);
    } else {
      rejected++;
      console.log(`  [reject  ] ${c.domain} -> not a genuine Shopify products.json`);
    }
  }

  console.log('');
  console.log(`Tested: ${tested}  Selected: ${selected.length}  Rejected (non-Shopify): ${rejected}`);
  console.log('');

  if (selected.length === 0) {
    console.log('No competitors qualified. No writes performed.');
    return;
  }

  // Load any prior revert record so reruns append rather than clobber.
  const existingApplied: AppliedEntry[] = existsSync(APPLIED_PATH)
    ? JSON.parse(readFileSync(APPLIED_PATH, 'utf8'))
    : [];
  const alreadyRecorded = new Set(existingApplied.map((e) => e.competitorId));

  // For each selection: append old values to the revert record BEFORE writing,
  // then flip the tier/state. competitor_pages is never touched.
  const applied = [...existingApplied];
  for (const c of selected) {
    if (!alreadyRecorded.has(c.id)) {
      applied.push({
        competitorId: c.id,
        domain: c.domain,
        old_data_tier: c.dataTier,
        old_discovery_state: c.discoveryState,
      });
      // Persist the revert record before mutating prod.
      writeFileSync(APPLIED_PATH, JSON.stringify(applied, null, 2) + '\n', 'utf8');
    }

    await prisma.competitor.update({
      where: { id: c.id },
      data: {
        dataTier: 'full_catalog',
        discoveryState: 'pending',
        discoveryError: null,
      },
    });
    console.log(`  promoted ${c.domain}: ${c.dataTier}/${c.discoveryState} -> full_catalog/pending`);
  }

  console.log('');
  console.log(`Promoted ${selected.length} competitor(s). Revert record: ${APPLIED_PATH}`);
  console.log('The prod scheduler will enqueue shopify-feed jobs within ~1 hour (hourly lock).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

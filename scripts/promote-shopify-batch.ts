#!/usr/bin/env tsx
/**
 * Promote all static Shopify competitors from limited/not_applicable ->
 * full_catalog/pending in one shot. Safe to run with all ~285 at once:
 *
 *   - Catalog sync: the scheduler uses a per-competitor Redis NX lock (EX 3300)
 *     so each competitor gets at most one shopify-feed job per ~55 min regardless
 *     of queue depth. BullMQ processes jobs at worker concurrency limits.
 *   - Content pages: already actively monitored (consecutive_failures=0 is a
 *     prerequisite) so next_check_at is already naturally staggered.
 *
 * Selection:
 *   - Team "Outreach Research"
 *   - is_active=true, deleted_at=NULL
 *   - data_tier='limited' AND discovery_state='not_applicable' (not yet promoted)
 *   - NOT in remediation plan with action=deactivate or fix_url
 *   - has at least one active page with consecutive_failures=0
 *
 * Revert record is appended to scripts/_applied_full_catalog.json (same file as
 * the earlier 12-competitor prototype batch).
 *
 * Environment:
 *   DATABASE_URL  required, direct (prod via SSH tunnel on localhost)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/promote-shopify-batch.ts
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REMEDIATION_PATH = join(__dirname, '_remediation_plan.json');
const APPLIED_PATH = join(__dirname, '_applied_full_catalog.json');

type RemediationEntry = { competitorId: string; action: string };
type AppliedEntry = {
  competitorId: string;
  domain: string;
  old_data_tier: string;
  old_discovery_state: string;
};

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

async function main(): Promise<void> {
  const remediation: RemediationEntry[] = JSON.parse(readFileSync(REMEDIATION_PATH, 'utf8'));
  const excludedIds = new Set(
    remediation
      .filter((r) => r.action === 'deactivate' || r.action === 'fix_url')
      .map((r) => r.competitorId),
  );

  const existing: AppliedEntry[] = existsSync(APPLIED_PATH)
    ? JSON.parse(readFileSync(APPLIED_PATH, 'utf8'))
    : [];
  const alreadyApplied = new Set(existing.map((e) => e.competitorId));

  const candidates = await prisma.competitor.findMany({
    where: {
      teamId: TEAM_ID,
      isActive: true,
      deletedAt: null,
      dataTier: 'limited',
      discoveryState: 'not_applicable',
      pages: { some: { isActive: true, consecutiveFailures: 0 } },
    },
    select: { id: true, domain: true, dataTier: true, discoveryState: true },
    orderBy: { domain: 'asc' },
  });

  const toPromote = candidates.filter(
    (c) => !excludedIds.has(c.id) && !alreadyApplied.has(c.id),
  );

  console.log(`Run at: ${new Date().toISOString()}`);
  console.log(`Eligible (limited/not_applicable, not excluded, not yet recorded): ${toPromote.length}`);

  if (toPromote.length === 0) {
    console.log('Nothing to promote.');
    return;
  }

  // Write the full revert record in one shot before any writes.
  const applied: AppliedEntry[] = [
    ...existing,
    ...toPromote.map((c) => ({
      competitorId: c.id,
      domain: c.domain,
      old_data_tier: c.dataTier,
      old_discovery_state: c.discoveryState,
    })),
  ];
  writeFileSync(APPLIED_PATH, JSON.stringify(applied, null, 2) + '\n', 'utf8');
  console.log(`Revert record written (${applied.length} total entries): ${APPLIED_PATH}`);
  console.log('');

  // Promote all at once.
  // NOTE: No /products.json probe here (unlike the prototype). The cohort
  // (limited/not_applicable competitors seeded via the full-catalog audit) was
  // already classified as Shopify during seeding. Re-probing 285 stores
  // serially would add ~30 min of HTTP round-trips for a batch that is already
  // bounded by the scheduler's per-competitor NX lock (EX 3300). If you are
  // promoting a cohort of unknown origin, run apply-full-catalog-prototype.ts
  // first to validate a sample with isGenuineShopify() before using this script.
  const ids = toPromote.map((c) => c.id);
  const result = await prisma.competitor.updateMany({
    where: { id: { in: ids } },
    data: {
      dataTier: 'full_catalog',
      discoveryState: 'pending',
      discoveryError: null,
    },
  });

  console.log(`Promoted: ${result.count} competitors`);
  console.log('The prod scheduler will enqueue shopify-feed jobs on its next tick (hourly, NX-locked per competitor).');
  console.log(`Revert: set data_tier='limited', discovery_state='not_applicable' for all IDs in ${APPLIED_PATH}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

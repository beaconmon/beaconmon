#!/usr/bin/env tsx
/**
 * Apply competitor page deactivations from a remediation plan. PRODUCTION WRITE.
 *
 * Bounded and reversible. Reads scripts/_remediation_plan.json, selects only the
 * entries with action === 'deactivate', and sets competitor_pages.is_active = false
 * for those page ids (and only those). Before making any change it writes a
 * before-snapshot revert record to scripts/_applied_deactivations.json.
 *
 * Only competitor_pages.is_active is touched. No rows are deleted, the competitors
 * table is never touched, and no pageId outside the deactivate list is touched.
 *
 * Revert: UPDATE competitor_pages SET is_active = true WHERE id IN (<pageIds from
 * scripts/_applied_deactivations.json>).
 *
 * Environment:
 *   DATABASE_URL  required, direct (prod via SSH tunnel on localhost)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/apply-deactivations.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAN_PATH = join(__dirname, '_remediation_plan.json');
const REVERT_PATH = join(__dirname, '_applied_deactivations.json');

interface PlanEntry {
  domain: string;
  competitorId: string;
  pageId: string;
  team: string;
  action: string;
  bucket: string;
  reason: string;
}

interface RevertRecord {
  pageId: string;
  competitorId: string;
  domain: string;
  was_is_active: boolean;
  consecutive_failures: number;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

async function main(): Promise<void> {
  const plan: PlanEntry[] = JSON.parse(readFileSync(PLAN_PATH, 'utf8'));
  const deactivate = plan.filter((e) => e.action === 'deactivate');

  console.log(`Plan entries:        ${plan.length}`);
  console.log(`Deactivate entries:  ${deactivate.length}`);
  console.log('');

  if (deactivate.length === 0) {
    console.log('No deactivate entries. Nothing to do.');
    return;
  }

  // Step 1: read current rows, build before-snapshot.
  const pageIds = deactivate.map((e) => e.pageId);
  const rows = await prisma.competitorPage.findMany({
    where: { id: { in: pageIds } },
    select: { id: true, url: true, isActive: true, consecutiveFailures: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const revert: RevertRecord[] = [];
  const missing: PlanEntry[] = [];
  for (const e of deactivate) {
    const row = byId.get(e.pageId);
    if (!row) {
      missing.push(e);
      continue;
    }
    revert.push({
      pageId: e.pageId,
      competitorId: e.competitorId,
      domain: e.domain,
      was_is_active: row.isActive,
      consecutive_failures: row.consecutiveFailures,
    });
  }

  // Step 2: write the revert record BEFORE making any change.
  writeFileSync(REVERT_PATH, JSON.stringify(revert, null, 2) + '\n', 'utf8');
  console.log(`Revert record written: ${REVERT_PATH} (${revert.length} rows)`);
  if (missing.length > 0) {
    console.log(`WARNING: ${missing.length} pageId(s) not found in DB (skipped):`);
    for (const m of missing) console.log(`  ${m.domain}  ${m.pageId}`);
  }
  console.log('');

  // Step 3: update only the targeted ids that are still active.
  const alreadyInactive = revert.filter((r) => !r.was_is_active);
  const toDeactivate = revert.filter((r) => r.was_is_active).map((r) => r.pageId);

  let changed = 0;
  if (toDeactivate.length > 0) {
    const result = await prisma.competitorPage.updateMany({
      where: { id: { in: toDeactivate }, isActive: true },
      data: { isActive: false },
    });
    changed = result.count;
  }

  // Step 4: summary.
  console.log('Summary');
  console.log('-------');
  console.log(`Targeted (deactivate plan): ${revert.length}`);
  console.log(`Already inactive (skipped): ${alreadyInactive.length}`);
  console.log(`Set to inactive (changed):  ${changed}`);
  console.log('');

  console.log('Per-domain:');
  for (const r of revert) {
    const status = !r.was_is_active ? 'already-inactive' : 'deactivated';
    console.log(`  ${r.domain.padEnd(32)} ${status.padEnd(18)} (cf=${r.consecutive_failures})  ${r.pageId}`);
  }

  if (changed !== toDeactivate.length) {
    console.log('');
    console.log(`WARNING: expected to change ${toDeactivate.length} rows but changed ${changed}.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

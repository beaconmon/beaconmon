#!/usr/bin/env tsx
/**
 * Deactivation / fix / keep PLAN for failing competitor pages. READ-ONLY.
 * Does NOT deactivate anything and does NOT write to the DB.
 *
 * Reads scripts/_classifier_out.json (per-page bot/browser fetch results),
 * assigns an ACTION per failing page, cross-references each domain back to the
 * DB for ids/team/status, and emits:
 *   - a printed markdown summary
 *   - scripts/_remediation_plan.json
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/build-remediation-plan.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN_PATH = join(__dirname, '_classifier_out.json');
const OUT_PATH = join(__dirname, '_remediation_plan.json');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

type Action = 'deactivate' | 'fix_url' | 'keep';

interface ClassifierRow {
  page_id: string;
  competitor_id: string;
  team_id: string;
  team_name: string;
  domain: string;
  url: string;
  bucket: string;
  note: string;
  bot?: { status: number | null } | null;
  browser?: { status: number | null } | null;
}

function classify(row: ClassifierRow): { action: Action; reason: string } {
  const { bucket, note } = row;
  const botStatus = row.bot?.status ?? null;

  switch (bucket) {
    case 'hard_cf': {
      // Flaky CF that returned content at least once (note contains "bot=200") -> keep.
      if (note.includes('bot=200')) {
        return { action: 'keep', reason: 'flaky CF, returned 200 at least once; re-check after browser-UA/backoff' };
      }
      // Walled WAF: browser still blocked AND no attempt returned 200 -> deactivate.
      return { action: 'deactivate', reason: 'walled WAF; browser blocked and no 200 returned' };
    }
    case 'dns_dead':
      return { action: 'deactivate', reason: `unfetchable (DNS/cert dead): ${note}` };
    case 'other': {
      if (botStatus === 402) {
        return { action: 'deactivate', reason: 'HTTP 402, frozen/unpaid Shopify store (defunct)' };
      }
      if (botStatus === 404) {
        return { action: 'fix_url', reason: 'HTTP 404, live brand with wrong seeded homepage URL; re-derive URL' };
      }
      // any other "other" status (e.g. bot=200 browser=307) falls through to keep
      return { action: 'keep', reason: `other status (bot=${botStatus}); re-check after browser-UA/backoff` };
    }
    case 'slow_timeout':
      return { action: 'keep', reason: 'slow/timeout; re-check after failure-backoff' };
    case 'ok_now':
      return { action: 'keep', reason: 'fetching fine now; re-check after backoff' };
    case 'soft_block':
      return { action: 'keep', reason: 'soft block, browser-UA reaches 2xx; re-check after browser-UA' };
    default:
      return { action: 'keep', reason: `unhandled bucket ${bucket}; re-check` };
  }
}

async function main(): Promise<void> {
  const raw = JSON.parse(readFileSync(IN_PATH, 'utf8')) as { results: ClassifierRow[] };
  const rows = raw.results;

  // Classify each row.
  const classified = rows.map((r) => ({ row: r, ...classify(r) }));

  // Cross-reference each domain back to the DB. Only include pages still is_active=true.
  // Look up by domain via the competitors table (one content page per competitor here).
  const domains = Array.from(new Set(rows.map((r) => r.domain)));
  const domainList = domains.map((d) => `'${d.replace(/'/g, "''")}'`).join(',');

  const dbRows = (await prisma.$queryRawUnsafe(
    `SELECT c.domain AS domain,
            c.id AS competitor_id,
            p.id AS page_id,
            t.name AS team,
            p.is_active AS page_active,
            p.consecutive_failures::int AS consecutive_failures
     FROM competitors c
     JOIN competitor_pages p ON p.competitor_id = c.id
     JOIN teams t ON t.id = c.team_id
     WHERE c.domain IN (${domainList})
       AND p.is_active = true`,
  )) as Array<{
    domain: string;
    competitor_id: string;
    page_id: string;
    team: string;
    page_active: boolean;
    consecutive_failures: number;
  }>;

  // Index DB rows by domain. Prefer matching the same page_id from the classifier if present.
  const dbByDomain = new Map<string, typeof dbRows>();
  for (const d of dbRows) {
    const arr = dbByDomain.get(d.domain) ?? [];
    arr.push(d);
    dbByDomain.set(d.domain, arr);
  }

  interface PlanEntry {
    domain: string;
    competitorId: string;
    pageId: string;
    team: string;
    action: Action;
    bucket: string;
    reason: string;
    consecutiveFailures: number;
  }

  const plan: PlanEntry[] = [];
  const skipped: string[] = [];

  for (const c of classified) {
    const matches = dbByDomain.get(c.row.domain);
    if (!matches || matches.length === 0) {
      skipped.push(c.row.domain);
      continue;
    }
    // Prefer the exact page from the classifier; else take the first active page.
    const exact = matches.find((m) => m.page_id === c.row.page_id);
    const m = exact ?? matches[0]!;
    plan.push({
      domain: c.row.domain,
      competitorId: m.competitor_id,
      pageId: m.page_id,
      team: m.team,
      action: c.action,
      bucket: c.row.bucket,
      reason: c.reason,
      consecutiveFailures: m.consecutive_failures,
    });
  }

  // Write machine-readable plan (without consecutiveFailures per spec shape).
  const fileOut = plan.map((p) => ({
    domain: p.domain,
    competitorId: p.competitorId,
    pageId: p.pageId,
    team: p.team,
    action: p.action,
    bucket: p.bucket,
    reason: p.reason,
  }));
  writeFileSync(OUT_PATH, JSON.stringify(fileOut, null, 2));

  // ---- Printed markdown summary ----
  const order: Action[] = ['deactivate', 'fix_url', 'keep'];
  const byAction = new Map<Action, PlanEntry[]>();
  for (const a of order) byAction.set(a, []);
  for (const p of plan) byAction.get(p.action)!.push(p);

  console.log('# Remediation Plan (PLAN ONLY — no DB writes)\n');
  console.log(`Classifier rows: ${rows.length}  |  matched active pages: ${plan.length}  |  skipped (not found / inactive): ${skipped.length}\n`);
  console.log('## Counts per action\n');
  for (const a of order) console.log(`- **${a}**: ${byAction.get(a)!.length}`);
  console.log('');

  for (const a of order) {
    const entries = byAction.get(a)!;
    console.log(`## ${a} (${entries.length})\n`);
    if (entries.length === 0) {
      console.log('_none_\n');
      continue;
    }
    console.log('| domain | competitor_id | page_id | team | consec_failures | reason |');
    console.log('| --- | --- | --- | --- | --- | --- |');
    for (const e of entries.sort((x, y) => x.domain.localeCompare(y.domain))) {
      console.log(`| ${e.domain} | ${e.competitorId} | ${e.pageId} | ${e.team} | ${e.consecutiveFailures} | ${e.reason} |`);
    }
    console.log('');
  }

  if (skipped.length > 0) {
    console.log(`## skipped domains (no active page in DB)\n`);
    console.log(skipped.sort().join(', '));
    console.log('');
  }

  console.log(`Wrote machine-readable plan to: ${OUT_PATH}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

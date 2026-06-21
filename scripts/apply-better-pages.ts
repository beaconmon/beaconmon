#!/usr/bin/env tsx
/**
 * PROTOTYPE (bounded, with a few prod writes): improve the monitored page for
 * static/broken NON-Shopify competitors. SAMPLE to evaluate before scaling.
 *
 *   PART 1 — Re-derive a working landing URL for the 5 wrong-URL brands
 *            (action === 'fix_url' in scripts/_remediation_plan.json).
 *   PART 2 — For ~12 static-healthy NON-Shopify competitors, find a
 *            "changes often" page (sale / new / shop) for a better outreach hook.
 *
 * For every page changed, the old row is appended to
 * scripts/_applied_better_pages.json BEFORE the write (revert record), then:
 *   UPDATE competitor_pages
 *      SET url=<new>, last_snapshot_hash=NULL, consecutive_failures=0,
 *          next_check_at=now()
 *    WHERE id=<pageId>
 *
 * HARD LIMITS: ~45 HTTP probes total, ~17 row writes, finish fast.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/apply-better-pages.ts
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const TEAM_ID = 'cmqanmrxy000007ofptlnmx07'; // Outreach Research
const SAMPLE_SIZE = 12;
const SLICE = 45;
const TIMEOUT_MS = 7000;
const STATIC_WINDOW_DAYS = 30;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Part 2 "changes often" paths, probed in order.
const CANDIDATE_PATHS = ['/sale', '/collections/sale', '/new', '/shop'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAN_PATH = join(__dirname, '_remediation_plan.json');
const APPLIED_PATH = join(__dirname, '_applied_better_pages.json');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

interface RemediationEntry {
  domain: string;
  competitorId: string;
  pageId: string;
  team: string;
  action: string;
  bucket: string;
  reason: string;
}

interface AppliedRecord {
  pageId: string;
  competitorId: string;
  domain: string;
  old_url: string;
  new_url: string;
  reason: string;
}

type FetchResult = { ok: boolean; status: number; finalUrl: string; body: string; error?: string };

async function fetchUA(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': BROWSER_UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url || url, body };
  } catch (err) {
    return { ok: false, status: 0, finalUrl: url, body: '', error: (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

/** Strip HTML to visible text (HTML-only, mirrors the cheerio content checker). */
function extractText(html: string): string {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  return s.replace(/\s+/g, ' ').trim();
}

function readApplied(): AppliedRecord[] {
  if (!existsSync(APPLIED_PATH)) return [];
  try {
    return JSON.parse(readFileSync(APPLIED_PATH, 'utf8')) as AppliedRecord[];
  } catch {
    return [];
  }
}

/** Append revert record, then write the competitor_pages row. */
async function applyUpdate(rec: AppliedRecord): Promise<void> {
  const applied = readApplied();
  applied.push(rec);
  writeFileSync(APPLIED_PATH, JSON.stringify(applied, null, 2) + '\n', 'utf8');

  await prisma.$executeRaw`
    UPDATE competitor_pages
       SET url = ${rec.new_url},
           last_snapshot_hash = NULL,
           consecutive_failures = 0,
           next_check_at = now()
     WHERE id = ${rec.pageId}`;
}

async function part1(plan: RemediationEntry[]): Promise<void> {
  console.log('\n=== PART 1: fix_url (re-derive landing URL) ===');
  const fixes = plan.filter((p) => p.action === 'fix_url');
  for (const f of fixes) {
    const candidates = [`https://www.${f.domain}/`, `https://${f.domain}/`];
    let winner: string | null = null;
    for (const url of candidates) {
      const r = await fetchUA(url);
      const text = extractText(r.body);
      if (r.status === 200 && text.length > 200) {
        winner = r.finalUrl;
        break;
      }
    }
    if (!winner) {
      console.log(`  ${f.domain}: no working URL`);
      continue;
    }
    // old_url for the page: look it up
    const page = await prisma.competitorPage.findUnique({ where: { id: f.pageId }, select: { url: true } });
    const oldUrl = page?.url ?? `https://${f.domain}/`;
    await applyUpdate({
      pageId: f.pageId,
      competitorId: f.competitorId,
      domain: f.domain,
      old_url: oldUrl,
      new_url: winner,
      reason: 'fix_url: re-derived working landing URL',
    });
    console.log(`  ${f.domain}: ${oldUrl} -> ${winner}`);
  }
}

async function isShopify(domain: string): Promise<boolean> {
  const r = await fetchUA(`https://${domain}/products.json?limit=1`);
  if (r.status !== 200) return false;
  try {
    const json = JSON.parse(r.body) as { products?: unknown[] };
    return Array.isArray(json.products) && json.products.length > 0;
  } catch {
    return false;
  }
}

async function part2(plan: RemediationEntry[]): Promise<void> {
  console.log('\n=== PART 2: better-page sample (non-Shopify static) ===');
  const excludeIds = new Set(
    plan.filter((p) => p.action === 'deactivate' || p.action === 'fix_url').map((p) => p.pageId),
  );

  // One SQL: active non-deleted competitors on Outreach Research with a healthy
  // active content page (consecutive_failures = 0) and 0 events in last 30 days.
  const since = new Date(Date.now() - STATIC_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.$queryRaw<
    { pageId: string; competitorId: string; domain: string; url: string }[]
  >`
    SELECT cp.id AS "pageId", c.id AS "competitorId", c.domain AS "domain", cp.url AS "url"
      FROM competitor_pages cp
      JOIN competitors c ON c.id = cp.competitor_id
     WHERE c.team_id = ${TEAM_ID}
       AND c.is_active = true
       AND c.deleted_at IS NULL
       AND cp.is_active = true
       AND cp.consecutive_failures = 0
       AND NOT EXISTS (
         SELECT 1 FROM competitor_events ce
          WHERE ce.competitor_id = c.id
            AND ce.detected_at >= ${since}
       )
     ORDER BY random()
     LIMIT ${SLICE}`;

  const slice = rows.filter((r) => !excludeIds.has(r.pageId));
  console.log(`  candidate slice: ${slice.length} (after excluding deactivate/fix_url pageIds)`);

  let updated = 0;
  let skippedShopify = 0;
  let skippedNoPage = 0;

  for (const row of slice) {
    if (updated >= SAMPLE_SIZE) break;

    if (await isShopify(row.domain)) {
      skippedShopify++;
      console.log(`  ${row.domain}: SHOPIFY -> skip`);
      continue;
    }

    let chosen: string | null = null;
    let chosenPath: string | null = null;
    for (const path of CANDIDATE_PATHS) {
      const url = `https://${row.domain}${path}`;
      const r = await fetchUA(url);
      if (r.status === 200) {
        const text = extractText(r.body);
        if (text.length > 200) {
          chosen = r.finalUrl;
          chosenPath = path;
          break;
        }
      }
    }

    if (!chosen) {
      skippedNoPage++;
      console.log(`  ${row.domain}: no good page (tried ${CANDIDATE_PATHS.join(', ')}) -> skip`);
      continue;
    }

    await applyUpdate({
      pageId: row.pageId,
      competitorId: row.competitorId,
      domain: row.domain,
      old_url: row.url,
      new_url: chosen,
      reason: `better-page: ${chosenPath}`,
    });
    updated++;
    console.log(`  ${row.domain}: ${row.url} -> ${chosen} (${chosenPath})`);
  }

  console.log(
    `\n  Part 2 summary: updated=${updated}, skipped-as-Shopify=${skippedShopify}, skipped-no-good-page=${skippedNoPage}, slice-exhausted=${updated < SAMPLE_SIZE}`,
  );
}

async function main(): Promise<void> {
  const plan = JSON.parse(readFileSync(PLAN_PATH, 'utf8')) as RemediationEntry[];
  await part1(plan);
  await part2(plan);
  const applied = readApplied();
  console.log(`\nTotal rows written this run + prior: ${applied.length}. Revert record: ${APPLIED_PATH}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

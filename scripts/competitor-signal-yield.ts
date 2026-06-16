#!/usr/bin/env tsx
/**
 * Signal yield report for the Outreach Research team. READ-ONLY. No DB writes.
 *
 * The outreach hook is a usable competitor change event. This measures how many
 * active competitors actually produce hooks, and splits the zero-signal ones
 * into "broken page" vs "static homepage" so we can tell whether the seed is
 * outreach-ready at all.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/competitor-signal-yield.ts
 */

import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const TEAM_ID = 'cmqanmrxy000007ofptlnmx07'; // Outreach Research

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1]! + s[m]!) / 2 : s[m]!;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * s.length) - 1;
  return s[Math.max(0, Math.min(s.length - 1, idx))]!;
}

function pct(n: number, d: number): string {
  if (d === 0) return 'n/a';
  return `${((n / d) * 100).toFixed(1)}%`;
}

async function q<T = any>(sql: string): Promise<T[]> {
  return (await prisma.$queryRawUnsafe(sql)) as T[];
}

async function main(): Promise<void> {
  // Total active competitors in the team.
  const totalRow = await q<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM competitors
     WHERE team_id = '${TEAM_ID}' AND is_active = true AND deleted_at IS NULL`,
  );
  const total = totalRow[0]!.n;

  // Competitors with >= 1 event EVER.
  const everRow = await q<{ n: number }>(
    `SELECT COUNT(DISTINCT competitor_id)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}'`,
  );
  const everCount = everRow[0]!.n;

  // >= 1 event in last 30d.
  const d30Row = await q<{ n: number }>(
    `SELECT COUNT(DISTINCT competitor_id)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}' AND detected_at >= now() - interval '30 days'`,
  );
  const d30Count = d30Row[0]!.n;

  // >= 1 medium-or-high event in last 30d (NULL significance treated as medium).
  const medHigh30Row = await q<{ n: number }>(
    `SELECT COUNT(DISTINCT competitor_id)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}' AND detected_at >= now() - interval '30 days'
       AND COALESCE(significance, 'medium') IN ('medium', 'high')`,
  );
  const medHigh30Count = medHigh30Row[0]!.n;

  // >= 1 event in last 7d.
  const d7Row = await q<{ n: number }>(
    `SELECT COUNT(DISTINCT competitor_id)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}' AND detected_at >= now() - interval '7 days'`,
  );
  const d7Count = d7Row[0]!.n;

  // Distribution: events-per-competitor buckets over last 30d (across ALL active competitors).
  const perCompRows = await q<{ competitor_id: string; n: number }>(
    `SELECT competitor_id, COUNT(*)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}' AND detected_at >= now() - interval '30 days'
     GROUP BY competitor_id`,
  );
  const eventCountByComp = new Map<string, number>();
  for (const r of perCompRows) eventCountByComp.set(r.competitor_id, r.n);

  // active competitor ids
  const activeCompRows = await q<{ id: string }>(
    `SELECT id FROM competitors
     WHERE team_id = '${TEAM_ID}' AND is_active = true AND deleted_at IS NULL`,
  );
  const buckets = { '0': 0, '1': 0, '2-5': 0, '6-20': 0, '21+': 0 };
  for (const c of activeCompRows) {
    const n = eventCountByComp.get(c.id) ?? 0;
    if (n === 0) buckets['0']++;
    else if (n === 1) buckets['1']++;
    else if (n <= 5) buckets['2-5']++;
    else if (n <= 20) buckets['6-20']++;
    else buckets['21+']++;
  }

  // Event type breakdown over 30d.
  const typeRows = await q<{ type: string; n: number }>(
    `SELECT type, COUNT(*)::int AS n FROM competitor_events
     WHERE team_id = '${TEAM_ID}' AND detected_at >= now() - interval '30 days'
     GROUP BY type ORDER BY n DESC`,
  );

  // Zero-signal split: of active competitors with 0 events in 30d, how many have a
  // failing page (consecutive_failures >= 2) vs a healthy page (consecutive_failures = 0).
  // Each competitor has 1 content page. Aggregate page health to the competitor level
  // using the worst (max consecutive_failures) page in case of multiples.
  const pageHealthRows = await q<{ competitor_id: string; max_fail: number; min_fail: number; pages: number }>(
    `SELECT competitor_id,
            MAX(consecutive_failures)::int AS max_fail,
            MIN(consecutive_failures)::int AS min_fail,
            COUNT(*)::int AS pages
     FROM competitor_pages
     WHERE team_id = '${TEAM_ID}' AND is_active = true
     GROUP BY competitor_id`,
  );
  const pageHealth = new Map<string, { max: number; min: number; pages: number }>();
  for (const r of pageHealthRows) pageHealth.set(r.competitor_id, { max: r.max_fail, min: r.min_fail, pages: r.pages });

  let zeroFailing = 0; // consecutive_failures >= 2 (broken)
  let zeroHealthy = 0; // consecutive_failures = 0 (fetching fine, static)
  let zeroOther = 0; // 1 failure, or no active page
  let zeroNoPage = 0;
  for (const c of activeCompRows) {
    const n = eventCountByComp.get(c.id) ?? 0;
    if (n !== 0) continue;
    const h = pageHealth.get(c.id);
    if (!h) {
      zeroNoPage++;
      zeroOther++;
      continue;
    }
    if (h.max >= 2) zeroFailing++;
    else if (h.max === 0) zeroHealthy++;
    else zeroOther++; // exactly 1 failure
  }
  const zeroTotal = buckets['0'];

  // Median / p90 days since last event for competitors that have ANY events.
  const lastEventRows = await q<{ competitor_id: string; days: number }>(
    `SELECT competitor_id,
            EXTRACT(EPOCH FROM (now() - MAX(detected_at))) / 86400.0 AS days
     FROM competitor_events
     WHERE team_id = '${TEAM_ID}'
     GROUP BY competitor_id`,
  );
  const daysSince = lastEventRows.map((r) => Number(r.days));

  // ---- Print summary ----
  const line = (label: string, val: string | number, denom?: number) => {
    const v = typeof val === 'number' && denom != null ? `${val}  (${pct(val, denom)})` : String(val);
    console.log(`  ${label.padEnd(48)}${v}`);
  };

  console.log('================================================================');
  console.log('SIGNAL YIELD — Outreach Research team');
  console.log('Question: of the active competitors, how many produce a usable hook?');
  console.log('================================================================');
  console.log('');
  line('total active competitors', total);
  console.log('');
  console.log('Competitors producing >= 1 event:');
  line('ever', everCount, total);
  line('in last 30d', d30Count, total);
  line('medium-or-high in last 30d', medHigh30Count, total);
  line('in last 7d', d7Count, total);
  console.log('');
  console.log('Events-per-competitor distribution (last 30d):');
  for (const [k, v] of Object.entries(buckets)) {
    console.log(`  ${('events ' + k).padEnd(48)}${v} competitors  (${pct(v, total)})`);
  }
  console.log('');
  console.log('Event type breakdown (last 30d):');
  if (typeRows.length === 0) console.log('  (none)');
  const totalEvents30 = typeRows.reduce((a, r) => a + r.n, 0);
  for (const r of typeRows) {
    console.log(`  ${r.type.padEnd(48)}${r.n}  (${pct(r.n, totalEvents30)})`);
  }
  console.log(`  ${'TOTAL events (30d)'.padEnd(48)}${totalEvents30}`);
  console.log('');
  console.log('Zero-signal split (competitors with 0 events in 30d):');
  line('total zero-signal', zeroTotal, total);
  line('  broken page (consec_failures >= 2)', zeroFailing, zeroTotal);
  line('  static healthy page (consec_failures = 0)', zeroHealthy, zeroTotal);
  line('  other (1 failure / no active page)', zeroOther, zeroTotal);
  if (zeroNoPage > 0) line('    of which no active page', zeroNoPage, zeroTotal);
  console.log('');
  console.log('Recency for competitors that have ANY events:');
  line('competitors with any events', daysSince.length);
  line('median days since last event', median(daysSince).toFixed(1));
  line('p90 days since last event', percentile(daysSince, 90).toFixed(1));
  console.log('');
  console.log('================================================================');
  console.log('BOTTOM LINE');
  console.log(`  ${d30Count} of ${total} competitors (${pct(d30Count, total)}) produced a usable hook in 30d.`);
  console.log(`  ${medHigh30Count} of ${total} (${pct(medHigh30Count, total)}) produced a medium+ hook in 30d.`);
  console.log(`  Of ${zeroTotal} zero-signal competitors: ${zeroFailing} broken, ${zeroHealthy} static-healthy, ${zeroOther} other.`);
  console.log('================================================================');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

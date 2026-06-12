#!/usr/bin/env tsx
/**
 * Competitor coverage report. Read-only. Run against the prod DB.
 *
 * Prints per-competitor: platform, discovery state, data tier, product count,
 * and events/week by significance over the trailing window. Then aggregates:
 * percent of competitors with a working full-catalog feed, and the median
 * medium+ events/week. The aggregates feed the expansion trigger table in
 * docs/strategy/competitor-intelligence-jtbd.md and outreach prioritization.
 *
 * Environment:
 *   DATABASE_URL  required, direct (not pooled)
 *   WEEKS         optional, trailing window in weeks (default 4)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/competitor-coverage-report.ts
 */

import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const WEEKS = Math.max(1, parseInt(process.env['WEEKS'] ?? '4', 10) || 4);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return 'n/a';
  return `${((numerator / denominator) * 100).toFixed(0)}%`;
}

async function main(): Promise<void> {
  const since = new Date(Date.now() - WEEKS * 7 * 24 * 60 * 60 * 1000);

  const competitors = await prisma.competitor.findMany({
    where: { deletedAt: null, isActive: true },
    select: {
      id: true,
      teamId: true,
      name: true,
      domain: true,
      platform: true,
      discoveryState: true,
      dataTier: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ teamId: 'asc' }, { name: 'asc' }],
  });

  if (competitors.length === 0) {
    console.log('No active competitors found.');
    return;
  }

  const events = await prisma.competitorEvent.groupBy({
    by: ['competitorId', 'significance'],
    where: { detectedAt: { gte: since }, competitorId: { in: competitors.map((c) => c.id) } },
    _count: { _all: true },
  });

  const byCompetitor = new Map<string, { low: number; medium: number; high: number }>();
  for (const row of events) {
    const bucket = byCompetitor.get(row.competitorId) ?? { low: 0, medium: 0, high: 0 };
    // null significance is treated as medium, matching digest behavior
    const sig = (row.significance ?? 'medium') as 'low' | 'medium' | 'high';
    bucket[sig] += row._count._all;
    byCompetitor.set(row.competitorId, bucket);
  }

  console.log(`Competitor coverage report (trailing ${WEEKS} weeks, since ${since.toISOString().slice(0, 10)})`);
  console.log('');

  const header = ['competitor', 'domain', 'platform', 'state', 'tier', 'products', 'low/wk', 'med/wk', 'high/wk'];
  const rows: string[][] = [];
  const mediumPlusPerWeek: number[] = [];
  let fullCatalogCount = 0;

  for (const c of competitors) {
    const counts = byCompetitor.get(c.id) ?? { low: 0, medium: 0, high: 0 };
    const perWeek = (n: number) => (n / WEEKS).toFixed(1);
    mediumPlusPerWeek.push((counts.medium + counts.high) / WEEKS);
    if (c.dataTier === 'full_catalog' && c.discoveryState === 'ready') fullCatalogCount++;
    rows.push([
      c.name,
      c.domain,
      c.platform,
      c.discoveryState,
      c.dataTier,
      String(c._count.products),
      perWeek(counts.low),
      perWeek(counts.medium),
      perWeek(counts.high),
    ]);
  }

  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]!.length)));
  const printRow = (r: string[]) => console.log(r.map((cell, i) => cell.padEnd(widths[i]! + 2)).join(''));
  printRow(header);
  printRow(widths.map((w) => '-'.repeat(w)));
  for (const r of rows) printRow(r);

  const total = competitors.length;
  const limited = competitors.filter((c) => c.dataTier === 'limited').length;
  const selected = competitors.filter((c) => c.dataTier === 'selected_products').length;

  console.log('');
  console.log('Aggregates:');
  console.log(`  competitors:                      ${total}`);
  console.log(`  full catalog (working feed):      ${fullCatalogCount} (${pct(fullCatalogCount, total)})`);
  console.log(`  selected products (fallback):     ${selected} (${pct(selected, total)})`);
  console.log(`  limited access:                   ${limited} (${pct(limited, total)})`);
  console.log(`  median medium+ events/week:       ${median(mediumPlusPerWeek).toFixed(2)}`);
  console.log('');
  console.log('Expansion trigger reference: median medium+ events/week < 1 with > 80% access over ~4 weeks across 20+ competitors.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

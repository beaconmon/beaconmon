#!/usr/bin/env tsx
/**
 * Competitor page failure classifier. READ-ONLY. Run against the prod DB.
 *
 * Buckets every actively-failing competitor content page (consecutive_failures >= 2)
 * by root cause so we know which are recoverable. Makes NO database writes.
 *
 * For each failing page it fetches the URL twice (bot UA + browser UA), records
 * status / cf-mitigated / server headers / final URL / network errors, and
 * classifies into exactly one bucket:
 *   dns_dead | hard_cf | soft_block | slow_timeout | ok_now | other
 *
 * Output: summary table of counts per bucket (split by team), per-bucket row
 * listing, plus a machine-readable dump at scripts/_classifier_out.json.
 *
 * Environment:
 *   DATABASE_URL  required, direct (not pooled)
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/competitor-page-failure-classifier.ts
 */

import { writeFileSync } from 'node:fs';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const BOT_UA = 'beaconmon/1.0 (+https://beaconmon.com)';
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const TIMEOUT_MS = 12_000;
const CONCURRENCY = 5;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

type FailingPage = {
  page_id: string;
  competitor_id: string;
  team_id: string;
  team_name: string;
  domain: string;
  url: string;
  interval_seconds: number;
  consecutive_failures: number;
  last_checked_at: Date | null;
};

type FetchOutcome = {
  status: number | null; // null when the request never produced an HTTP response
  cfMitigated: string | null;
  server: string | null;
  finalUrl: string | null;
  error: string | null; // normalized network error, e.g. 'ENOTFOUND', 'timeout', 'ECONNREFUSED'
};

type Bucket = 'dns_dead' | 'hard_cf' | 'soft_block' | 'slow_timeout' | 'ok_now' | 'other';

type Classified = FailingPage & {
  bot: FetchOutcome;
  browser: FetchOutcome;
  bucket: Bucket;
  note: string;
};

function normalizeError(err: unknown): string {
  if (err instanceof Error) {
    // undici/fetch surfaces the real cause (DNS, connreset, etc) on err.cause
    const cause = (err as { cause?: unknown }).cause;
    const codeFrom = (e: unknown): string | null => {
      if (e && typeof e === 'object' && 'code' in e && typeof (e as { code: unknown }).code === 'string') {
        return (e as { code: string }).code;
      }
      return null;
    };
    const code = codeFrom(cause) ?? codeFrom(err);
    if (code) return code;
    if (err.name === 'AbortError' || /timeout|aborted/i.test(err.message)) return 'timeout';
    return err.message || 'unknown_error';
  }
  return String(err);
}

async function fetchOnce(url: string, ua: string): Promise<FetchOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': ua,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
    return {
      status: res.status,
      cfMitigated: res.headers.get('cf-mitigated'),
      server: res.headers.get('server'),
      finalUrl: res.url || url,
      error: null,
    };
  } catch (err) {
    return { status: null, cfMitigated: null, server: null, finalUrl: null, error: normalizeError(err) };
  } finally {
    clearTimeout(timer);
  }
}

const NETWORK_ERRORS = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT',
  'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'ERR_TLS_CERT_ALTNAME_INVALID',
]);

function isDnsOrConnError(o: FetchOutcome): boolean {
  if (!o.error) return false;
  return o.error.startsWith('ENOTFOUND') || o.error.startsWith('EAI_AGAIN') || NETWORK_ERRORS.has(o.error);
}

function isTimeout(o: FetchOutcome): boolean {
  return o.error === 'timeout' || o.error === 'UND_ERR_CONNECT_TIMEOUT' || o.error === 'ETIMEDOUT';
}

function isCfChallenge(o: FetchOutcome): boolean {
  if (o.cfMitigated && o.cfMitigated.toLowerCase() === 'challenge') return true;
  return false;
}

function isBlockedStatus(o: FetchOutcome): boolean {
  return o.status === 403 || o.status === 503 || o.status === 429;
}

function is2xx(o: FetchOutcome): boolean {
  return o.status !== null && o.status >= 200 && o.status < 300;
}

function is5xx(o: FetchOutcome): boolean {
  return o.status !== null && o.status >= 500;
}

function classify(bot: FetchOutcome, browser: FetchOutcome): { bucket: Bucket; note: string } {
  // dns_dead: hostname does not resolve / connection error on BOTH.
  const botDead = isDnsOrConnError(bot) && !isTimeout(bot);
  const browserDead = isDnsOrConnError(browser) && !isTimeout(browser);
  if (botDead && browserDead) {
    return { bucket: 'dns_dead', note: `bot=${bot.error} browser=${browser.error}` };
  }

  const botOk = is2xx(bot);
  const browserOk = is2xx(browser);

  // ok_now: 2xx with BOTH UAs (transient/recovered).
  if (botOk && browserOk) {
    return { bucket: 'ok_now', note: `bot=${bot.status} browser=${browser.status}` };
  }

  const botBlocked = isCfChallenge(bot) || isBlockedStatus(bot);
  const browserBlocked = isCfChallenge(browser) || isBlockedStatus(browser);

  // soft_block: blocked/failed with the bot UA but 2xx with the browser UA. RECOVERABLE.
  if (!botOk && browserOk) {
    const reason = botBlocked
      ? isCfChallenge(bot)
        ? 'cf-challenge'
        : `${bot.status}`
      : bot.error
        ? bot.error
        : `${bot.status}`;
    return {
      bucket: 'soft_block',
      note: `bot blocked (${reason}) -> browser 2xx (${browser.status}); server=${browser.server ?? '?'}`,
    };
  }

  // hard_cf: blocked even with the browser UA (403/503/429 or cf-mitigated=challenge).
  if (browserBlocked) {
    const reason = isCfChallenge(browser) ? 'cf-mitigated=challenge' : `status ${browser.status}`;
    return {
      bucket: 'hard_cf',
      note: `browser still blocked: ${reason}; server=${browser.server ?? '?'}; bot=${bot.cfMitigated ? `cf:${bot.cfMitigated}` : bot.status ?? bot.error}`,
    };
  }

  // slow_timeout: times out or 5xx (but not a CF challenge) on the browser attempt.
  if (isTimeout(browser) || isTimeout(bot) || is5xx(browser) || is5xx(bot)) {
    const detail = isTimeout(browser) || isTimeout(bot) ? 'timeout' : '5xx';
    return {
      bucket: 'slow_timeout',
      note: `${detail}: bot=${bot.status ?? bot.error} browser=${browser.status ?? browser.error}`,
    };
  }

  // other: anything else (include status/notes).
  return {
    bucket: 'other',
    note: `bot=${bot.status ?? bot.error} (cf=${bot.cfMitigated ?? '-'}) browser=${browser.status ?? browser.error} (cf=${browser.cfMitigated ?? '-'})`,
  };
}

function jitter(maxMs: number): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.floor(Math.random() * maxMs)));
}

async function processPage(p: FailingPage): Promise<Classified> {
  // bot first, then browser, with a small jitter between to be polite to the host.
  const bot = await fetchOnce(p.url, BOT_UA);
  await jitter(400);
  const browser = await fetchOnce(p.url, BROWSER_UA);
  const { bucket, note } = classify(bot, browser);
  return { ...p, bot, browser, bucket, note };
}

async function runPool(pages: FailingPage[]): Promise<Classified[]> {
  const results: Classified[] = new Array(pages.length);
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= pages.length) return;
      await jitter(250);
      results[i] = await processPage(pages[i]!);
      process.stderr.write(`  [${i + 1}/${pages.length}] ${results[i]!.bucket}  ${pages[i]!.domain}\n`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pages.length) }, () => worker()));
  return results;
}

const BUCKET_ORDER: Bucket[] = ['soft_block', 'hard_cf', 'dns_dead', 'slow_timeout', 'ok_now', 'other'];

async function main(): Promise<void> {
  // STEP 1: active failing pages joined to competitor (domain) and team (name).
  const rows = await prisma.$queryRaw<FailingPage[]>`
    SELECT
      cp.id               AS page_id,
      cp.competitor_id    AS competitor_id,
      cp.team_id          AS team_id,
      t.name              AS team_name,
      c.domain            AS domain,
      cp.url              AS url,
      cp.interval_seconds AS interval_seconds,
      cp.consecutive_failures AS consecutive_failures,
      cp.last_checked_at  AS last_checked_at
    FROM competitor_pages cp
    JOIN competitors c ON c.id = cp.competitor_id
    JOIN teams t       ON t.id = cp.team_id
    WHERE cp.is_active = true
      AND cp.consecutive_failures >= 2
    ORDER BY t.name ASC, c.domain ASC
  `;

  console.log(`Found ${rows.length} active competitor pages with consecutive_failures >= 2.`);
  if (rows.length === 0) {
    writeFileSync('scripts/_classifier_out.json', JSON.stringify({ generatedAt: new Date().toISOString(), total: 0, results: [] }, null, 2));
    return;
  }

  console.log('Fetching each twice (bot UA + browser UA)...');
  console.log('');
  const classified = await runPool(rows);

  // STEP 3 output: counts per bucket, split by team.
  const teams = [...new Set(classified.map((c) => c.team_name))].sort();
  const countByTeamBucket = new Map<string, Map<Bucket, number>>();
  for (const t of teams) countByTeamBucket.set(t, new Map());
  for (const c of classified) {
    const m = countByTeamBucket.get(c.team_name)!;
    m.set(c.bucket, (m.get(c.bucket) ?? 0) + 1);
  }

  console.log('');
  console.log('=== Bucket counts ===');
  console.log('');
  const header = ['bucket', ...teams, 'TOTAL'];
  const tableRows: string[][] = [];
  for (const b of BUCKET_ORDER) {
    let total = 0;
    const cells = teams.map((t) => {
      const n = countByTeamBucket.get(t)!.get(b) ?? 0;
      total += n;
      return String(n);
    });
    if (total === 0) continue;
    tableRows.push([b, ...cells, String(total)]);
  }
  const totalsRow = ['TOTAL', ...teams.map((t) => String(classified.filter((c) => c.team_name === t).length)), String(classified.length)];
  tableRows.push(totalsRow);
  const widths = header.map((h, i) => Math.max(h.length, ...tableRows.map((r) => r[i]!.length)));
  const printRow = (r: string[]) => console.log(r.map((cell, i) => cell.padEnd(widths[i]! + 2)).join(''));
  printRow(header);
  printRow(widths.map((w) => '-'.repeat(w)));
  for (const r of tableRows) printRow(r);

  // Per-bucket row listings.
  for (const b of BUCKET_ORDER) {
    const inBucket = classified.filter((c) => c.bucket === b);
    if (inBucket.length === 0) continue;
    console.log('');
    console.log(`=== ${b} (${inBucket.length}) ===`);
    const bh = ['team', 'domain', 'page_id', 'status_bot', 'status_browser', 'note'];
    const brows = inBucket.map((c) => [
      c.team_name,
      c.domain,
      c.page_id,
      c.bot.status !== null ? String(c.bot.status) : c.bot.error ?? '-',
      c.browser.status !== null ? String(c.browser.status) : c.browser.error ?? '-',
      c.note,
    ]);
    const bw = bh.map((h, i) => Math.max(h.length, ...brows.map((r) => r[i]!.length)));
    const printB = (r: string[]) => console.log(r.map((cell, i) => cell.padEnd(bw[i]! + 2)).join(''));
    printB(bh);
    printB(bw.map((w) => '-'.repeat(w)));
    for (const r of brows) printB(r);
  }

  // Machine-readable dump.
  const out = {
    generatedAt: new Date().toISOString(),
    botUserAgent: BOT_UA,
    browserUserAgent: BROWSER_UA,
    total: classified.length,
    teams,
    countsByTeamBucket: Object.fromEntries(
      teams.map((t) => [t, Object.fromEntries(BUCKET_ORDER.map((b) => [b, countByTeamBucket.get(t)!.get(b) ?? 0]))]),
    ),
    results: classified.map((c) => ({
      page_id: c.page_id,
      competitor_id: c.competitor_id,
      team_id: c.team_id,
      team_name: c.team_name,
      domain: c.domain,
      url: c.url,
      interval_seconds: c.interval_seconds,
      consecutive_failures: c.consecutive_failures,
      last_checked_at: c.last_checked_at,
      bucket: c.bucket,
      note: c.note,
      bot: c.bot,
      browser: c.browser,
    })),
  };
  writeFileSync('scripts/_classifier_out.json', JSON.stringify(out, null, 2));
  console.log('');
  console.log('Wrote scripts/_classifier_out.json');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

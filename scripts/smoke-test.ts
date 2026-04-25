#!/usr/bin/env tsx
/**
 * Smoke test — run before every production deploy.
 *
 * What it verifies:
 *   1. Database is reachable and writable
 *   2. One full HTTP check cycle runs end-to-end (enqueue → process → persist)
 *   3. A CheckResult row is written with success=true
 *   4. The /api/health endpoint returns 200 (requires BEACONMON_URL to be set)
 *
 * Environment:
 *   DATABASE_URL    — required, direct (not pooled) for test data writes
 *   REDIS_URL       — required, same Redis the workers use
 *   BEACONMON_URL   — optional (e.g. https://beaconmon.com), enables health check
 *
 * Usage:
 *   pnpm smoke-test
 *   DATABASE_URL=... REDIS_URL=... tsx scripts/smoke-test.ts
 *
 * Exits 0 on success, 1 on failure.
 */

import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { processCheckJob } from '../apps/workers/process-check-job.js';
import { createAlertQueue } from '../packages/queue/src/queues.js';
import type { AlertJob } from '../packages/queue/src/types.js';
import type { Queue } from 'bullmq';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env['DATABASE_URL'];
const REDIS_URL = process.env['REDIS_URL'];
const BEACONMON_URL = process.env['BEACONMON_URL'];

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}
if (!REDIS_URL) {
  console.error('ERROR: REDIS_URL is required');
  process.exit(1);
}

process.env['DATABASE_URL'] = DATABASE_URL;

const prisma = new PrismaClient({ log: [] });
const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });

// Stub alert queue — smoke test doesn't send real alerts
function createStubAlertQueue(): Queue<AlertJob> {
  return {
    add: async () => ({ id: 'stub' }) as ReturnType<Queue<AlertJob>['add']>,
    close: async () => {},
  } as unknown as Queue<AlertJob>;
}

// ─── Local HTTP server ────────────────────────────────────────────────────────

function startLocalServer(): Promise<{ server: Server; url: string }> {
  return new Promise((resolve, reject) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('smoke-test-ok');
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        resolve({ server, url: `http://127.0.0.1:${addr.port}` });
      } else {
        reject(new Error('Failed to bind local server'));
      }
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

let teamId: string | null = null;
let monitorId: string | null = null;
let localServer: Server | null = null;

async function cleanup() {
  if (monitorId) {
    await prisma.checkResult.deleteMany({ where: { monitorId } }).catch(() => {});
    await prisma.incident.deleteMany({ where: { monitorId } }).catch(() => {});
    await prisma.monitor.deleteMany({ where: { id: monitorId } }).catch(() => {});
  }
  if (teamId) {
    await prisma.team.deleteMany({ where: { id: teamId } }).catch(() => {});
  }
  await prisma.$disconnect().catch(() => {});
  await redis.quit().catch(() => {});
  localServer?.close();
}

async function main() {
  console.log('🔍 Beaconmon smoke test starting...\n');

  // ── Step 1: DB connectivity ────────────────────────────────────────────────
  process.stdout.write('  [1/5] DB connectivity... ');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('OK');
  } catch (err) {
    console.log('FAIL');
    console.error('       Error:', err);
    return false;
  }

  // ── Step 2: Redis connectivity ─────────────────────────────────────────────
  process.stdout.write('  [2/5] Redis connectivity... ');
  try {
    await redis.connect();
    await redis.ping();
    console.log('OK');
  } catch (err) {
    console.log('FAIL');
    console.error('       Error:', err);
    return false;
  }

  // ── Step 3: Create test fixtures ───────────────────────────────────────────
  process.stdout.write('  [3/5] Creating test team and monitor... ');
  try {
    const { server, url } = await startLocalServer();
    localServer = server;

    const team = await prisma.team.create({
      data: { name: '_smoke-test-team_', plan: 'pro' },
    });
    teamId = team.id;

    const monitor = await prisma.monitor.create({
      data: {
        teamId,
        name: '_smoke-test-monitor_',
        url,
        type: 'http',
        intervalSeconds: 60,
        timeoutMs: 10_000,
      },
    });
    monitorId = monitor.id;
    console.log('OK');

    // ── Step 4: Run check cycle ──────────────────────────────────────────────
    process.stdout.write('  [4/5] Running check cycle... ');
    const alertQueue = createStubAlertQueue();
    await processCheckJob(
      { monitorId, url, type: 'http', intervalSeconds: 60, timeoutMs: 10_000 },
      alertQueue,
      redis as never
    );

    const results = await prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: 1,
    });

    if (results.length === 0) {
      console.log('FAIL — no check_results row written');
      return false;
    }
    if (!results[0]!.success) {
      console.log(`FAIL — check result success=false (status: ${results[0]!.statusCode})`);
      return false;
    }
    console.log(`OK (${results[0]!.responseTimeMs}ms response time)`);
  } catch (err) {
    console.log('FAIL');
    console.error('       Error:', err);
    return false;
  }

  // ── Step 5: Health endpoint (optional) ────────────────────────────────────
  if (BEACONMON_URL) {
    process.stdout.write('  [5/5] Health endpoint... ');
    try {
      const res = await fetch(`${BEACONMON_URL}/api/health`);
      if (res.ok) {
        console.log('OK');
      } else {
        const body = await res.text();
        console.log(`FAIL (HTTP ${res.status}: ${body})`);
        return false;
      }
    } catch (err) {
      console.log('FAIL');
      console.error('       Error:', err);
      return false;
    }
  } else {
    console.log('  [5/5] Health endpoint... SKIPPED (set BEACONMON_URL to enable)');
  }

  return true;
}

main()
  .then(async (ok) => {
    await cleanup();
    if (ok) {
      console.log('\n✅ All smoke tests passed\n');
      process.exit(0);
    } else {
      console.log('\n❌ Smoke test failed — check logs above\n');
      process.exit(1);
    }
  })
  .catch(async (err) => {
    console.error('\nUnhandled error in smoke test:', err);
    await cleanup();
    process.exit(1);
  });

/**
 * Integration test for processCheckJob.
 *
 * Requires a running Postgres database (DATABASE_URL env var).
 * Creates real rows, runs a full check cycle, asserts DB state, then cleans up.
 * Uses a local HTTP server instead of external services for reliability.
 *
 * Run with: pnpm --filter @beaconmon/workers run test:integration
 */
import { createServer, type Server } from 'node:http';
import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import { prisma } from '@beaconmon/db';
import type { AlertJob } from '@beaconmon/queue';
import type { Queue } from 'bullmq';

// Mock env before importing processCheckJob — process-check-job.ts imports env
// at module level, which would call process.exit(1) if DATABASE_URL is missing.
vi.mock('./lib/env.js', () => ({
  env: {
    DATABASE_URL: process.env['DATABASE_URL'] ?? 'postgresql://localhost/test',
    REDIS_URL: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    ALERT_DRY_RUN: false,
    FEATURE_SMS_ALERTS: false,
    FEATURE_MULTI_LOCATION: false,
    REGION_PROBE_SECRET: undefined,
    CF_PROBE_URL_US_EAST: undefined,
    CF_PROBE_URL_US_WEST: undefined,
    CF_PROBE_URL_EU_WEST: undefined,
    CF_PROBE_URL_AP_SOUTHEAST: undefined,
    CF_PROBE_URL_SA_EAST: undefined,
  },
}));

import { processCheckJob } from './process-check-job.js';

// ─── Local test HTTP server ──────────────────────────────────────────────────
let server: Server;
let serverUrl: string;

// Stub alert queue — captures enqueued jobs without a real Redis connection
function createStubAlertQueue(): Queue<AlertJob> & { jobs: AlertJob[] } {
  const jobs: AlertJob[] = [];
  return {
    jobs,
    add: async (_name: string, data: AlertJob) => {
      jobs.push(data);
      return {} as ReturnType<Queue<AlertJob>['add']>;
    },
  } as unknown as Queue<AlertJob> & { jobs: AlertJob[] };
}

// IDs created during the test — cleaned up in afterAll
let teamId: string;
let monitorId: string;

beforeAll(async () => {
  // Start a local HTTP server that always returns 200
  server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        serverUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });

  // Create a test team
  const team = await prisma.team.create({
    data: { name: 'Integration Test Team' },
  });
  teamId = team.id;

  // Create a test monitor (http type, points to local server)
  const monitor = await prisma.monitor.create({
    data: {
      teamId,
      name: 'Integration Test Monitor',
      url: serverUrl,
      type: 'http',
      intervalSeconds: 60,
      timeoutMs: 10000,
    },
  });
  monitorId = monitor.id;
});

afterAll(async () => {
  // Clean up in correct FK order
  await prisma.checkResult.deleteMany({ where: { monitorId } });
  await prisma.incident.deleteMany({ where: { monitorId } });
  await prisma.monitor.deleteMany({ where: { id: monitorId } });
  await prisma.team.deleteMany({ where: { id: teamId } });
  await prisma.$disconnect();

  // Shut down local HTTP server
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('processCheckJob', () => {
  it('writes a check_results row and sets monitor status to up', async () => {
    const alertQueue = createStubAlertQueue();

    await processCheckJob(
      {
        monitorId,
        url: serverUrl,
        type: 'http',
        intervalSeconds: 60,
        timeoutMs: 10000,
      },
      alertQueue
    );

    // Assert check_results row was written
    const results = await prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.success).toBe(true);

    // Assert monitor currentStatus is 'up'
    const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
    expect(monitor?.currentStatus).toBe('up');
    expect(monitor?.consecutiveFailures).toBe(0);
    expect(monitor?.lastCheckedAt).not.toBeNull();
  }, 10_000); // local server, 10s is plenty
});

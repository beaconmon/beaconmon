import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('scheduler'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { prisma, statusPageWorkerRepository } from '@beaconmon/db';
import { createCheckQueue, createContentCheckQueue } from '@beaconmon/queue';
import { PLAN_LIMITS } from '@beaconmon/types';

const HEARTBEAT_KEY = 'worker:heartbeat:scheduler';
// Sentry cron monitor slug — create a matching monitor in your Sentry project
const SENTRY_MONITOR_SLUG = process.env['SENTRY_MONITOR_SLUG'] ?? 'beaconmon-scheduler';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const checkQueue = createCheckQueue(connection);
const contentQueue = createContentCheckQueue(connection);

let running = true;
let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastUptimeCompute = 0;
let lastRetentionCleanup = 0;
const UPTIME_COMPUTE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RETENTION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Enqueue check jobs for all active monitors whose next_check_at <= now.
 */
async function scheduleChecks(): Promise<void> {
  const now = new Date();

  // Wrap each scheduler tick in a Sentry cron check-in so we get alerted if it stops running.
  const checkInId = env.SENTRY_DSN
    ? Sentry.captureCheckIn(
        { monitorSlug: SENTRY_MONITOR_SLUG, status: 'in_progress' },
        // Sentry cron minimum granularity is 1 minute; scheduler ticks every 10s
        { schedule: { type: 'interval', value: 1, unit: 'minute' } }
      )
    : undefined;

  try {
    const dueMonitors = await prisma.monitor.findMany({
      where: {
        isActive: true,
        nextCheckAt: { lte: now },
      },
      select: {
        id: true,
        url: true,
        type: true,
        intervalSeconds: true,
        timeoutMs: true,
        config: true,
        team: { select: { plan: true } },
      },
    });

    for (const monitor of dueMonitors) {
      // Throttle monitors whose interval is below the team's plan minimum
      const planMin = PLAN_LIMITS[monitor.team.plan].checkIntervalSeconds;
      if (monitor.intervalSeconds < planMin) {
        logger.warn(
          {
            service: 'scheduler',
            monitorId: monitor.id,
            interval: monitor.intervalSeconds,
            planMin,
            plan: monitor.team.plan,
          },
          'Monitor interval below plan minimum — throttling to plan minimum'
        );
        await prisma.monitor.update({
          where: { id: monitor.id },
          data: { nextCheckAt: new Date(now.getTime() + planMin * 1000) },
        });
        continue;
      }

      const nextCheckAt = new Date(now.getTime() + monitor.intervalSeconds * 1000);

      // Update next_check_at first (optimistic lock pattern — prevents double-enqueue)
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { nextCheckAt },
      });

      if (monitor.type === 'content') {
        await contentQueue.add(
          `content:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            intervalSeconds: monitor.intervalSeconds,
            selector: (monitor.config as Record<string, unknown>)['selector'] as string | undefined,
          },
          { jobId: `content:${monitor.id}` }
        );
      } else {
        await checkQueue.add(
          `check:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            type: monitor.type as 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword',
            intervalSeconds: monitor.intervalSeconds,
            timeoutMs: monitor.timeoutMs,
          },
          { jobId: `check:${monitor.id}` }
        );
      }
    }

    // Record last run timestamp for the health endpoint
    await connection.set('scheduler:last_run', new Date().toISOString());
    // Write heartbeat
    await connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120);

    if (dueMonitors.length > 0) {
      logger.info(
        { service: 'scheduler', count: dueMonitors.length },
        'Enqueued check jobs'
      );
    }

    if (checkInId) {
      Sentry.captureCheckIn({ monitorSlug: SENTRY_MONITOR_SLUG, checkInId, status: 'ok' });
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Failed to schedule checks');
    Sentry.captureException(err);
    if (checkInId) {
      Sentry.captureCheckIn({ monitorSlug: SENTRY_MONITOR_SLUG, checkInId, status: 'error' });
    }
  }
}

/**
 * Drop check_results partitions older than 365 days.
 * Runs once per day (scheduler calls this on startup and then daily).
 */
async function purgeOldPartitions(): Promise<void> {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, '0');
  const partitionName = `check_results_${year}_${month}`;

  try {
    await prisma.$executeRawUnsafe(
      `DROP TABLE IF EXISTS "${partitionName}"`
    );
    logger.info({ service: 'scheduler', partitionName }, 'Purged old partition');
  } catch (err) {
    logger.error({ service: 'scheduler', partitionName, err }, 'Failed to purge partition');
    Sentry.captureException(err);
  }
}

/**
 * Delete check_results older than each team's plan retention window.
 * Free=7d, Pro=90d, Business=365d (capped by the 365-day partition purge).
 *
 * Uses batched DELETE (LIMIT 10000) to avoid long-running transactions.
 * Runs daily; harmless to re-run.
 */
async function runRetentionCleanup(): Promise<void> {
  logger.info({ service: 'scheduler' }, 'Starting per-plan retention cleanup');

  try {
    // Find all teams and their effective plan, grouped with their monitor IDs.
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        plan: true,
        monitors: { select: { id: true } },
      },
    });

    let totalDeleted = 0;

    for (const team of teams) {
      if (team.monitors.length === 0) continue;

      const historyDays = PLAN_LIMITS[team.plan as keyof typeof PLAN_LIMITS].historyDays;
      // Business plan is already handled by partition purge (365 days)
      if (historyDays >= 365) continue;

      const cutoff = new Date(Date.now() - historyDays * 24 * 60 * 60 * 1000);
      const monitorIds = team.monitors.map((m) => m.id);

      // Batched delete — repeat until 0 rows affected to handle large backlogs
      let batchDeleted: number;
      do {
        const result = await prisma.$executeRaw`
          DELETE FROM check_results
          WHERE ctid IN (
            SELECT ctid FROM check_results
            WHERE monitor_id = ANY(${monitorIds})
              AND checked_at < ${cutoff}
            LIMIT 10000
          )
        `;
        batchDeleted = result as unknown as number;
        totalDeleted += batchDeleted;
      } while (batchDeleted > 0);
    }

    logger.info({ service: 'scheduler', totalDeleted }, 'Per-plan retention cleanup complete');
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Retention cleanup failed');
    Sentry.captureException(err);
  }
}

/**
 * Pre-compute 90-day uptime percentages for all monitors on status pages.
 * Stores results in Redis hash `uptime:90d` as { monitorId: percentString }.
 * Runs once on startup, then every 5 minutes inside the scheduler interval.
 */
async function computeUptimePercentages(): Promise<void> {
  try {
    const monitorIds = await statusPageWorkerRepository.findAllMonitorIdsOnStatusPages();
    if (monitorIds.length === 0) return;

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    type UptimeRow = { monitor_id: string; uptime: number };
    const rows = await prisma.$queryRaw<UptimeRow[]>`
      SELECT
        monitor_id,
        ROUND(
          (SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0)::float * 100)::numeric,
          2
        )::float AS uptime
      FROM check_results
      WHERE monitor_id = ANY(${monitorIds})
        AND checked_at >= ${cutoff}
      GROUP BY monitor_id
    `;

    if (rows.length === 0) return;

    // Build flat args for HSET: [field, value, field, value, ...]
    const args: string[] = [];
    for (const row of rows) {
      args.push(row.monitor_id, String(row.uptime ?? 100));
    }
    await connection.hset('uptime:90d', ...args);

    logger.info({ service: 'scheduler', count: rows.length }, 'Uptime percentages computed');
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Failed to compute uptime percentages');
    Sentry.captureException(err);
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // Log which DB connection is in use so ops can verify pooling is configured correctly
  const usingPooled = !!process.env['DATABASE_URL_POOLED'];
  logger.info(
    { service: 'scheduler', connectionMode: usingPooled ? 'pooled (PgBouncer)' : 'direct' },
    'Scheduler started'
  );

  // Run daily tasks once on startup
  await purgeOldPartitions();
  lastRetentionCleanup = Date.now();
  await runRetentionCleanup();

  // Poll every 10 seconds — fine-grained enough for 30s monitors
  schedulerInterval = setInterval(() => {
    if (!running) return;
    void scheduleChecks();

    if (Date.now() - lastUptimeCompute >= UPTIME_COMPUTE_INTERVAL_MS) {
      lastUptimeCompute = Date.now();
      void computeUptimePercentages();
    }

    if (Date.now() - lastRetentionCleanup >= RETENTION_CLEANUP_INTERVAL_MS) {
      lastRetentionCleanup = Date.now();
      void purgeOldPartitions();
      void runRetentionCleanup();
    }
  }, 10_000);

  // Run immediately
  await scheduleChecks();
  lastUptimeCompute = Date.now();
  await computeUptimePercentages();
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, stopping scheduler');
  running = false;

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  await checkQueue.close();
  await contentQueue.close();
  await prisma.$disconnect();
  await connection.quit();

  logger.info('Scheduler shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

void main();

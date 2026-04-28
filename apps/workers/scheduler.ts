import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('scheduler'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { prisma, statusPageWorkerRepository, checkResultRepository, incidentRepository, monitorRepository } from '@beaconmon/db';
import { createCheckQueue, createContentCheckQueue } from '@beaconmon/queue';
import { PLAN_LIMITS, REGIONS } from '@beaconmon/types';
import { evaluateCheckResult, CONSECUTIVE_FAILURES_THRESHOLD } from '@beaconmon/checker';
import { warmStatusPageCache } from '@beaconmon/status-pages';

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

function getEffectivePlan(team: {
  plan: string;
  trialEndsAt: Date | null;
  subscription: { status: string } | null;
}): keyof typeof PLAN_LIMITS {
  const plan = team.plan as keyof typeof PLAN_LIMITS;
  if (plan === 'free') return 'free';
  if (team.trialEndsAt && team.trialEndsAt < new Date()) {
    const subStatus = team.subscription?.status;
    const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
    if (!hasActiveSub) return 'free';
  }
  return plan;
}

/**
 * Returns the set of monitor IDs that are currently in an active maintenance window
 * for the given team. An empty monitor list on a window means all monitors are covered.
 */
async function getMaintenanceMonitorIds(teamId: string, now: Date): Promise<Set<string> | 'all'> {
  const activeWindows = await prisma.maintenanceWindow.findMany({
    where: {
      teamId,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    include: { monitors: { select: { monitorId: true } } },
  });

  if (activeWindows.length === 0) return new Set();

  // Any window with zero monitor rows covers the whole team
  const coversAll = activeWindows.some((w) => w.monitors.length === 0);
  if (coversAll) return 'all';

  const ids = new Set<string>();
  for (const window of activeWindows) {
    for (const m of window.monitors) ids.add(m.monitorId);
  }
  return ids;
}

/**
 * Evaluate a heartbeat monitor directly in the scheduler (no HTTP check needed).
 * Writes a check_result and calls evaluateCheckResult() to handle incident transitions.
 */
async function evaluateHeartbeatMonitor(
  monitor: {
    id: string;
    teamId: string;
    intervalSeconds: number;
    config: Record<string, unknown>;
    currentStatus: string;
    consecutiveFailures: number;
  },
  now: Date
): Promise<void> {
  const service = 'scheduler';
  const { id: monitorId } = monitor;
  const config = monitor.config;
  const gracePeriodSeconds = (config['gracePeriodSeconds'] as number | undefined) ?? 0;

  // Fetch last_heartbeat_at from DB
  const row = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { lastHeartbeatAt: true, currentStatus: true, consecutiveFailures: true },
  });

  const lastHeartbeat = row?.lastHeartbeatAt ?? null;
  const deadlineMs =
    (monitor.intervalSeconds + gracePeriodSeconds) * 1000;
  const missed =
    !lastHeartbeat ||
    now.getTime() - lastHeartbeat.getTime() > deadlineMs;

  const result = {
    monitorId,
    checkedAt: now,
    success: !missed,
    statusCode: null,
    responseTimeMs: null,
    errorType: missed ? ('timeout' as const) : null,
    errorMessage: missed ? 'Heartbeat not received within interval + grace period' : null,
    type: 'heartbeat' as const,
    region: null,
    maintenance: false,
  };

  try {
    await checkResultRepository.create(result);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Heartbeat: failed to write check_result');
    return;
  }

  const prevStatus = (row?.currentStatus ?? 'up') as 'up' | 'down' | 'paused';
  const prevConsecutive = row?.consecutiveFailures ?? 0;
  const evaluation = evaluateCheckResult(result.success, prevStatus, prevConsecutive);

  try {
    await monitorRepository.updateAfterCheck(monitorId, {
      currentStatus: evaluation.status,
      consecutiveFailures: evaluation.consecutiveFailures,
      lastCheckedAt: now,
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Heartbeat: failed to update monitor status');
    return;
  }

  if (evaluation.becameDown) {
    try {
      const incident = await incidentRepository.create({
        monitorId,
        teamId: monitor.teamId,
        startedAt: now,
      });
      logger.info({ service, monitorId, incidentId: incident.id }, 'Heartbeat missed — incident created');
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Heartbeat: failed to create incident');
    }
  }

  if (evaluation.becameUp) {
    try {
      const openIncident = await incidentRepository.findOpenByMonitorId(monitorId);
      if (openIncident) {
        await incidentRepository.resolve(openIncident.id, {
          resolvedAt: now,
          resolutionType: 'automatic',
        });
        logger.info({ service, monitorId, incidentId: openIncident.id }, 'Heartbeat recovered — incident resolved');
      }
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Heartbeat: failed to resolve incident');
    }
  }
}

/**
 * Enqueue check jobs for all active monitors whose next_check_at <= now.
 * Heartbeat monitors are evaluated in-process; all others are enqueued.
 * Maintenance windows are detected per-team and annotated on job payloads.
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
        keyword: true,
        keywordCondition: true,
        teamId: true,
        currentStatus: true,
        consecutiveFailures: true,
        team: {
          select: {
            id: true,
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    // Cache maintenance sets per team to avoid N+1 queries
    const maintenanceByTeam = new Map<string, Set<string> | 'all'>();

    for (const monitor of dueMonitors) {
      // Throttle monitors whose interval is below the team's plan minimum
      const effectivePlan = getEffectivePlan(monitor.team);
      const planMin = PLAN_LIMITS[effectivePlan].checkIntervalSeconds;
      if (monitor.intervalSeconds < planMin) {
        logger.warn(
          {
            service: 'scheduler',
            monitorId: monitor.id,
            interval: monitor.intervalSeconds,
            planMin,
            plan: effectivePlan,
          },
          'Monitor interval below plan minimum — throttling to plan minimum'
        );
        await prisma.monitor.update({
          where: { id: monitor.id },
          data: { nextCheckAt: new Date(now.getTime() + planMin * 1000) },
        });
        continue;
      }

      // Resolve maintenance status for this team (cached)
      if (!maintenanceByTeam.has(monitor.teamId)) {
        maintenanceByTeam.set(
          monitor.teamId,
          await getMaintenanceMonitorIds(monitor.teamId, now)
        );
      }
      const teamMaintenance = maintenanceByTeam.get(monitor.teamId)!;
      const inMaintenance =
        teamMaintenance === 'all' || teamMaintenance.has(monitor.id);

      const nextCheckAt = new Date(now.getTime() + monitor.intervalSeconds * 1000);

      // Update next_check_at first (optimistic lock pattern — prevents double-enqueue)
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { nextCheckAt },
      });

      // ─── Heartbeat: evaluate in-process, no queue needed ──────────────────
      if (monitor.type === 'heartbeat') {
        await evaluateHeartbeatMonitor(
          {
            id: monitor.id,
            teamId: monitor.teamId,
            intervalSeconds: monitor.intervalSeconds,
            config: monitor.config as Record<string, unknown>,
            currentStatus: monitor.currentStatus,
            consecutiveFailures: monitor.consecutiveFailures,
          },
          now
        );
        continue;
      }

      if (monitor.type === 'content') {
        await contentQueue.add(
          `content:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            intervalSeconds: monitor.intervalSeconds,
            selector: (monitor.config as Record<string, unknown>)['selector'] as string | undefined,
            inMaintenance,
          },
          { jobId: `content:${monitor.id}` }
        );
      } else {
        const planRegionCount = PLAN_LIMITS[effectivePlan].regions;
        const enabledRegions = REGIONS.slice(0, planRegionCount);
        const isHttpOrKeyword = monitor.type === 'http' || monitor.type === 'keyword';

        await checkQueue.add(
          `check:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            type: monitor.type as 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword',
            intervalSeconds: monitor.intervalSeconds,
            timeoutMs: monitor.timeoutMs,
            regions: isHttpOrKeyword ? enabledRegions : undefined,
            ...(monitor.type === 'keyword' && {
              keyword: monitor.keyword ?? undefined,
              keywordCondition: (monitor.keywordCondition ?? undefined) as 'present' | 'absent' | undefined,
            }),
            inMaintenance,
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
        AND maintenance = false
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

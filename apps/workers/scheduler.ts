import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('scheduler'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Worker } from 'bullmq';
import {
  prisma,
  checkResultRepository,
  incidentRepository,
  monitorRepository,
} from '@beaconmon/db';
import { QUEUE_NAMES } from '@beaconmon/queue';
import type { LifecycleEmailJob } from '@beaconmon/queue';
import {
  connection,
  checkQueue,
  contentQueue,
  sloBurnQueue,
  intelligenceDigestQueue,
  shopifyFeedQueue,
  competitorPageCheckQueue,
} from './lib/redis.js';
import { processLifecycleEmailJob } from './process-lifecycle-email-job.js';
import { PLAN_LIMITS, REGIONS } from '@beaconmon/types';
import { getEffectivePlan } from '@beaconmon/billing';
import { evaluateCheckResult } from '@beaconmon/checker';
import { tasks } from './tasks/index.js';

const HEARTBEAT_KEY = 'worker:heartbeat:scheduler';
const SENTRY_MONITOR_SLUG = process.env['SENTRY_MONITOR_SLUG'] ?? 'beaconmon-scheduler';

let running = true;
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

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
  const gracePeriodSeconds = (monitor.config['gracePeriodSeconds'] as number | undefined) ?? 0;

  const row = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { lastHeartbeatAt: true, currentStatus: true, consecutiveFailures: true },
  });

  const lastHeartbeat = row?.lastHeartbeatAt ?? null;
  const deadlineMs = (monitor.intervalSeconds + gracePeriodSeconds) * 1000;
  const missed =
    !lastHeartbeat || now.getTime() - lastHeartbeat.getTime() > deadlineMs;

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

  const checkInId = env.SENTRY_DSN
    ? Sentry.captureCheckIn(
        { monitorSlug: SENTRY_MONITOR_SLUG, status: 'in_progress' },
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

    const maintenanceByTeam = new Map<string, Set<string> | 'all'>();

    for (const monitor of dueMonitors) {
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

      if (!maintenanceByTeam.has(monitor.teamId)) {
        maintenanceByTeam.set(
          monitor.teamId,
          await getMaintenanceMonitorIds(monitor.teamId, now)
        );
      }
      const teamMaintenance = maintenanceByTeam.get(monitor.teamId)!;
      const inMaintenance = teamMaintenance === 'all' || teamMaintenance.has(monitor.id);

      const nextCheckAt = new Date(now.getTime() + monitor.intervalSeconds * 1000);

      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { nextCheckAt },
      });

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
        await contentQueue.add(`content:${monitor.id}:${now.getTime()}`, {
          monitorId: monitor.id,
          teamId: monitor.teamId,
          url: monitor.url,
          intervalSeconds: monitor.intervalSeconds,
          selector: (monitor.config as Record<string, unknown>)['selector'] as string | undefined,
          inMaintenance,
        });
      } else {
        const planRegionCount = PLAN_LIMITS[effectivePlan].regions;
        const enabledRegions = REGIONS.slice(0, planRegionCount);
        const isHttpOrKeyword = monitor.type === 'http' || monitor.type === 'keyword';

        await checkQueue.add(`check:${monitor.id}:${now.getTime()}`, {
          monitorId: monitor.id,
          teamId: monitor.teamId,
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
        });
      }
    }

    // Competitor page scheduling
    const duePages = await prisma.competitorPage.findMany({
      where: {
        isActive: true,
        competitor: { isActive: true, deletedAt: null },
        OR: [{ nextCheckAt: { lte: now } }, { nextCheckAt: null }],
      },
      select: {
        id: true,
        competitorId: true,
        teamId: true,
        url: true,
        selector: true,
        intervalSeconds: true,
      },
    });
    for (const page of duePages) {
      await competitorPageCheckQueue.add(
        'competitor-page-check',
        {
          competitorPageId: page.id,
          competitorId: page.competitorId,
          teamId: page.teamId,
          url: page.url,
          selector: page.selector ?? undefined,
          intervalSeconds: page.intervalSeconds,
        },
        // Timestamped jobId: a static id is silently deduplicated by BullMQ while a
        // previous completed job is retained (removeOnComplete count 100), which
        // stalls the page forever. The worker's Redis processing lock and change
        // dedup guard already prevent concurrent double-processing.
        { jobId: `cpc_${page.id}_${now.getTime()}` }
      );
      await prisma.competitorPage.update({
        where: { id: page.id },
        data: { nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000) },
      });
    }

    // Catalog sync scheduling, cadence by data tier, each enforced via Redis NX key:
    //   full_catalog       hourly sync (55-min TTL, key name kept from the Shopify-only era)
    //   selected_products  daily fallback sync (23h TTL) plus weekly sitemap rescan (6.5d TTL)
    //   limited            weekly re-probe of the extraction ladder (6.5d TTL)
    const catalogCompetitors = await prisma.competitor.findMany({
      where: { isActive: true, deletedAt: null, discoveryState: { not: 'not_applicable' } },
      select: { id: true, teamId: true, domain: true, dataTier: true },
    });
    for (const c of catalogCompetitors) {
      const payload = { competitorId: c.id, teamId: c.teamId, domain: c.domain };

      if (c.dataTier === 'full_catalog') {
        const set = await connection.set(`shopify:scheduled:${c.id}`, '1', 'EX', 3300, 'NX');
        if (set === 'OK') {
          await shopifyFeedQueue.add('shopify-feed', payload, { jobId: `sf_${c.id}_${now.getTime()}` });
        }
        continue;
      }

      if (c.dataTier === 'selected_products') {
        const syncSet = await connection.set(`catalog:scheduled:${c.id}`, '1', 'EX', 82_800, 'NX');
        if (syncSet === 'OK') {
          await shopifyFeedQueue.add('catalog-sync', payload, { jobId: `cs_${c.id}_${now.getTime()}` });
        }
        const rescanSet = await connection.set(`sitemap:scheduled:${c.id}`, '1', 'EX', 561_600, 'NX');
        if (rescanSet === 'OK') {
          await shopifyFeedQueue.add(
            'sitemap-rescan',
            { ...payload, mode: 'sitemap_rescan' as const },
            { jobId: `sr_${c.id}_${now.getTime()}` }
          );
        }
        continue;
      }

      // limited: weekly re-probe; the worker climbs the ladder and upgrades the tier if access improved
      const probeSet = await connection.set(`probe:scheduled:${c.id}`, '1', 'EX', 561_600, 'NX');
      if (probeSet === 'OK') {
        await shopifyFeedQueue.add('catalog-probe', payload, { jobId: `cp_${c.id}_${now.getTime()}` });
      }
    }

    await connection.set('scheduler:last_run', new Date().toISOString());
    await connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120);

    if (dueMonitors.length > 0) {
      logger.info({ service: 'scheduler', count: dueMonitors.length }, 'Enqueued check jobs');
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

// ─── Inline lifecycle email worker ────────────────────────────────────────────
// Web API routes enqueue lifecycle emails to this BullMQ queue. Rather than a
// dedicated process, the scheduler hosts the worker so we save the extra ~30 MB.
const lifecycleEmailWorker = new Worker<LifecycleEmailJob>(
  QUEUE_NAMES.LIFECYCLE_EMAIL,
  async (job) => {
    await processLifecycleEmailJob(job.data, connection);
  },
  { connection, concurrency: 2 }
);

lifecycleEmailWorker.on('failed', (job, err) => {
  logger.error({ service: 'scheduler', jobId: job?.id, emailType: job?.data.emailType, err }, 'Lifecycle email job failed');
  Sentry.captureException(err, { extra: { jobId: job?.id, emailType: job?.data.emailType } });
});

// ─── Main loop ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const usingPooled = !!process.env['DATABASE_URL_POOLED'];
  logger.info(
    { service: 'scheduler', connectionMode: usingPooled ? 'pooled (PgBouncer)' : 'direct' },
    'Scheduler started'
  );

  const lastRun = new Map<string, number>();

  for (const task of tasks) {
    lastRun.set(task.name, Date.now());
  }

  for (const task of tasks.filter((t) => t.runOnStartup)) {
    try {
      await task.run();
      lastRun.set(task.name, Date.now());
    } catch (err) {
      logger.error({ service: 'scheduler', task: task.name, err }, 'Startup task failed');
      Sentry.captureException(err);
    }
  }

  schedulerInterval = setInterval(() => {
    if (!running) return;

    void scheduleChecks();

    for (const task of tasks) {
      if (Date.now() - (lastRun.get(task.name) ?? 0) >= task.runIntervalMs) {
        lastRun.set(task.name, Date.now());
        void task.run().catch((err) => {
          logger.error({ service: 'scheduler', task: task.name, err }, 'Unhandled task error');
          Sentry.captureException(err);
        });
      }
    }
  }, 10_000);

  await scheduleChecks();
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
  await sloBurnQueue.close();
  await intelligenceDigestQueue.close();
  await shopifyFeedQueue.close();
  await competitorPageCheckQueue.close();
  await lifecycleEmailWorker.close();
  await prisma.$disconnect();
  await connection.quit();

  logger.info('Scheduler shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

void main();

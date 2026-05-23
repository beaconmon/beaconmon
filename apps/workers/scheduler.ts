import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('scheduler'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { prisma, statusPageWorkerRepository, checkResultRepository, incidentRepository, monitorRepository, deployEventRepository, sloRepository, contentSnapshotWorkerRepository, alertChannelRepository } from '@beaconmon/db';
import { createCheckQueue, createContentCheckQueue, createSloBurnQueue, createIntelligenceDigestQueue } from '@beaconmon/queue';
import { digestPrefsSchema } from '@beaconmon/types';
import { getEffectivePlan } from './lib/get-effective-plan.js';
import { PLAN_LIMITS, REGIONS } from '@beaconmon/types';
import { evaluateCheckResult } from '@beaconmon/checker';
import { TrialReminder } from './emails/trial-reminder.js';

const HEARTBEAT_KEY = 'worker:heartbeat:scheduler';
// Sentry cron monitor slug — create a matching monitor in your Sentry project
const SENTRY_MONITOR_SLUG = process.env['SENTRY_MONITOR_SLUG'] ?? 'beaconmon-scheduler';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const checkQueue = createCheckQueue(connection);
const contentQueue = createContentCheckQueue(connection);
const sloBurnQueue = createSloBurnQueue(connection);
const intelligenceDigestQueue = createIntelligenceDigestQueue(connection);

let running = true;
let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastUptimeCompute = 0;
let lastRetentionCleanup = 0;
let lastDeployExpiry = 0;
let lastSloBurnCheck = 0;
let lastPastDueCheck = 0;
let lastTrialReminderCheck = 0;
const UPTIME_COMPUTE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RETENTION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEPLOY_EXPIRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SLO_BURN_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute
const PAST_DUE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const TRIAL_REMINDER_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PAST_DUE_GRACE_DAYS = 10;

// Burn-rate alert windows
const SLO_FAST_BURN_WINDOW_MINUTES = 5;
const SLO_SLOW_BURN_WINDOW_MINUTES = 60;
// Cooldown: don't re-alert for same monitor+severity within this window
const SLO_BURN_ALERT_COOLDOWN_MINUTES = 30;

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
        isCompetitor: true,
        instantAlerts: true,
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
          `content:${monitor.id}:${now.getTime()}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            intervalSeconds: monitor.intervalSeconds,
            selector: (monitor.config as Record<string, unknown>)['selector'] as string | undefined,
            inMaintenance,
            isCompetitor: monitor.isCompetitor,
            instantAlerts: monitor.instantAlerts,
          }
        );
      } else {
        const planRegionCount = PLAN_LIMITS[effectivePlan].regions;
        const enabledRegions = REGIONS.slice(0, planRegionCount);
        const isHttpOrKeyword = monitor.type === 'http' || monitor.type === 'keyword';

        await checkQueue.add(
          `check:${monitor.id}:${now.getTime()}`,
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
          }
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
    // Pull trialEndsAt + subscription.status alongside team.plan so we can use
    // the *effective* plan (matches getEffectivePlan used elsewhere). Without
    // this, a team whose Pro/Business trial expired keeps the longer retention
    // window until the Freemius webhook eventually flips team.plan to 'free'.
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        plan: true,
        trialEndsAt: true,
        subscription: { select: { status: true } },
        monitors: { select: { id: true } },
      },
    });

    let totalDeleted = 0;

    for (const team of teams) {
      if (team.monitors.length === 0) continue;

      const effectivePlan = getEffectivePlan(team);
      const historyDays = PLAN_LIMITS[effectivePlan].historyDays;
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

  // Purge dedup table rows older than 90 days — keeps the table from growing unbounded.
  try {
    const webhookCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const deleted = await prisma.processedWebhookEvent.deleteMany({
      where: { processedAt: { lt: webhookCutoff } },
    });
    if (deleted.count > 0) {
      logger.info({ service: 'scheduler', deleted: deleted.count }, 'Purged old processed_webhook_events');
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'processed_webhook_events purge failed');
  }
}

// Per-plan snapshot retention for content monitors.
// Free → 3, Starter → 10, Growth → 30, Scale → 90.
const SNAPSHOT_RETENTION_BY_PLAN: Record<keyof typeof PLAN_LIMITS, number> = {
  free: 3,
  starter: 10,
  growth: 30,
  scale: 90,
};

/**
 * Drop content snapshots beyond each team's plan-allowed retention count.
 * Runs alongside daily retention cleanup.
 */
async function runContentSnapshotRetention(): Promise<void> {
  try {
    const monitors = await contentSnapshotWorkerRepository.findContentMonitorsWithTeamPlan();
    if (monitors.length === 0) return;

    let totalDeleted = 0;

    for (const m of monitors) {
      const effectivePlan = getEffectivePlan({
        plan: m.plan,
        trialEndsAt: m.trialEndsAt,
        subscription: m.subscriptionStatus ? { status: m.subscriptionStatus } : null,
      });
      const keep = SNAPSHOT_RETENTION_BY_PLAN[effectivePlan];

      const deleted = await contentSnapshotWorkerRepository.pruneToLimit(m.monitorId, keep);
      totalDeleted += deleted;
    }

    logger.info({ service: 'scheduler', totalDeleted }, 'Content snapshot retention complete');
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Content snapshot retention failed');
    Sentry.captureException(err);
  }
}

const DEPLOY_AUTO_EXPIRE_MINUTES = 30;

/**
 * Auto-expire deploy events that were started more than 30 minutes ago but never ended.
 * Safety net so forgotten deploys don't suppress alerts indefinitely.
 * Runs alongside daily retention cleanup.
 */
async function expireStaleDeployEvents(): Promise<void> {
  try {
    const expired = await deployEventRepository.expireStaleDeployEvents(DEPLOY_AUTO_EXPIRE_MINUTES);
    if (expired > 0) {
      logger.info({ service: 'scheduler', expired }, 'Auto-expired stale deploy events');
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Failed to expire stale deploy events');
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

/**
 * Evaluate SLO burn rates for all monitors with SLO targets.
 * Checks both fast-burn (5-min window) and slow-burn (1-hour window).
 * Uses Redis cooldown keys to avoid duplicate alerts.
 */
async function evaluateSloBurnRates(): Promise<void> {
  try {
    const monitors = await sloRepository.findMonitorsWithSlo();
    if (monitors.length === 0) return;

    let alertCount = 0;

    for (const monitor of monitors) {
      // Fast burn check (5-min window)
      const fast = await sloRepository.computeShortWindowBurnRate(
        monitor.id,
        monitor.sloTarget,
        SLO_FAST_BURN_WINDOW_MINUTES
      );

      if (fast.totalChecks >= 2 && fast.burnRate > monitor.sloBurnRateFastThreshold) {
        const cooldownKey = `slo:burn:cooldown:${monitor.id}:fast`;
        const cooled = await connection.get(cooldownKey);
        if (!cooled) {
          // Fetch full-window metrics for the alert payload
          const metrics = await sloRepository.computeMetrics(
            monitor.id,
            monitor.sloTarget,
            monitor.sloWindowDays
          );
          await sloBurnQueue.add(`slo-burn:${monitor.id}:fast`, {
            monitorId: monitor.id,
            teamId: monitor.teamId,
            burnRate: fast.burnRate,
            severity: 'fast',
            uptimePercent: metrics.uptimePercent,
            errorBudgetRemainingMinutes: metrics.errorBudgetRemainingMinutes,
            windowDays: monitor.sloWindowDays,
          });
          await connection.set(cooldownKey, '1', 'EX', SLO_BURN_ALERT_COOLDOWN_MINUTES * 60);
          alertCount++;
          logger.warn(
            { service: 'scheduler', monitorId: monitor.id, burnRate: fast.burnRate, severity: 'fast' },
            'SLO fast-burn threshold exceeded'
          );
        }
      }

      // Slow burn check (1-hour window)
      const slow = await sloRepository.computeShortWindowBurnRate(
        monitor.id,
        monitor.sloTarget,
        SLO_SLOW_BURN_WINDOW_MINUTES
      );

      if (slow.totalChecks >= 5 && slow.burnRate > monitor.sloBurnRateSlowThreshold) {
        const cooldownKey = `slo:burn:cooldown:${monitor.id}:slow`;
        const cooled = await connection.get(cooldownKey);
        if (!cooled) {
          const metrics = await sloRepository.computeMetrics(
            monitor.id,
            monitor.sloTarget,
            monitor.sloWindowDays
          );
          await sloBurnQueue.add(`slo-burn:${monitor.id}:slow`, {
            monitorId: monitor.id,
            teamId: monitor.teamId,
            burnRate: slow.burnRate,
            severity: 'slow',
            uptimePercent: metrics.uptimePercent,
            errorBudgetRemainingMinutes: metrics.errorBudgetRemainingMinutes,
            windowDays: monitor.sloWindowDays,
          });
          await connection.set(cooldownKey, '1', 'EX', SLO_BURN_ALERT_COOLDOWN_MINUTES * 60);
          alertCount++;
          logger.warn(
            { service: 'scheduler', monitorId: monitor.id, burnRate: slow.burnRate, severity: 'slow' },
            'SLO slow-burn threshold exceeded'
          );
        }
      }
    }

    if (alertCount > 0) {
      logger.info({ service: 'scheduler', alertCount }, 'SLO burn-rate alerts enqueued');
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'SLO burn-rate evaluation failed');
    Sentry.captureException(err);
  }
}

const DAILY_DIGEST_HOUR_UTC = 7;
const DAILY_DIGEST_REDIS_KEY = 'scheduler:intelligence_digest:daily_last_run';
const WEEKLY_DIGEST_REDIS_KEY = 'scheduler:intelligence_digest:weekly_last_run';

function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Enqueue intelligence digest jobs for teams that have configured digest preferences.
 * Daily digest: every day at 7:00 UTC (growth/scale only).
 * Weekly digest: every Monday at 7:00 UTC (starter/growth/scale).
 */
async function maybeEnqueueIntelligenceDigests(): Promise<void> {
  const now = new Date();
  if (now.getUTCHours() < DAILY_DIGEST_HOUR_UTC) return;

  const todayKey = now.toISOString().slice(0, 10);
  const weekKey = getIsoWeekKey(now);
  const isMonday = now.getUTCDay() === 1;

  const dailyDone = await connection.get(DAILY_DIGEST_REDIS_KEY);
  const weeklyDone = isMonday ? await connection.get(WEEKLY_DIGEST_REDIS_KEY) : weekKey;
  const runDaily = dailyDone !== todayKey;
  const runWeekly = isMonday && weeklyDone !== weekKey;

  if (!runDaily && !runWeekly) return;

  try {
    const allTeams = await prisma.team.findMany({
      select: {
        id: true,
        plan: true,
        trialEndsAt: true,
        digestPrefs: true,
        subscription: { select: { status: true } },
      },
    });
    const teams = allTeams.filter((t) => t.digestPrefs !== null);

    if (teams.length === 0) {
      if (runDaily) await connection.set(DAILY_DIGEST_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
      if (runWeekly) await connection.set(WEEKLY_DIGEST_REDIS_KEY, weekKey, 'EX', 60 * 60 * 24 * 8);
      return;
    }

    const windowEnd = now.toISOString();
    let dailyEnqueued = 0;
    let weeklyEnqueued = 0;

    for (const team of teams) {
      const effectivePlan = getEffectivePlan(team);
      if (effectivePlan === 'free') continue;

      const prefs = digestPrefsSchema.safeParse(team.digestPrefs ?? {});
      if (!prefs.success || !prefs.data.frequency) continue;
      const freq = prefs.data.frequency;

      if (runDaily && effectivePlan !== 'starter' && (freq === 'daily' || freq === 'both')) {
        const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const jobId = `digest:daily:${team.id}:${todayKey}`;
        await intelligenceDigestQueue.add(
          jobId,
          { teamId: team.id, frequency: 'daily', windowStart, windowEnd },
          { jobId }
        );
        dailyEnqueued++;
      }

      if (runWeekly && (freq === 'weekly' || freq === 'both')) {
        const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const jobId = `digest:weekly:${team.id}:${weekKey}`;
        await intelligenceDigestQueue.add(
          jobId,
          { teamId: team.id, frequency: 'weekly', windowStart, windowEnd },
          { jobId }
        );
        weeklyEnqueued++;
      }
    }

    if (runDaily) await connection.set(DAILY_DIGEST_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
    if (runWeekly) await connection.set(WEEKLY_DIGEST_REDIS_KEY, weekKey, 'EX', 60 * 60 * 24 * 8);
    logger.info({ service: 'scheduler', dailyEnqueued, weeklyEnqueued }, 'Intelligence digest jobs enqueued');
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Failed to enqueue intelligence digest jobs');
    Sentry.captureException(err);
  }
}

/**
 * Downgrade teams whose subscription has been past_due for more than PAST_DUE_GRACE_DAYS.
 * Mirrors the subscription.canceled webhook handler: sets plan = 'free', disables surplus channels.
 */
async function runPastDueDowngrade(): Promise<void> {
  const cutoff = new Date(Date.now() - PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000);

  try {
    const overdue = await prisma.subscription.findMany({
      where: { status: 'past_due', updatedAt: { lt: cutoff } },
      select: { id: true, teamId: true },
    });

    if (overdue.length === 0) return;

    for (const sub of overdue) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'canceled', plan: 'free' },
        }),
        prisma.team.update({
          where: { id: sub.teamId },
          data: { plan: 'free' },
        }),
      ]);

      await alertChannelRepository.disableSurplusForPlan(sub.teamId, 'free');

      logger.info(
        { service: 'scheduler', teamId: sub.teamId, subscriptionId: sub.id },
        'past_due subscription auto-downgraded to free after grace period'
      );
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'past_due downgrade job failed');
    Sentry.captureException(err);
  }
}

const TRIAL_REMINDER_REDIS_KEY = 'scheduler:trial_reminder:last_run';

/**
 * Send trial expiry reminder emails to teams whose trial ends in 7 days or 1 day.
 * Uses Redis dedup keys to avoid sending the same email twice.
 * Only runs once per day (guarded by a Redis key).
 */
async function sendTrialReminderEmails(): Promise<void> {
  const resendApiKey = env.RESEND_API_KEY;
  const emailFrom = process.env['EMAIL_FROM'];
  const appUrl = process.env['BETTER_AUTH_URL'] ?? '';

  if (!resendApiKey || !emailFrom) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const lastRun = await connection.get(TRIAL_REMINDER_REDIS_KEY);
  if (lastRun === todayKey) return;

  try {
    const now = new Date();
    const window7Start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const window7End = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    const window1Start = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const window1End = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const teams = await prisma.team.findMany({
      where: {
        plan: 'free',
        trialEndsAt: { not: null },
        subscription: null,
      },
      select: {
        id: true,
        trialEndsAt: true,
        members: {
          where: { role: 'owner' },
          select: { user: { select: { email: true } } },
          take: 1,
        },
      },
    });

    const resend = new Resend(resendApiKey);
    let sent = 0;

    for (const team of teams) {
      if (!team.trialEndsAt) continue;
      const ownerEmail = team.members[0]?.user.email;
      if (!ownerEmail) continue;

      const trialEnds = team.trialEndsAt.getTime();
      let daysLeft: number | null = null;
      let dedupKey: string | null = null;

      if (trialEnds >= window7Start.getTime() && trialEnds < window7End.getTime()) {
        daysLeft = 7;
        dedupKey = `trial:reminder:7d:${team.id}`;
      } else if (trialEnds >= window1Start.getTime() && trialEnds < window1End.getTime()) {
        daysLeft = 1;
        dedupKey = `trial:reminder:1d:${team.id}`;
      }

      if (!daysLeft || !dedupKey) continue;

      const alreadySent = await connection.get(dedupKey);
      if (alreadySent) continue;

      const html = await render(React.createElement(TrialReminder, { daysLeft, appUrl }));
      const { error } = await resend.emails.send({
        from: emailFrom,
        to: ownerEmail,
        subject: daysLeft <= 1
          ? 'Your Beaconmon trial ends tomorrow'
          : `${daysLeft} days left in your Beaconmon trial`,
        html,
      });

      if (error) {
        logger.error({ service: 'scheduler', teamId: team.id, err: error }, 'Trial reminder email failed');
        continue;
      }

      await connection.set(dedupKey, '1', 'EX', 60 * 60 * 24 * 10); // 10-day TTL
      sent++;
    }

    await connection.set(TRIAL_REMINDER_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
    if (sent > 0) {
      logger.info({ service: 'scheduler', sent }, 'Trial reminder emails sent');
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Trial reminder email job failed');
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
  await runContentSnapshotRetention();
  await expireStaleDeployEvents();
  lastPastDueCheck = Date.now();
  await runPastDueDowngrade();
  lastTrialReminderCheck = Date.now();
  await sendTrialReminderEmails();

  // Poll every 10 seconds — fine-grained enough for 30s monitors
  schedulerInterval = setInterval(() => {
    if (!running) return;
    void scheduleChecks();

    if (Date.now() - lastUptimeCompute >= UPTIME_COMPUTE_INTERVAL_MS) {
      lastUptimeCompute = Date.now();
      void computeUptimePercentages();
    }

    if (Date.now() - lastDeployExpiry >= DEPLOY_EXPIRY_INTERVAL_MS) {
      lastDeployExpiry = Date.now();
      void expireStaleDeployEvents();
    }

    if (Date.now() - lastSloBurnCheck >= SLO_BURN_CHECK_INTERVAL_MS) {
      lastSloBurnCheck = Date.now();
      void evaluateSloBurnRates();
    }

    if (Date.now() - lastRetentionCleanup >= RETENTION_CLEANUP_INTERVAL_MS) {
      lastRetentionCleanup = Date.now();
      void purgeOldPartitions();
      void runRetentionCleanup();
      void runContentSnapshotRetention();
      void expireStaleDeployEvents();
    }

    if (Date.now() - lastPastDueCheck >= PAST_DUE_CHECK_INTERVAL_MS) {
      lastPastDueCheck = Date.now();
      void runPastDueDowngrade();
    }

    if (Date.now() - lastTrialReminderCheck >= TRIAL_REMINDER_CHECK_INTERVAL_MS) {
      lastTrialReminderCheck = Date.now();
      void sendTrialReminderEmails();
    }

    void maybeEnqueueIntelligenceDigests();
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
  await sloBurnQueue.close();
  await intelligenceDigestQueue.close();
  await prisma.$disconnect();
  await connection.quit();

  logger.info('Scheduler shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

void main();

import { logger } from './lib/logger.js';
import type { Queue } from 'bullmq';
import type { CheckJob, AlertJob } from '@beaconmon/queue';
import {
  runHttpCheck,
  runSslCheck,
  runTcpCheck,
  runDomainCheck,
  evaluateCheckResult,
  type CheckInput,
} from '@beaconmon/checker';
import {
  monitorRepository,
  checkResultRepository,
  incidentRepository,
  expiryAlertRepository,
  statusPageWorkerRepository,
} from '@beaconmon/db';
import { assembleStatusPageCacheData } from '@beaconmon/types';
import type { Redis } from 'ioredis';

const EXPIRY_THRESHOLDS = [7, 14, 30] as const;

export async function processCheckJob(
  job: CheckJob,
  alertQueue: Queue<AlertJob>,
  redis?: Redis
): Promise<void> {
  const { monitorId, type, url, timeoutMs, intervalSeconds } = job;
  const service = 'check-worker';

  // 1. Load monitor state from DB
  const monitor = await monitorRepository.findById(monitorId);
  if (!monitor) {
    logger.warn({ service, monitorId }, 'Monitor not found, skipping check');
    return;
  }

  const checkInput: CheckInput = {
    monitorId,
    url,
    type: type as CheckInput['type'],
    timeoutMs,
    intervalSeconds,
  };

  // 2. Run check
  let result;
  switch (type) {
    case 'http':
    case 'keyword':
      result = await runHttpCheck(checkInput);
      break;
    case 'ssl':
      result = await runSslCheck(checkInput);
      break;
    case 'tcp':
      result = await runTcpCheck(checkInput);
      break;
    case 'domain':
      result = await runDomainCheck(checkInput);
      break;
    default:
      logger.error({ service, monitorId, type }, 'Unknown check type');
      return;
  }

  logger.info(
    {
      service,
      monitorId,
      success: result.success,
      responseTimeMs: result.responseTimeMs,
      errorType: result.errorType,
    },
    'Check completed'
  );

  // 3. Persist check result — abort status evaluation if this fails (no audit trail)
  try {
    await checkResultRepository.create(result);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to persist check result, aborting status evaluation');
    return;
  }

  // 4. Branch on monitor type
  if (type === 'ssl' || type === 'domain') {
    // ── EXPIRY ALERT PATH ──────────────────────────────────────────────────────
    const sslResult = result as typeof result & { sslDetail?: { daysRemaining: number } };
    const domainResult = result as typeof result & { domainDetail?: { daysRemaining: number } };
    const daysRemaining =
      sslResult.sslDetail?.daysRemaining ?? domainResult.domainDetail?.daysRemaining;

    if (daysRemaining == null) return;

    const threshold = EXPIRY_THRESHOLDS.find((t) => daysRemaining <= t) ?? null;
    if (threshold == null) return;

    try {
      const existing = await expiryAlertRepository.findByMonitorAndThreshold(
        monitorId,
        threshold
      );
      if (!existing) {
        await expiryAlertRepository.create({
          teamId: monitor.teamId,
          monitorId,
          type: type as 'ssl' | 'domain',
          daysRemaining,
          threshold,
        });
        logger.info(
          { service, monitorId, type, daysRemaining, threshold },
          'Expiry alert created'
        );
      }
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to process expiry alert');
    }
  } else {
    // ── INCIDENT PATH (http, tcp, keyword) ────────────────────────────────────
    const evaluation = evaluateCheckResult(
      result.success,
      monitor.currentStatus,
      monitor.consecutiveFailures
    );

    // Update monitor state first — if this fails, skip incident management
    // to prevent stale consecutiveFailures from triggering duplicate incidents
    try {
      await monitorRepository.updateAfterCheck(monitorId, {
        currentStatus: evaluation.status,
        consecutiveFailures: evaluation.consecutiveFailures,
        lastCheckedAt: result.checkedAt,
      });
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to update monitor after check, skipping incident management');
      return;
    }

    if (evaluation.becameDown) {
      try {
        const incident = await incidentRepository.create({
          monitorId,
          teamId: monitor.teamId,
          startedAt: result.checkedAt,
        });
        await alertQueue.add(
          `alert:down:${monitorId}`,
          {
            incidentId: incident.id,
            monitorId,
            teamId: monitor.teamId,
            type: 'down',
          },
          { jobId: `alert:down:${incident.id}` }
        );
        logger.info(
          { service, monitorId, incidentId: incident.id },
          'Incident created, alert enqueued'
        );
      } catch (err) {
        logger.error(
          { service, monitorId, err },
          'Failed to create incident or enqueue down alert'
        );
      }
    }

    if (evaluation.becameUp) {
      try {
        const openIncident = await incidentRepository.findOpenByMonitorId(monitorId);
        if (openIncident) {
          const resolved = await incidentRepository.resolve(openIncident.id, {
            resolvedAt: result.checkedAt,
            resolutionType: 'automatic',
          });
          const durationMs =
            resolved.resolvedAt && resolved.startedAt
              ? resolved.resolvedAt.getTime() - resolved.startedAt.getTime()
              : undefined;
          await alertQueue.add(
            `alert:up:${monitorId}`,
            {
              incidentId: resolved.id,
              monitorId,
              teamId: monitor.teamId,
              type: 'up',
              durationMs,
            },
            { jobId: `alert:up:${resolved.id}` }
          );
          logger.info(
            { service, monitorId, incidentId: resolved.id, durationMs },
            'Incident resolved, recovery alert enqueued'
          );
        } else {
          logger.warn(
            { service, monitorId },
            'Recovery: no open incident found, skipping alert'
          );
        }
      } catch (err) {
        logger.error(
          { service, monitorId, err },
          'Failed to resolve incident or enqueue up alert'
        );
      }
    }

    // Warm status page cache on any status transition
    if ((evaluation.becameDown || evaluation.becameUp) && redis) {
      try {
        const slugs = await statusPageWorkerRepository.findStatusPageSlugsForMonitor(monitorId);
        for (const slug of slugs) {
          await warmStatusPageCache(slug, redis);
        }
      } catch (err) {
        logger.warn({ service, monitorId, err }, 'Failed to warm status page cache');
      }
    }
  }
}

/**
 * Inline cache warming — fetches fresh DB data, reads uptime from Redis,
 * and writes assembled StatusPageCacheData to Redis with 5-min TTL.
 * Inlined here because workers cannot import from apps/web.
 */
async function warmStatusPageCache(slug: string, redis: Redis): Promise<void> {
  const dbData = await statusPageWorkerRepository.findStatusPageDataBySlug(slug);
  if (!dbData) return;

  const monitorIds = dbData.monitors.map((spm) => spm.monitor.id);
  let uptimeMap: Record<string, number> = {};

  if (monitorIds.length > 0) {
    try {
      const values = await redis.hmget('uptime:90d', ...monitorIds);
      for (let i = 0; i < monitorIds.length; i++) {
        const id = monitorIds[i]!;
        const val = values[i];
        uptimeMap[id] = val != null ? parseFloat(val) : 100;
      }
    } catch {
      // Redis unavailable — default uptime values
    }
  }

  const data = assembleStatusPageCacheData(dbData, uptimeMap);
  await redis.set(`statuspage:${slug}`, JSON.stringify(data), 'EX', 300);
}

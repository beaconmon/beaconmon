import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import type { Queue } from 'bullmq';
import type { CheckJob, AlertJob, EscalationStepJob } from '@beaconmon/queue';
import {
  runHttpCheck,
  runSslCheck,
  runTcpCheck,
  runDomainCheck,
  type CheckInput,
} from '@beaconmon/checker';
import {
  monitorRepository,
  checkResultRepository,
  alertChannelRepository,
  performanceAlertRepository,
  type MonitorForCheck,
} from '@beaconmon/db';
import type { Redis } from 'ioredis';
import type { CheckResult, ProbeRegion, CheckErrorType, MonitorType } from '@beaconmon/types';
import { REGION_ENV_VAR } from '@beaconmon/types';
import { processExpiryCheck } from './process-expiry-check.js';
import { processIncidentCheck, processMultiRegionIncidentCheck } from './process-incident-check.js';
import { getChannelSender } from './lib/channels/index.js';

// ─── Region probe types ───────────────────────────────────────────────────────

interface RegionProbeResponse {
  region: ProbeRegion;
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
}

// ─── Fan-out helper ───────────────────────────────────────────────────────────

async function fanOutToRegions(
  job: CheckJob,
  monitor: MonitorForCheck,
  regions: ProbeRegion[],
  secret: string
): Promise<RegionProbeResponse[]> {
  const results = await Promise.all(
    regions.map(async (region): Promise<RegionProbeResponse | null> => {
      const urlEnvVar = REGION_ENV_VAR[region];
      const probeUrl = env[urlEnvVar as keyof typeof env] as string | undefined;

      if (!probeUrl) {
        logger.warn(
          { service: 'check-worker', monitorId: job.monitorId, region, envVar: urlEnvVar },
          'CF probe URL not configured — excluding region from evaluation'
        );
        return null;
      }

      try {
        const response = await fetch(probeUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            monitorId: job.monitorId,
            url: job.url,
            type: job.type,
            timeoutMs: job.timeoutMs,
            keyword: monitor.keyword ?? undefined,
            keywordCondition: monitor.keywordCondition ?? undefined,
          }),
          signal: AbortSignal.timeout(job.timeoutMs + 5000), // probe timeout + 5s network headroom
        });

        const body = await response.json() as Record<string, unknown>;
        if (typeof body?.success !== 'boolean') {
          throw new Error(`Invalid probe response: missing 'success' field (got ${JSON.stringify(body)})`);
        }

        return {
          region,
          success: body.success as boolean,
          statusCode: body.statusCode as number | null,
          responseTimeMs: body.responseTimeMs as number | null,
          errorType: body.errorType as string | null,
          errorMessage: body.errorMessage as string | null,
        };
      } catch (err) {
        logger.error(
          { service: 'check-worker', monitorId: job.monitorId, region, err },
          'Failed to reach CF probe — treating region as failure'
        );
        return {
          region,
          success: false,
          statusCode: null,
          responseTimeMs: null,
          errorType: 'unknown',
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );
  return results.filter((r): r is RegionProbeResponse => r !== null);
}

function probeToCheckResult(
  probe: RegionProbeResponse,
  monitorId: string,
  type: string,
  checkedAt: Date
): CheckResult {
  return {
    monitorId,
    checkedAt,
    success: probe.success,
    statusCode: probe.statusCode,
    responseTimeMs: probe.responseTimeMs,
    errorType: probe.errorType as CheckErrorType | null,
    errorMessage: probe.errorMessage,
    type: type as MonitorType,
    region: probe.region,
  };
}

// ─── Anomaly detection ────────────────────────────────────────────────────────

const ANOMALY_MIN_SAMPLES = 30;
const ANOMALY_Z_THRESHOLD = 3.0;
const ANOMALY_COOLDOWN_MINUTES = 30;
const ANOMALY_WINDOW_HOURS = 24;

/**
 * Z-score anomaly detection over a 24-hour rolling window.
 * Fires at most once per 30 minutes per monitor.
 * Creates a performance_alert row and sends via all team alert channels (no incident).
 */
async function checkForAnomaly(
  monitor: MonitorForCheck,
  responseTimeMs: number,
  checkedAt: Date
): Promise<void> {
  const service = 'check-worker';
  const { id: monitorId, teamId } = monitor;

  // Fetch recent response times
  const since = new Date(checkedAt.getTime() - ANOMALY_WINDOW_HOURS * 60 * 60 * 1000);
  let samples: number[];
  try {
    samples = await performanceAlertRepository.getRecentResponseTimes(monitorId, since);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Anomaly: failed to fetch recent response times');
    return;
  }

  if (samples.length < ANOMALY_MIN_SAMPLES) return; // not enough data

  const n = samples.length;
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return; // all samples identical

  const zScore = (responseTimeMs - mean) / stdDev;
  if (zScore <= ANOMALY_Z_THRESHOLD) return; // within normal range

  // Cooldown: skip if a notification was sent in the last 30 minutes
  try {
    const last = await performanceAlertRepository.findLastNotified(monitorId);
    if (last?.notifiedAt) {
      const elapsed = checkedAt.getTime() - last.notifiedAt.getTime();
      if (elapsed < ANOMALY_COOLDOWN_MINUTES * 60_000) return;
    }
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Anomaly: failed to check cooldown');
    return;
  }

  // Persist the alert
  const alertId = crypto.randomUUID();
  try {
    await performanceAlertRepository.create({
      id: alertId,
      teamId,
      monitorId,
      checkedAt,
      responseTimeMs,
      meanMs: mean,
      stdDevMs: stdDev,
      zScore,
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Anomaly: failed to persist performance_alert');
    return;
  }

  // Send via all active team alert channels (no incident)
  try {
    const channels = await alertChannelRepository.findActiveByTeamId(teamId);
    for (const channel of channels) {
      try {
        const sender = getChannelSender(channel.type);
        await sender(channel.config as Record<string, unknown>, {
          monitor: { id: monitor.id, name: monitor.name, url: monitor.url },
          incident: { id: alertId, startedAt: checkedAt },
          type: 'slow',
          durationMs: responseTimeMs,
        });
      } catch (err) {
        logger.error({ service, monitorId, channelId: channel.id, err }, 'Anomaly: channel send failed');
      }
    }
    await performanceAlertRepository.markNotified(alertId, checkedAt);
    logger.info(
      { service, monitorId, zScore: zScore.toFixed(2), responseTimeMs, mean: mean.toFixed(0) },
      'Anomaly detected — performance alert sent'
    );
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Anomaly: failed to send alerts');
  }
}

// ─── Main processor ───────────────────────────────────────────────────────────

export async function processCheckJob(
  job: CheckJob,
  alertQueue: Queue<AlertJob>,
  redis?: Redis,
  escalationQueue?: Queue<EscalationStepJob>
): Promise<void> {
  const { monitorId, type, url, timeoutMs, intervalSeconds } = job;
  const service = 'check-worker';

  // 1. Load monitor state from DB
  const monitor = await monitorRepository.findById(monitorId);
  if (!monitor) {
    logger.warn({ service, monitorId }, 'Monitor not found, skipping check');
    return;
  }

  const multiRegion =
    env.FEATURE_MULTI_LOCATION &&
    (type === 'http' || type === 'keyword') &&
    !!job.regions &&
    job.regions.length > 0 &&
    !!env.REGION_PROBE_SECRET;

  // ─── Multi-region path (FEATURE_MULTI_LOCATION=true, http/keyword only) ─────
  if (multiRegion) {
    const regions = job.regions!;
    const probeResults = await fanOutToRegions(job, monitor, regions, env.REGION_PROBE_SECRET!);
    const checkedAt = new Date();

    // Write all regional results to DB (with maintenance flag)
    for (const probe of probeResults) {
      const result: CheckResult = {
        ...probeToCheckResult(probe, monitorId, type, checkedAt),
        maintenance: job.inMaintenance ?? false,
      };
      try {
        await checkResultRepository.create(result);
      } catch (err) {
        logger.error({ service, monitorId, region: probe.region, err }, 'Failed to persist region check result');
      }
    }

    logger.info(
      {
        service,
        monitorId,
        regions: regions.length,
        failures: probeResults.filter((r) => !r.success).length,
        maintenance: job.inMaintenance ?? false,
      },
      'Multi-region check completed'
    );

    // During maintenance: skip incident evaluation and alerts
    if (job.inMaintenance) {
      logger.info({ service, monitorId }, 'Monitor in maintenance window — skipping alert evaluation');
      return;
    }

    if (regions.length > 1) {
      // Pro/Business: multi-region incident logic (≥2 failures → incident)
      await processMultiRegionIncidentCheck(
        { monitorId, type, monitor, checkedAt },
        probeResults,
        alertQueue,
        redis,
        escalationQueue
      );
    } else {
      // Free plan: single CF region — use existing consecutive-failures logic
      const singleResult = probeToCheckResult(probeResults[0]!, monitorId, type, checkedAt);
      const ctx = { monitorId, type, monitor, result: singleResult };
      await processIncidentCheck(ctx, alertQueue, redis, escalationQueue);
    }

    return;
  }

  // ─── Railway-local path (feature off, SSL/TCP/domain, or no regions) ─────────
  const checkInput: CheckInput = {
    monitorId,
    url,
    type: type as CheckInput['type'],
    timeoutMs,
    intervalSeconds,
    keyword: job.keyword,
    keywordCondition: job.keywordCondition,
  };

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

  // Add region: null for Railway-local checks; propagate maintenance flag
  const resultWithRegion: CheckResult = {
    ...result,
    region: null,
    maintenance: job.inMaintenance ?? false,
  };

  logger.info(
    {
      service,
      monitorId,
      success: resultWithRegion.success,
      responseTimeMs: resultWithRegion.responseTimeMs,
      errorType: resultWithRegion.errorType,
      maintenance: resultWithRegion.maintenance,
    },
    'Check completed'
  );

  try {
    await checkResultRepository.create(resultWithRegion);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to persist check result, aborting status evaluation');
    return;
  }

  // During maintenance: record the result but skip incident evaluation and alerts
  if (job.inMaintenance) {
    logger.info({ service, monitorId }, 'Monitor in maintenance window — skipping alert evaluation');
    return;
  }

  // Anomaly detection: runs after result is persisted, only for HTTP/keyword monitors
  if (
    monitor.anomalyDetectionEnabled &&
    resultWithRegion.success &&
    resultWithRegion.responseTimeMs != null &&
    (type === 'http' || type === 'keyword')
  ) {
    await checkForAnomaly(monitor, resultWithRegion.responseTimeMs, resultWithRegion.checkedAt);
  }

  const ctx = { monitorId, type, monitor, result: resultWithRegion };

  if (type === 'ssl' || type === 'domain') {
    await processExpiryCheck(ctx);
  } else {
    await processIncidentCheck(ctx, alertQueue, redis, escalationQueue);
  }
}

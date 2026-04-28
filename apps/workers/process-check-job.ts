import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import type { Queue } from 'bullmq';
import type { CheckJob, AlertJob } from '@beaconmon/queue';
import {
  runHttpCheck,
  runSslCheck,
  runTcpCheck,
  runDomainCheck,
  type CheckInput,
} from '@beaconmon/checker';
import { monitorRepository, checkResultRepository, type MonitorForCheck } from '@beaconmon/db';
import type { Redis } from 'ioredis';
import type { CheckResult, ProbeRegion, CheckErrorType, MonitorType } from '@beaconmon/types';
import { REGION_ENV_VAR } from '@beaconmon/types';
import { processExpiryCheck } from './process-expiry-check.js';
import { processIncidentCheck, processMultiRegionIncidentCheck } from './process-incident-check.js';

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

// ─── Main processor ───────────────────────────────────────────────────────────

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

    // Write all regional results to DB
    for (const probe of probeResults) {
      const result = probeToCheckResult(probe, monitorId, type, checkedAt);
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
      },
      'Multi-region check completed'
    );

    if (regions.length > 1) {
      // Pro/Business: multi-region incident logic (≥2 failures → incident)
      await processMultiRegionIncidentCheck(
        { monitorId, type, monitor, checkedAt },
        probeResults,
        alertQueue,
        redis
      );
    } else {
      // Free plan: single CF region — use existing consecutive-failures logic
      const singleResult = probeToCheckResult(probeResults[0]!, monitorId, type, checkedAt);
      const ctx = { monitorId, type, monitor, result: singleResult };
      await processIncidentCheck(ctx, alertQueue, redis);
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

  // Add region: null for Railway-local checks
  const resultWithRegion: CheckResult = { ...result, region: null };

  logger.info(
    {
      service,
      monitorId,
      success: resultWithRegion.success,
      responseTimeMs: resultWithRegion.responseTimeMs,
      errorType: resultWithRegion.errorType,
    },
    'Check completed'
  );

  try {
    await checkResultRepository.create(resultWithRegion);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to persist check result, aborting status evaluation');
    return;
  }

  const ctx = { monitorId, type, monitor, result: resultWithRegion };

  if (type === 'ssl' || type === 'domain') {
    await processExpiryCheck(ctx);
  } else {
    await processIncidentCheck(ctx, alertQueue, redis);
  }
}

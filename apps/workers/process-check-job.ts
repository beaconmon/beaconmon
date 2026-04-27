import { logger } from './lib/logger.js';
import type { Queue } from 'bullmq';
import type { CheckJob, AlertJob } from '@beaconmon/queue';
import {
  runHttpCheck,
  runSslCheck,
  runTcpCheck,
  runDomainCheck,
  type CheckInput,
} from '@beaconmon/checker';
import { monitorRepository, checkResultRepository } from '@beaconmon/db';
import type { Redis } from 'ioredis';
import { processExpiryCheck } from './process-expiry-check.js';
import { processIncidentCheck } from './process-incident-check.js';

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

  const ctx = { monitorId, type, monitor, result };

  // 4. Branch on monitor type
  if (type === 'ssl' || type === 'domain') {
    await processExpiryCheck(ctx);
  } else {
    await processIncidentCheck(ctx, alertQueue, redis);
  }
}

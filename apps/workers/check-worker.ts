import './lib/env.js'; // validates env at startup
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
import { QUEUE_NAMES } from '@beaconmon/queue';
import type { CheckJob } from '@beaconmon/queue';
import { runHttpCheck, runSslCheck, runTcpCheck, type CheckInput } from '@beaconmon/checker';
import { prisma } from '@beaconmon/db';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker<CheckJob>(
  QUEUE_NAMES.CHECK_SCHEDULED,
  async (job) => {
    const { monitorId, type, url, timeoutMs, intervalSeconds } = job.data;
    logger.info({ service: 'check-worker', monitorId, type, url }, 'Processing check job');

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
        // TODO: implement WHOIS-based domain expiry check
        logger.warn({ monitorId }, 'Domain check not yet implemented');
        return;
      default:
        logger.error({ monitorId, type }, 'Unknown check type');
        return;
    }

    logger.info(
      {
        service: 'check-worker',
        monitorId,
        success: result.success,
        responseTimeMs: result.responseTimeMs,
        errorType: result.errorType,
      },
      'Check completed'
    );

    // TODO: persist result, evaluate status transition, enqueue alert if needed
    void result;
    void intervalSeconds;
  },
  {
    connection,
    concurrency: 50,
  }
);

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'check-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Check job failed'
  );
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, draining worker');

  await worker.pause();

  // Wait up to 10 seconds for in-flight jobs to finish
  const drainTimeout = setTimeout(() => {
    logger.warn('Drain timeout reached, forcing shutdown');
    void forceShutdown();
  }, 10_000);

  await worker.close();
  clearTimeout(drainTimeout);

  await prisma.$disconnect();
  await connection.quit();

  logger.info('Worker shutdown complete');
  process.exit(0);
};

const forceShutdown = async () => {
  await prisma.$disconnect().catch(() => {});
  await connection.quit().catch(() => {});
  process.exit(1);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

logger.info({ service: 'check-worker', concurrency: 50 }, 'Check worker started');

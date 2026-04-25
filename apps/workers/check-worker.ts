import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('check-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
import { QUEUE_NAMES, createAlertQueue } from '@beaconmon/queue';
import type { CheckJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processCheckJob } from './process-check-job.js';

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_KEY = 'worker:heartbeat:check';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const alertQueue = createAlertQueue(connection);

const worker = new Worker<CheckJob>(
  QUEUE_NAMES.CHECK_SCHEDULED,
  async (job) => {
    logger.info(
      {
        service: 'check-worker',
        monitorId: job.data.monitorId,
        type: job.data.type,
        url: job.data.url,
      },
      'Processing check job'
    );
    await processCheckJob(job.data, alertQueue, connection);
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
  Sentry.captureException(err, {
    extra: { jobId: job?.id, monitorId: job?.data.monitorId, type: job?.data.type },
  });
});

// ─── Heartbeat ────────────────────────────────────────────────────────────────
// Write a timestamp to Redis every 30s so the health endpoint can verify we're alive.
const heartbeatInterval = setInterval(() => {
  connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch((err) => {
    logger.warn({ service: 'check-worker', err }, 'Failed to write heartbeat');
  });
}, HEARTBEAT_INTERVAL_MS);

// Write once immediately on startup
connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch(() => {});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, draining worker');

  clearInterval(heartbeatInterval);
  await worker.pause();

  // Wait up to 10 seconds for in-flight jobs to finish
  const drainTimeout = setTimeout(() => {
    logger.warn('Drain timeout reached, forcing shutdown');
    void forceShutdown();
  }, 10_000);

  await worker.close();
  clearTimeout(drainTimeout);

  await alertQueue.close();
  await prisma.$disconnect();
  await connection.quit();

  logger.info('Worker shutdown complete');
  process.exit(0);
};

const forceShutdown = async () => {
  await alertQueue.close().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  await connection.quit().catch(() => {});
  process.exit(1);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

logger.info({ service: 'check-worker', concurrency: 50 }, 'Check worker started');

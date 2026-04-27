import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('content-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
import { QUEUE_NAMES } from '@beaconmon/queue';
import type { ContentCheckJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processContentCheckJob } from './process-content-check-job.js';

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_KEY = 'worker:heartbeat:content';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker<ContentCheckJob>(
  QUEUE_NAMES.CONTENT_CHECK,
  async (job) => {
    const { monitorId, url } = job.data;
    logger.info({ service: 'content-worker', monitorId, url }, 'Processing content check job');
    await processContentCheckJob(job.data);
  },
  {
    connection,
    concurrency: 10,
  }
);

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'content-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Content check job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, monitorId: job?.data.monitorId, url: job?.data.url },
  });
});

// ─── Heartbeat ────────────────────────────────────────────────────────────────
const heartbeatInterval = setInterval(() => {
  connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch((err) => {
    logger.warn({ service: 'content-worker', err }, 'Failed to write heartbeat');
  });
}, HEARTBEAT_INTERVAL_MS);

connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch(() => {});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, draining content worker');

  clearInterval(heartbeatInterval);
  await worker.pause();

  const drainTimeout = setTimeout(() => {
    logger.warn('Drain timeout reached, forcing shutdown');
    void forceShutdown();
  }, 10_000);

  await worker.close();
  clearTimeout(drainTimeout);

  await prisma.$disconnect();
  await connection.quit();

  logger.info('Content worker shutdown complete');
  process.exit(0);
};

const forceShutdown = async () => {
  await prisma.$disconnect().catch(() => {});
  await connection.quit().catch(() => {});
  process.exit(1);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

logger.info({ service: 'content-worker', concurrency: 10 }, 'Content worker started');

import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('alert-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
import { QUEUE_NAMES } from '@beaconmon/queue';
import type { AlertJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processAlertJob } from './process-alert-job.js';

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_KEY = 'worker:heartbeat:alert';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker<AlertJob>(
  QUEUE_NAMES.ALERT_SEND,
  async (job) => {
    const { incidentId, monitorId, teamId, type } = job.data;
    logger.info(
      { service: 'alert-worker', jobId: job.id, incidentId, monitorId, teamId, type },
      'Processing alert job'
    );
    await processAlertJob(job.data);
  },
  {
    connection,
    concurrency: 10,
  }
);

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'alert-worker', jobId: job?.id, incidentId: job?.data.incidentId, err },
    'Alert job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, incidentId: job?.data.incidentId, teamId: job?.data.teamId },
  });
});

// ─── Heartbeat ────────────────────────────────────────────────────────────────
const heartbeatInterval = setInterval(() => {
  connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch((err) => {
    logger.warn({ service: 'alert-worker', err }, 'Failed to write heartbeat');
  });
}, HEARTBEAT_INTERVAL_MS);

connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120).catch(() => {});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, draining alert worker');

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

  logger.info('Alert worker shutdown complete');
  process.exit(0);
};

const forceShutdown = async () => {
  await prisma.$disconnect().catch(() => {});
  await connection.quit().catch(() => {});
  process.exit(1);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

logger.info({ service: 'alert-worker', concurrency: 10 }, 'Alert worker started');

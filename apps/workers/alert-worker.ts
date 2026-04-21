import './lib/env.js'; // validates env at startup
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { Worker } from 'bullmq';
import { QUEUE_NAMES } from '@beaconmon/queue';
import type { AlertJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker<AlertJob>(
  QUEUE_NAMES.ALERT_SEND,
  async (job) => {
    const { incidentId, monitorId, teamId, type } = job.data;
    logger.info(
      { service: 'alert-worker', incidentId, monitorId, teamId, type },
      'Processing alert job'
    );

    if (env.ALERT_DRY_RUN) {
      logger.info({ service: 'alert-worker', job: job.data }, 'ALERT_DRY_RUN=true — skipping send');
      return;
    }

    // Idempotency check — architecture rule #5:
    // Before sending, check notifications table for same (incident_id, channel_id)
    // within the last 5 minutes. If found, skip.

    // TODO: load team's active alert channels
    // TODO: for each channel, check idempotency, then send via email/slack/webhook
    // TODO: log to notifications table after successful send
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
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, draining alert worker');

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

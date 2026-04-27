import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('alert-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { AlertJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processAlertJob } from './process-alert-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<AlertJob>({
  queueName: QUEUE_NAMES.ALERT_SEND,
  workerName: 'alert',
  connection,
  concurrency: 10,
  logger,
  processor: async (job) => {
    const { incidentId, monitorId, teamId, type } = job.data;
    logger.info(
      { service: 'alert-worker', jobId: job.id, incidentId, monitorId, teamId, type },
      'Processing alert job'
    );
    await processAlertJob(job.data);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'alert-worker', jobId: job?.id, incidentId: job?.data.incidentId, err },
    'Alert job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, incidentId: job?.data.incidentId, teamId: job?.data.teamId },
  });
});

logger.info({ service: 'alert-worker', concurrency: 10 }, 'Alert worker started');

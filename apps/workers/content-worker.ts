import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('content-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { ContentCheckJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processContentCheckJob } from './process-content-check-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<ContentCheckJob>({
  queueName: QUEUE_NAMES.CONTENT_CHECK,
  workerName: 'content',
  connection,
  concurrency: 10,
  logger,
  processor: async (job) => {
    const { monitorId, url } = job.data;
    logger.info({ service: 'content-worker', monitorId, url }, 'Processing content check job');
    await processContentCheckJob(job.data, connection);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'content-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Content check job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, monitorId: job?.data.monitorId, url: job?.data.url },
  });
});

logger.info({ service: 'content-worker', concurrency: 10 }, 'Content worker started');

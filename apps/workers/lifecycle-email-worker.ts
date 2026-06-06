import './lib/env.js';
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('lifecycle-email-worker');

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { LifecycleEmailJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processLifecycleEmailJob } from './process-lifecycle-email-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<LifecycleEmailJob>({
  queueName: QUEUE_NAMES.LIFECYCLE_EMAIL,
  workerName: 'lifecycle-email',
  connection,
  concurrency: 5,
  logger,
  processor: async (job) => {
    logger.info(
      { service: 'lifecycle-email-worker', jobId: job.id, teamId: job.data.teamId, emailType: job.data.emailType },
      'Processing lifecycle email job'
    );
    await processLifecycleEmailJob(job.data, connection);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'lifecycle-email-worker', jobId: job?.id, teamId: job?.data.teamId, emailType: job?.data.emailType, err },
    'Lifecycle email job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, teamId: job?.data.teamId, emailType: job?.data.emailType },
  });
});

logger.info({ service: 'lifecycle-email-worker', concurrency: 5 }, 'Lifecycle email worker started');

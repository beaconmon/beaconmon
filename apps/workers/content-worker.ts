import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('content-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createContentNotifyQueue, createManagedWorker } from '@beaconmon/queue';
import type { ContentCheckJob, ContentNotifyJob } from '@beaconmon/queue';
import { prisma, monitoringRunWorkerRepository } from '@beaconmon/db';
import { processContentCheckJob } from './process-content-check-job.js';
import { processContentNotifyJob } from './process-content-notify-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const contentNotifyQueue = createContentNotifyQueue(connection);

const { worker } = createManagedWorker<ContentCheckJob>({
  queueName: QUEUE_NAMES.CONTENT_CHECK,
  workerName: 'content',
  connection,
  concurrency: 10,
  logger,
  processor: async (job) => {
    const { monitorId, url } = job.data;
    logger.info({ service: 'content-worker', monitorId, url }, 'Processing content check job');
    await processContentCheckJob(job.data, connection, contentNotifyQueue);
  },
  onShutdown: async () => {
    await contentNotifyQueue.close();
    await prisma.$disconnect();
    await connection.quit();
  },
});

const { worker: notifyWorker } = createManagedWorker<ContentNotifyJob>({
  queueName: QUEUE_NAMES.CONTENT_NOTIFY,
  workerName: 'content-notify',
  connection,
  concurrency: 10,
  logger,
  processor: async (job) => {
    logger.info({ service: 'content-worker', monitorId: job.data.monitorId }, 'Processing content notify job');
    await processContentNotifyJob(job.data);
  },
  onShutdown: async () => { /* shared connection closed above */ },
});

worker.on('completed', (job) => {
  monitoringRunWorkerRepository.recordSuccess({
    teamId: job.data.teamId,
    jobType: 'content',
    jobId: job.id ?? '',
    startedAt: new Date(job.processedOn ?? Date.now()),
    finishedAt: new Date(job.finishedOn ?? Date.now()),
  }).catch((err) => logger.error({ service: 'content-worker', err }, 'Failed to record monitoring run'));
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'content-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Content check job failed'
  );
  const maxAttempts = job?.opts.attempts ?? 3;
  // Only report to Sentry on the final attempt; all attempts are logged above.
  if (job && job.attemptsMade >= maxAttempts) {
    Sentry.captureException(err, {
      extra: { jobId: job?.id, monitorId: job?.data.monitorId, url: job?.data.url },
    });
    monitoringRunWorkerRepository.recordFailure({
      teamId: job.data.teamId,
      jobType: 'content',
      jobId: job.id ?? '',
      startedAt: new Date(job.processedOn ?? Date.now()),
      finishedAt: new Date(job.finishedOn ?? Date.now()),
      errorMessage: (err instanceof Error ? err.message : String(err)).slice(0, 500),
    }).catch((recordErr) => logger.error({ service: 'content-worker', recordErr }, 'Failed to record monitoring run failure'));
  }
});

notifyWorker.on('failed', (job, err) => {
  logger.error(
    { service: 'content-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Content notify job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, monitorId: job?.data.monitorId },
  });
});

logger.info({ service: 'content-worker', concurrency: 10 }, 'Content worker started');

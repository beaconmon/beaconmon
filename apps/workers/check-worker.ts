import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('check-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createAlertQueue, createEscalationQueue, createManagedWorker } from '@beaconmon/queue';
import type { CheckJob } from '@beaconmon/queue';
import { prisma, monitoringRunWorkerRepository } from '@beaconmon/db';
import { processCheckJob } from './process-check-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const alertQueue = createAlertQueue(connection);
const escalationQueue = createEscalationQueue(connection);

// Reduce concurrency when multi-location is enabled to cap outbound connections.
// 20 jobs × 5 regions = ~100 concurrent outbound fetches — acceptable for Railway.
const concurrency = env.FEATURE_MULTI_LOCATION ? 20 : 50;

const { worker } = createManagedWorker<CheckJob>({
  queueName: QUEUE_NAMES.CHECK_SCHEDULED,
  workerName: 'check',
  connection,
  concurrency,
  logger,
  processor: async (job) => {
    logger.info(
      {
        service: 'check-worker',
        monitorId: job.data.monitorId,
        type: job.data.type,
        url: job.data.url,
      },
      'Processing check job'
    );
    await processCheckJob(job.data, alertQueue, connection, escalationQueue);
  },
  onShutdown: async () => {
    await alertQueue.close();
    await escalationQueue.close();
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('completed', (job) => {
  monitoringRunWorkerRepository.recordSuccess({
    teamId: job.data.teamId,
    jobType: 'check',
    jobId: job.id ?? '',
    startedAt: new Date(job.processedOn ?? Date.now()),
    finishedAt: new Date(job.finishedOn ?? Date.now()),
  }).catch((err) => logger.error({ service: 'check-worker', err }, 'Failed to record monitoring run'));
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'check-worker', jobId: job?.id, monitorId: job?.data.monitorId, err },
    'Check job failed'
  );
  const maxAttempts = job?.opts.attempts ?? 3;
  // Only report to Sentry on the final attempt; all attempts are logged above.
  if (job && job.attemptsMade >= maxAttempts) {
    Sentry.captureException(err, {
      extra: { jobId: job?.id, monitorId: job?.data.monitorId, type: job?.data.type },
    });
    monitoringRunWorkerRepository.recordFailure({
      teamId: job.data.teamId,
      jobType: 'check',
      jobId: job.id ?? '',
      startedAt: new Date(job.processedOn ?? Date.now()),
      finishedAt: new Date(job.finishedOn ?? Date.now()),
      errorMessage: (err instanceof Error ? err.message : String(err)).slice(0, 500),
    }).catch((recordErr) => logger.error({ service: 'check-worker', recordErr }, 'Failed to record monitoring run failure'));
  }
});

logger.info({ service: 'check-worker', concurrency }, 'Check worker started');

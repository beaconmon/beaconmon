import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('competitor-page-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createCompetitorNotifyQueue, createManagedWorker } from '@beaconmon/queue';
import type { CompetitorPageCheckJob } from '@beaconmon/queue';
import { prisma, monitoringRunWorkerRepository } from '@beaconmon/db';
import { processCompetitorPageCheckJob } from './process-competitor-page-check-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const competitorNotifyQueue = createCompetitorNotifyQueue(connection);

const { worker } = createManagedWorker<CompetitorPageCheckJob>({
  queueName: QUEUE_NAMES.COMPETITOR_PAGE_CHECK,
  workerName: 'competitor-page',
  connection,
  concurrency: 5,
  logger,
  processor: async (job) => {
    const { competitorPageId, competitorId } = job.data;
    logger.info({ service: 'competitor-page-worker', competitorPageId, competitorId }, 'Processing competitor page check job');
    await processCompetitorPageCheckJob(job.data, connection, competitorNotifyQueue);
  },
  onShutdown: async () => {
    await competitorNotifyQueue.close();
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('completed', (job) => {
  monitoringRunWorkerRepository.recordSuccess({
    teamId: job.data.teamId,
    jobType: 'competitor_page',
    jobId: job.id ?? '',
    startedAt: new Date(job.processedOn ?? Date.now()),
    finishedAt: new Date(job.finishedOn ?? Date.now()),
  }).catch((err) => logger.error({ service: 'competitor-page-worker', err }, 'Failed to record monitoring run'));
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'competitor-page-worker', jobId: job?.id, competitorPageId: job?.data.competitorPageId, err },
    'Competitor page check job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, competitorPageId: job?.data.competitorPageId, competitorId: job?.data.competitorId },
  });
  const maxAttempts = job?.opts.attempts ?? 3;
  if (job && job.attemptsMade >= maxAttempts) {
    monitoringRunWorkerRepository.recordFailure({
      teamId: job.data.teamId,
      jobType: 'competitor_page',
      jobId: job.id ?? '',
      startedAt: new Date(job.processedOn ?? Date.now()),
      finishedAt: new Date(job.finishedOn ?? Date.now()),
      errorMessage: (err instanceof Error ? err.message : String(err)).slice(0, 500),
    }).catch((recordErr) => logger.error({ service: 'competitor-page-worker', recordErr }, 'Failed to record monitoring run failure'));
  }
});

logger.info({ service: 'competitor-page-worker', concurrency: 5 }, 'Competitor page worker started');

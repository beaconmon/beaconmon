import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('shopify-feed-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createCompetitorNotifyQueue, createManagedWorker } from '@beaconmon/queue';
import type { CatalogSyncJob } from '@beaconmon/queue';
import { prisma, updateCompetitorDiscoveryState, monitoringRunWorkerRepository } from '@beaconmon/db';
import { processCatalogSyncJob } from './process-catalog-sync-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const competitorNotifyQueue = createCompetitorNotifyQueue(connection);

const { worker } = createManagedWorker<CatalogSyncJob>({
  queueName: QUEUE_NAMES.SHOPIFY_FEED,
  workerName: 'shopify-feed',
  connection,
  concurrency: 3,
  // Catalog sync can take up to 10 minutes for large feeds. Lock must exceed
  // worst-case duration so BullMQ renewal never races the expiry.
  lockDuration: 15 * 60 * 1000,
  maxStalledCount: 2,
  logger,
  processor: async (job) => {
    const { competitorId, domain, mode } = job.data;
    logger.info({ service: 'shopify-feed-worker', competitorId, domain, mode: mode ?? 'sync' }, 'Processing catalog sync job');
    await processCatalogSyncJob(job.data, connection, competitorNotifyQueue);
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
    jobType: 'shopify_feed',
    jobId: job.id ?? '',
    startedAt: new Date(job.processedOn ?? Date.now()),
    finishedAt: new Date(job.finishedOn ?? Date.now()),
  }).catch((err) => logger.error({ service: 'shopify-feed-worker', err }, 'Failed to record monitoring run'));
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'shopify-feed-worker', jobId: job?.id, competitorId: job?.data.competitorId, err },
    'Shopify feed job failed'
  );

  const maxAttempts = job?.opts.attempts ?? 3;
  // Only report to Sentry on the final attempt; all attempts are logged above.
  if (job && job.attemptsMade >= maxAttempts) {
    Sentry.captureException(err, {
      extra: { jobId: job?.id, competitorId: job?.data.competitorId, domain: job?.data.domain },
    });
    const errorMessage = err instanceof Error ? err.message : String(err);
    updateCompetitorDiscoveryState(job.data.competitorId, {
      discoveryState: 'failed',
      discoveryError: errorMessage.slice(0, 500),
    }).catch((updateErr) => {
      logger.error({ service: 'shopify-feed-worker', competitorId: job.data.competitorId, updateErr }, 'Failed to write failed discovery state');
    });
    monitoringRunWorkerRepository.recordFailure({
      teamId: job.data.teamId,
      jobType: 'shopify_feed',
      jobId: job.id ?? '',
      startedAt: new Date(job.processedOn ?? Date.now()),
      finishedAt: new Date(job.finishedOn ?? Date.now()),
      errorMessage: errorMessage.slice(0, 500),
    }).catch((recordErr) => logger.error({ service: 'shopify-feed-worker', recordErr }, 'Failed to record monitoring run failure'));
  }
});

logger.info({ service: 'shopify-feed-worker', concurrency: 3 }, 'Shopify feed worker started');

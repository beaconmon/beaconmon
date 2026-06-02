import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('shopify-feed-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createCompetitorNotifyQueue, createManagedWorker } from '@beaconmon/queue';
import type { ShopifyFeedJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processShopifyFeedJob } from './process-shopify-feed-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const competitorNotifyQueue = createCompetitorNotifyQueue(connection);

const { worker } = createManagedWorker<ShopifyFeedJob>({
  queueName: QUEUE_NAMES.SHOPIFY_FEED,
  workerName: 'shopify-feed',
  connection,
  concurrency: 3,
  logger,
  processor: async (job) => {
    const { competitorId, domain } = job.data;
    logger.info({ service: 'shopify-feed-worker', competitorId, domain }, 'Processing Shopify feed job');
    await processShopifyFeedJob(job.data, connection, competitorNotifyQueue);
  },
  onShutdown: async () => {
    await competitorNotifyQueue.close();
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'shopify-feed-worker', jobId: job?.id, competitorId: job?.data.competitorId, err },
    'Shopify feed job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, competitorId: job?.data.competitorId, domain: job?.data.domain },
  });
});

logger.info({ service: 'shopify-feed-worker', concurrency: 3 }, 'Shopify feed worker started');

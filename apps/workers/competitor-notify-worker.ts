import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('competitor-notify-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { CompetitorNotifyJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processCompetitorNotifyJob } from './process-competitor-notify-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<CompetitorNotifyJob>({
  queueName: QUEUE_NAMES.COMPETITOR_NOTIFY,
  workerName: 'competitor-notify',
  connection,
  concurrency: 10,
  logger,
  processor: async (job) => {
    const { competitorEventId, competitorId } = job.data;
    logger.info({ service: 'competitor-notify-worker', competitorEventId, competitorId }, 'Processing competitor notify job');
    await processCompetitorNotifyJob(job.data, connection);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'competitor-notify-worker', jobId: job?.id, competitorEventId: job?.data.competitorEventId, err },
    'Competitor notify job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, competitorEventId: job?.data.competitorEventId, competitorId: job?.data.competitorId },
  });
});

logger.info({ service: 'competitor-notify-worker', concurrency: 10 }, 'Competitor notify worker started');

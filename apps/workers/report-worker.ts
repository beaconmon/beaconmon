import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('report-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { ReportJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processReportJob } from './process-report-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<ReportJob>({
  queueName: QUEUE_NAMES.REPORT_GENERATE,
  workerName: 'report',
  connection,
  concurrency: 2,
  logger,
  processor: async (job) => {
    const { teamId, clientName } = job.data;
    logger.info(
      { service: 'report-worker', jobId: job.id, teamId, clientName },
      'Processing report job'
    );
    await processReportJob(job.data);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'report-worker', jobId: job?.id, teamId: job?.data.teamId, err },
    'Report job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, teamId: job?.data.teamId, clientName: job?.data.clientName },
  });
});

logger.info({ service: 'report-worker', concurrency: 2 }, 'Report worker started');

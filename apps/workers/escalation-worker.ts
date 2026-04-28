import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('escalation-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { EscalationStepJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processEscalationJob } from './process-escalation-job.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<EscalationStepJob>({
  queueName: QUEUE_NAMES.ESCALATION_STEP,
  workerName: 'escalation',
  connection,
  concurrency: 5,
  logger,
  processor: async (job) => {
    const { incidentId, stepIndex } = job.data;
    logger.info(
      { service: 'escalation-worker', jobId: job.id, incidentId, stepIndex },
      'Processing escalation step'
    );
    await processEscalationJob(job.data);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'escalation-worker', jobId: job?.id, incidentId: job?.data.incidentId, err },
    'Escalation job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, incidentId: job?.data.incidentId, teamId: job?.data.teamId },
  });
});

logger.info({ service: 'escalation-worker', concurrency: 5 }, 'Escalation worker started');

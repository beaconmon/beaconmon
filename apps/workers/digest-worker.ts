import './lib/env.js'; // validates env at startup
import { initSentry, Sentry } from './lib/sentry.js';
initSentry('digest-worker'); // must be before other imports

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, createManagedWorker } from '@beaconmon/queue';
import type { IntelligenceDigestJob } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { processIntelligenceDigestJob } from './process-intelligence-digest-job.js';

const HEARTBEAT_KEY = 'worker:heartbeat:digest-worker';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const { worker } = createManagedWorker<IntelligenceDigestJob>({
  queueName: QUEUE_NAMES.INTELLIGENCE_DIGEST,
  workerName: 'digest',
  connection,
  concurrency: 3,
  logger,
  processor: async (job) => {
    const { teamId, frequency } = job.data;
    logger.info(
      { service: 'digest-worker', jobId: job.id, teamId, frequency },
      'Processing intelligence digest job'
    );
    await processIntelligenceDigestJob(job.data);
  },
  onShutdown: async () => {
    await prisma.$disconnect();
    await connection.quit();
  },
});

worker.on('failed', (job, err) => {
  logger.error(
    { service: 'digest-worker', jobId: job?.id, teamId: job?.data.teamId, err },
    'Intelligence digest job failed'
  );
  Sentry.captureException(err, {
    extra: { jobId: job?.id, teamId: job?.data.teamId, frequency: job?.data.frequency },
  });
});

// Heartbeat — read by /api/health
const heartbeatInterval = setInterval(() => {
  void connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120);
}, 30_000);
void connection.set(HEARTBEAT_KEY, new Date().toISOString(), 'EX', 120);

worker.on('closed', () => clearInterval(heartbeatInterval));

logger.info({ service: 'digest-worker', concurrency: 3 }, 'Digest worker started');

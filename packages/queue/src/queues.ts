import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import type {
  CheckJob,
  ContentCheckJob,
  AlertJob,
  ReportJob,
  EscalationStepJob,
} from './types.js';
import { QUEUE_NAMES } from './types.js';

export function createCheckQueue(connection: Redis): Queue<CheckJob> {
  return new Queue<CheckJob>(QUEUE_NAMES.CHECK_SCHEDULED, {
    connection,
    defaultJobOptions: {
      attempts: 1, // no retries — wait for next scheduled interval
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
}

export function createContentCheckQueue(
  connection: Redis
): Queue<ContentCheckJob> {
  return new Queue<ContentCheckJob>(QUEUE_NAMES.CONTENT_CHECK, {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
}

export function createAlertQueue(connection: Redis): Queue<AlertJob> {
  return new Queue<AlertJob>(QUEUE_NAMES.ALERT_SEND, {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 1000 },
    },
  });
}

export function createReportQueue(connection: Redis): Queue<ReportJob> {
  return new Queue<ReportJob>(QUEUE_NAMES.REPORT_GENERATE, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  });
}

export function createEscalationQueue(connection: Redis): Queue<EscalationStepJob> {
  return new Queue<EscalationStepJob>(QUEUE_NAMES.ESCALATION_STEP, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
    },
  });
}

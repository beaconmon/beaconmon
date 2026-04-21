import { Worker, type Processor } from 'bullmq';
import type { Redis } from 'ioredis';
import type {
  CheckJob,
  ContentCheckJob,
  AlertJob,
  ReportJob,
} from './types.js';
import { QUEUE_NAMES } from './types.js';

export function createCheckWorker(
  connection: Redis,
  processor: Processor<CheckJob>
): Worker<CheckJob> {
  return new Worker<CheckJob>(QUEUE_NAMES.CHECK_SCHEDULED, processor, {
    connection,
    concurrency: 50,
  });
}

export function createContentCheckWorker(
  connection: Redis,
  processor: Processor<ContentCheckJob>
): Worker<ContentCheckJob> {
  return new Worker<ContentCheckJob>(QUEUE_NAMES.CONTENT_CHECK, processor, {
    connection,
    concurrency: 10,
  });
}

export function createAlertWorker(
  connection: Redis,
  processor: Processor<AlertJob>
): Worker<AlertJob> {
  return new Worker<AlertJob>(QUEUE_NAMES.ALERT_SEND, processor, {
    connection,
    concurrency: 10,
  });
}

export function createReportWorker(
  connection: Redis,
  processor: Processor<ReportJob>
): Worker<ReportJob> {
  return new Worker<ReportJob>(QUEUE_NAMES.REPORT_GENERATE, processor, {
    connection,
    concurrency: 2,
  });
}

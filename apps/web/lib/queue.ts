import { Redis } from 'ioredis';
import { createReportQueue, createEscalationQueue } from '@beaconmon/queue';

// Reuse connection across requests in the same worker/serverless context
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env['REDIS_URL'];
    if (!url) throw new Error('REDIS_URL is not set');
    redis = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
  }
  return redis;
}

export function getReportQueue() {
  return createReportQueue(getRedis());
}

export function getEscalationQueue() {
  return createEscalationQueue(getRedis());
}

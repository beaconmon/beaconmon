import { Redis } from 'ioredis';
import { createShopifyFeedQueue } from '@beaconmon/queue';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env['REDIS_URL'];
    if (!url) throw new Error('REDIS_URL is not set');
    redis = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
  }
  return redis;
}

export function getShopifyFeedQueue() {
  return createShopifyFeedQueue(getRedis());
}

export function getQueueRedis() {
  return getRedis();
}

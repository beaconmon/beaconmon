import { Redis } from 'ioredis';

// Singleton Redis connection for the web app (health route, status page cache).
// Uses REDIS_URL from environment — falls back to localhost for dev.
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return _redis;
}

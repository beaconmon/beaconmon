import { getRedis } from '@/lib/redis';
import { warmStatusPageCache, STATUS_PAGE_CACHE_PREFIX } from '@beaconmon/status-pages';
import type { StatusPageCacheData } from '@beaconmon/types';

/**
 * Returns status page data, served from Redis cache when available.
 * On cache miss: queries DB, reads uptime from Redis, writes assembled data back to cache.
 * Redis failures degrade gracefully — never throws or 500s.
 */
export async function getStatusPageData(slug: string): Promise<StatusPageCacheData | null> {
  const redis = getRedis();
  const cacheKey = `${STATUS_PAGE_CACHE_PREFIX}:${slug}`;

  // Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as StatusPageCacheData;
    }
  } catch {
    // Redis unavailable — fall through to DB
  }

  // Cache miss — assemble and warm cache
  return warmStatusPageCache(slug, { redis });
}

/**
 * Sliding window rate limiter: 60 requests per minute per IP.
 * On Redis failure, allows the request (fail open).
 */
export async function rateLimit(ip: string): Promise<boolean> {
  const redis = getRedis();
  const key = `ratelimit:${ip}:${Math.floor(Date.now() / 60_000)}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 120);
    return count <= 60;
  } catch {
    return true;
  }
}

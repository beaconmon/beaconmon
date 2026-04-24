import { getRedis } from '@/lib/redis';
import { assembleStatusPageCacheData } from '@beaconmon/types';
import type { StatusPageCacheData } from '@beaconmon/types';
import { findBySlugPublic } from '@/lib/repositories/status-pages';
import { checkResultRepository } from '@/lib/repositories/check-results';

const CACHE_TTL_SECONDS = 300;
const UPTIME_HASH_KEY = 'uptime:90d';

/**
 * Returns status page data, served from Redis cache when available.
 * On cache miss: queries DB, reads uptime from Redis, writes assembled data back to cache.
 * Redis failures degrade gracefully — never throws or 500s.
 */
export async function getStatusPageData(slug: string): Promise<StatusPageCacheData | null> {
  const redis = getRedis();
  const cacheKey = `statuspage:${slug}`;

  // Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as StatusPageCacheData;
    }
  } catch {
    // Redis unavailable — fall through to DB
  }

  // Cache miss — query DB
  const dbData = await findBySlugPublic(slug);
  if (!dbData) return null;

  const monitorIds = dbData.monitors.map((spm) => spm.monitor.id);

  // Fetch uptime map (Redis) and daily stats (DB) in parallel
  const [uptimeMap, dailyStatsMap] = await Promise.all([
    (async (): Promise<Record<string, number>> => {
      const map: Record<string, number> = {};
      try {
        if (monitorIds.length > 0) {
          const values = await redis.hmget(UPTIME_HASH_KEY, ...monitorIds);
          for (let i = 0; i < monitorIds.length; i++) {
            const id = monitorIds[i]!;
            const val = values[i];
            const parsed = val != null ? parseFloat(val) : NaN;
            map[id] = Number.isNaN(parsed) ? 100 : parsed;
          }
        }
      } catch {
        // Redis unavailable — all monitors default to 100% uptime display
      }
      return map;
    })(),
    checkResultRepository.getDailyUptimeStats(monitorIds, 90).catch(() => new Map()),
  ]);

  const data = assembleStatusPageCacheData(dbData, uptimeMap, dailyStatsMap);

  // Write to cache (fire and forget — never block on Redis)
  redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS).catch(() => {});

  return data;
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

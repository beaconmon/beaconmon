import { checkResultRepository, statusPageWorkerRepository } from '@beaconmon/db';
import { assembleStatusPageCacheData } from '@beaconmon/types';
import type { StatusPageCacheData } from '@beaconmon/types';
import type { Redis } from 'ioredis';
import { createStatusPageIdHasher } from './hash.js';

const UPTIME_HASH_KEY = 'uptime:90d';
const CACHE_TTL_SECONDS = 300;

// v2 = payloads use opaque hashed IDs instead of raw DB primary keys.
// Bumping this key invalidates pre-hash caches.
export const STATUS_PAGE_CACHE_PREFIX = 'statuspage:v2';

let _hashSecret: string | null = null;
function getStatusPageHashSecret(): string {
  if (_hashSecret === null) {
    const secret = process.env.STATUS_PAGE_HASH_SECRET;
    if (!secret || secret.length < 16) {
      throw new Error(
        'STATUS_PAGE_HASH_SECRET must be set to a value of at least 16 characters'
      );
    }
    _hashSecret = secret;
  }
  return _hashSecret;
}

export async function warmStatusPageCache(
  slug: string,
  deps: { redis: Redis }
): Promise<StatusPageCacheData | null> {
  const { redis } = deps;

  const dbData = await statusPageWorkerRepository.findStatusPageDataBySlug(slug);
  if (!dbData) return null;

  const monitorIds = dbData.monitors.map((spm) => spm.monitor.id);

  const [uptimeMap, dailyStatsMap] = await Promise.all([
    (async (): Promise<Record<string, number>> => {
      const map: Record<string, number> = {};
      if (monitorIds.length === 0) return map;
      try {
        const values = await redis.hmget(UPTIME_HASH_KEY, ...monitorIds);
        for (let i = 0; i < monitorIds.length; i++) {
          const id = monitorIds[i]!;
          const val = values[i];
          const parsed = val != null ? parseFloat(val) : NaN;
          map[id] = Number.isNaN(parsed) ? 100 : parsed;
        }
      } catch {
        // Redis unavailable — all monitors default to 100% uptime display
      }
      return map;
    })(),
    checkResultRepository.getDailyUptimeStats(monitorIds, 90).catch(() => new Map()),
  ]);

  const idHasher = createStatusPageIdHasher(slug, getStatusPageHashSecret());
  const hideBranding = !!(dbData.team && dbData.team.plan !== 'free');
  const data = assembleStatusPageCacheData(dbData, uptimeMap, dailyStatsMap, idHasher, hideBranding);

  // Write to cache (fire and forget — never block the caller on Redis)
  redis
    .set(`${STATUS_PAGE_CACHE_PREFIX}:${slug}`, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)
    .catch(() => {});

  return data;
}

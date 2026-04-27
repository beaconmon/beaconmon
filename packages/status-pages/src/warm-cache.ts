import { checkResultRepository, statusPageWorkerRepository } from '@beaconmon/db';
import { assembleStatusPageCacheData } from '@beaconmon/types';
import type { StatusPageCacheData } from '@beaconmon/types';
import type { Redis } from 'ioredis';

const UPTIME_HASH_KEY = 'uptime:90d';
const CACHE_TTL_SECONDS = 300;

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

  const data = assembleStatusPageCacheData(dbData, uptimeMap, dailyStatsMap);

  // Write to cache (fire and forget — never block the caller on Redis)
  redis.set(`statuspage:${slug}`, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS).catch(() => {});

  return data;
}

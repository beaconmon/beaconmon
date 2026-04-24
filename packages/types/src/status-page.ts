export type StatusPageOverallStatus = 'operational' | 'degraded' | 'outage';

export interface DailyUptimeStat {
  date: string; // 'YYYY-MM-DD' UTC
  state: 'up' | 'degraded' | 'outage' | 'nodata';
  uptimePercent: number; // 0–100
}

export interface StatusPageMonitorData {
  id: string;
  name: string;
  type: string;
  currentStatus: 'up' | 'down' | 'paused';
  uptimePercent90d: number;
  dailyStats: DailyUptimeStat[]; // 90 entries, oldest first
  recentIncidents: Array<{
    id: string;
    startedAt: string;
    resolvedAt: string | null;
    durationMs: number | null;
  }>;
}

export interface StatusPageCacheData {
  slug: string;
  name: string;
  customDomain?: string;
  overallStatus: StatusPageOverallStatus;
  monitors: StatusPageMonitorData[];
  cachedAt: string;
}

/**
 * Compute overall status from monitor list.
 * Paused monitors are excluded from the calculation.
 */
export function computeOverallStatus(
  monitors: Pick<StatusPageMonitorData, 'currentStatus'>[]
): StatusPageOverallStatus {
  const active = monitors.filter((m) => m.currentStatus !== 'paused');
  if (active.length === 0) return 'operational';

  const downCount = active.filter((m) => m.currentStatus === 'down').length;
  if (downCount === 0) return 'operational';
  if (downCount === active.length) return 'outage';
  return 'degraded';
}

export interface StatusPageDbData {
  slug: string;
  name: string;
  customDomain?: string | null;
  monitors: Array<{
    monitorId: string;
    displayOrder: number;
    monitor: {
      id: string;
      name: string;
      type: string;
      currentStatus: string;
      incidents: Array<{
        id: string;
        startedAt: Date;
        resolvedAt: Date | null;
      }>;
    };
  }>;
}

/**
 * Assemble StatusPageCacheData from a DB query result, a Redis uptime map,
 * and a per-monitor daily stats map (90 entries each).
 * uptimeMap: Record<monitorId, uptimePercent> — missing entries default to 100.
 * dailyStatsMap: Map<monitorId, DailyUptimeStat[]> — missing entries get empty array.
 */
export function assembleStatusPageCacheData(
  dbData: StatusPageDbData,
  uptimeMap: Record<string, number>,
  dailyStatsMap: Map<string, DailyUptimeStat[]> = new Map()
): StatusPageCacheData {
  const monitors: StatusPageMonitorData[] = dbData.monitors.map((spm) => {
    const m = spm.monitor;
    const status = m.currentStatus as 'up' | 'down' | 'paused';
    return {
      id: m.id,
      name: m.name,
      type: m.type,
      currentStatus: status,
      uptimePercent90d: uptimeMap[m.id] ?? 100,
      dailyStats: dailyStatsMap.get(m.id) ?? [],
      recentIncidents: m.incidents.map((inc) => ({
        id: inc.id,
        startedAt: inc.startedAt.toISOString(),
        resolvedAt: inc.resolvedAt ? inc.resolvedAt.toISOString() : null,
        durationMs:
          inc.resolvedAt
            ? inc.resolvedAt.getTime() - inc.startedAt.getTime()
            : null,
      })),
    };
  });

  return {
    slug: dbData.slug,
    name: dbData.name,
    ...(dbData.customDomain ? { customDomain: dbData.customDomain } : {}),
    overallStatus: computeOverallStatus(monitors),
    monitors,
    cachedAt: new Date().toISOString(),
  };
}

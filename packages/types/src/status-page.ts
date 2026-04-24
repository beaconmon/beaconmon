export type StatusPageOverallStatus = 'operational' | 'degraded' | 'outage';

export interface StatusPageMonitorData {
  id: string;
  name: string;
  type: string;
  currentStatus: 'up' | 'down' | 'paused';
  uptimePercent90d: number;
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
 * Assemble StatusPageCacheData from a DB query result and a Redis uptime map.
 * uptimeMap: Record<monitorId, uptimePercent> — missing entries default to 100.
 */
export function assembleStatusPageCacheData(
  dbData: StatusPageDbData,
  uptimeMap: Record<string, number>
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
    overallStatus: computeOverallStatus(monitors),
    monitors,
    cachedAt: new Date().toISOString(),
  };
}

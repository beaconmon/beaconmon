export interface MonitorForPauseSelect {
  id: string;
  name: string;
  isCompetitor: boolean;
  createdAt: Date;
}

/**
 * Pure function: given a list of active monitors, returns those that must be
 * paused to bring the team within free-tier caps.
 * Oldest-added monitors are kept active; newest overflow is paused.
 */
export function selectMonitorsToPause(
  monitors: MonitorForPauseSelect[],
  caps: { monitors: number; competitorMonitors: number },
): MonitorForPauseSelect[] {
  const competitors = monitors
    .filter((m) => m.isCompetitor)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const own = monitors
    .filter((m) => !m.isCompetitor)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const keepComp = caps.competitorMonitors === -1 ? competitors.length : caps.competitorMonitors;
  const keepOwn = caps.monitors === -1 ? own.length : caps.monitors;

  return [...competitors.slice(keepComp), ...own.slice(keepOwn)];
}

import { describe, it, expect } from 'vitest';
import { selectMonitorsToPause } from './trial-end-select.js';
import type { MonitorForPauseSelect } from './trial-end-select.js';

const FREE_CAPS = { monitors: 10, competitorMonitors: 1 };

function makeMonitor(
  overrides: Partial<MonitorForPauseSelect> & { id: string },
): MonitorForPauseSelect {
  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    isCompetitor: overrides.isCompetitor ?? false,
    createdAt: overrides.createdAt ?? new Date('2026-01-01'),
  };
}

function makeMonitors(
  count: number,
  isCompetitor: boolean,
  baseDate = '2026-01-01',
): MonitorForPauseSelect[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${isCompetitor ? 'c' : 'm'}${i + 1}`,
    name: `${isCompetitor ? 'Competitor' : 'Monitor'} ${i + 1}`,
    isCompetitor,
    // Each monitor is 1 day newer than the previous
    createdAt: new Date(new Date(baseDate).getTime() + i * 24 * 60 * 60 * 1000),
  }));
}

describe('selectMonitorsToPause', () => {
  it('returns empty when all monitors are within caps', () => {
    const monitors = [
      ...makeMonitors(1, true),
      ...makeMonitors(8, false),
    ];
    expect(selectMonitorsToPause(monitors, FREE_CAPS)).toHaveLength(0);
  });

  it('pauses newest competitor monitors beyond cap=1', () => {
    const monitors = makeMonitors(5, true);
    const toPause = selectMonitorsToPause(monitors, FREE_CAPS);
    expect(toPause).toHaveLength(4);
    // Oldest (c1) stays active; c2-c5 are paused
    const pausedIds = toPause.map((m) => m.id);
    expect(pausedIds).not.toContain('c1');
    expect(pausedIds).toContain('c2');
    expect(pausedIds).toContain('c5');
  });

  it('pauses newest own monitors beyond cap=10', () => {
    const monitors = makeMonitors(12, false);
    const toPause = selectMonitorsToPause(monitors, FREE_CAPS);
    expect(toPause).toHaveLength(2);
    const pausedIds = toPause.map((m) => m.id);
    // Oldest 10 stay active; m11 and m12 are paused
    expect(pausedIds).not.toContain('m1');
    expect(pausedIds).not.toContain('m10');
    expect(pausedIds).toContain('m11');
    expect(pausedIds).toContain('m12');
  });

  it('handles verification checklist scenario: 5 competitors + 12 own monitors', () => {
    const competitors = makeMonitors(5, true);
    const own = makeMonitors(12, false);
    const toPause = selectMonitorsToPause([...competitors, ...own], FREE_CAPS);

    // 4 competitor + 2 own = 6 paused
    expect(toPause).toHaveLength(6);

    const pausedCompetitors = toPause.filter((m) => m.isCompetitor);
    const pausedOwn = toPause.filter((m) => !m.isCompetitor);
    expect(pausedCompetitors).toHaveLength(4);
    expect(pausedOwn).toHaveLength(2);

    // Oldest competitor (c1) must not be paused
    expect(pausedCompetitors.map((m) => m.id)).not.toContain('c1');
    // Oldest 10 own monitors must not be paused
    for (let i = 1; i <= 10; i++) {
      expect(pausedOwn.map((m) => m.id)).not.toContain(`m${i}`);
    }
  });

  it('returns empty when no monitors exceed caps', () => {
    const monitors = [makeMonitor({ id: 'c1', isCompetitor: true })];
    expect(selectMonitorsToPause(monitors, FREE_CAPS)).toHaveLength(0);
  });

  it('handles unlimited cap (-1) for competitors', () => {
    const monitors = makeMonitors(10, true);
    const result = selectMonitorsToPause(monitors, { monitors: 10, competitorMonitors: -1 });
    expect(result).toHaveLength(0);
  });

  it('handles unlimited cap (-1) for own monitors', () => {
    const monitors = makeMonitors(50, false);
    const result = selectMonitorsToPause(monitors, { monitors: -1, competitorMonitors: 1 });
    expect(result).toHaveLength(0);
  });

  it('preserves oldest-first ordering when selecting who to pause', () => {
    // c1 created first, c3 created last; c3 should be paused
    const monitors = [
      makeMonitor({ id: 'c3', isCompetitor: true, createdAt: new Date('2026-03-01') }),
      makeMonitor({ id: 'c1', isCompetitor: true, createdAt: new Date('2026-01-01') }),
      makeMonitor({ id: 'c2', isCompetitor: true, createdAt: new Date('2026-02-01') }),
    ];
    const toPause = selectMonitorsToPause(monitors, FREE_CAPS);
    expect(toPause).toHaveLength(2);
    expect(toPause.map((m) => m.id)).toContain('c2');
    expect(toPause.map((m) => m.id)).toContain('c3');
    expect(toPause.map((m) => m.id)).not.toContain('c1');
  });

  it('returns empty when monitor list is empty', () => {
    expect(selectMonitorsToPause([], FREE_CAPS)).toHaveLength(0);
  });
});

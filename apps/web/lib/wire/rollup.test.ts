import { describe, it, expect } from 'vitest';
import {
  rollupByCompetitor,
  computeTrend,
  binBy7Days,
  eventLabel,
  buildWireStats,
  formatRelative,
} from './rollup';
import type { IntelligenceEvent } from '@/lib/repositories/intelligence';
import type { CompetitorItem } from '@/lib/hooks/use-competitors';

const NOW = Date.UTC(2026, 5, 9, 12, 0, 0); // 2026-06-09T12:00:00Z

function comp(partial: Partial<CompetitorItem>): CompetitorItem {
  return {
    id: 'c1',
    name: 'GymGear',
    domain: 'gymgear.com',
    platform: 'shopify',
    isActive: true,
    ...partial,
  };
}

function event(partial: Partial<IntelligenceEvent>): IntelligenceEvent {
  return {
    id: 'e1',
    type: 'competitor_event',
    timestamp: new Date(NOW - 60 * 60 * 1000),
    monitorId: 'c1',
    monitorName: 'GymGear',
    monitorUrl: 'https://gymgear.com',
    competitorEventType: 'price_changed',
    payload: {},
    ...partial,
  };
}

describe('binBy7Days', () => {
  it('places events in correct bin', () => {
    const events = [
      event({ timestamp: new Date(NOW - 1000) }), // today, bin 6
      event({ timestamp: new Date(NOW - 1 * 24 * 60 * 60 * 1000) }), // bin 5
      event({ timestamp: new Date(NOW - 1 * 24 * 60 * 60 * 1000) }), // bin 5
      event({ timestamp: new Date(NOW - 6 * 24 * 60 * 60 * 1000) }), // bin 0
    ];
    const bins = binBy7Days(events, NOW);
    expect(bins).toHaveLength(7);
    expect(bins[6]).toBe(1);
    expect(bins[5]).toBe(2);
    expect(bins[0]).toBe(1);
  });

  it('drops events older than 7 days', () => {
    const events = [event({ timestamp: new Date(NOW - 10 * 24 * 60 * 60 * 1000) })];
    expect(binBy7Days(events, NOW).every((v) => v === 0)).toBe(true);
  });
});

describe('computeTrend', () => {
  it('returns silent when no events in the last 14 days', () => {
    expect(computeTrend([], NOW)).toBe('silent');
  });

  it('returns rising when this week beats the prior week', () => {
    const events = [
      event({ timestamp: new Date(NOW - 1 * 24 * 60 * 60 * 1000) }),
      event({ timestamp: new Date(NOW - 2 * 24 * 60 * 60 * 1000) }),
      event({ timestamp: new Date(NOW - 10 * 24 * 60 * 60 * 1000) }),
    ];
    expect(computeTrend(events, NOW)).toBe('rising');
  });

  it('returns quiet when prior week was busier', () => {
    const events = [
      event({ timestamp: new Date(NOW - 1 * 24 * 60 * 60 * 1000) }),
      event({ timestamp: new Date(NOW - 10 * 24 * 60 * 60 * 1000) }),
      event({ timestamp: new Date(NOW - 11 * 24 * 60 * 60 * 1000) }),
    ];
    expect(computeTrend(events, NOW)).toBe('quiet');
  });
});

describe('eventLabel', () => {
  it('maps known types', () => {
    expect(eventLabel('price_changed')).toBe('Price change');
    expect(eventLabel('out_of_stock')).toBe('Out of stock');
  });

  it('falls back when unknown', () => {
    expect(eventLabel('totally_made_up')).toBe('Competitor event');
    expect(eventLabel(undefined)).toBe('Activity');
  });
});

describe('rollupByCompetitor', () => {
  it('groups by monitor and sorts by 30d volume desc', () => {
    const competitors = [comp({ id: 'a', name: 'A' }), comp({ id: 'b', name: 'B' })];
    const events = [
      event({ id: '1', monitorId: 'b', timestamp: new Date(NOW - 60_000) }),
      event({ id: '2', monitorId: 'a', timestamp: new Date(NOW - 60_000) }),
      event({ id: '3', monitorId: 'a', timestamp: new Date(NOW - 60_000) }),
      event({ id: '4', monitorId: 'a', timestamp: new Date(NOW - 60_000) }),
    ];
    const rollups = rollupByCompetitor(competitors, events, NOW);
    expect(rollups).toHaveLength(2);
    expect(rollups[0]?.competitor.id).toBe('a');
    expect(rollups[0]?.month).toBe(3);
    expect(rollups[1]?.month).toBe(1);
  });

  it('drops events outside the 30d window', () => {
    const competitors = [comp({ id: 'a', name: 'A' })];
    const events = [
      event({ monitorId: 'a', timestamp: new Date(NOW - 5 * 24 * 60 * 60 * 1000) }),
      event({ monitorId: 'a', timestamp: new Date(NOW - 60 * 24 * 60 * 60 * 1000) }),
    ];
    const r = rollupByCompetitor(competitors, events, NOW);
    expect(r[0]?.month).toBe(1);
  });

  it('returns a silent rollup for competitors with no events', () => {
    const r = rollupByCompetitor([comp({ id: 'z', name: 'Z' })], [], NOW);
    expect(r[0]?.month).toBe(0);
    expect(r[0]?.trend).toBe('silent');
    expect(r[0]?.lastEvent).toBeUndefined();
  });

  it('ignores non-competitor events', () => {
    const r = rollupByCompetitor(
      [comp({ id: 'a' })],
      [event({ monitorId: 'a', type: 'content_change' })],
      NOW
    );
    expect(r[0]?.month).toBe(0);
  });

  it('puts the most recent event first', () => {
    const r = rollupByCompetitor(
      [comp({ id: 'a' })],
      [
        event({ id: 'older', monitorId: 'a', timestamp: new Date(NOW - 24 * 60 * 60 * 1000) }),
        event({ id: 'newer', monitorId: 'a', timestamp: new Date(NOW - 60_000) }),
      ],
      NOW
    );
    expect(r[0]?.lastEvent?.id).toBe('newer');
  });
});

describe('buildWireStats', () => {
  it('always returns exactly four stats', () => {
    const stats = buildWireStats([], []);
    expect(stats).toHaveLength(4);
  });

  it('flags many monthly moves with amber tone', () => {
    const competitors = [comp({ id: 'a' })];
    const events = Array.from({ length: 12 }, (_, i) =>
      event({ id: `e${i}`, monitorId: 'a', timestamp: new Date(NOW - 60_000) })
    );
    const rollups = rollupByCompetitor(competitors, events, NOW);
    const stats = buildWireStats(events, rollups);
    expect(stats[0]?.tone).toBe('amber');
    expect(stats[0]?.head).toContain('12');
  });

  it('names the most active competitor in stat 2', () => {
    const competitors = [comp({ id: 'a', name: 'AlphaGear' })];
    const events = [event({ monitorId: 'a', timestamp: new Date(NOW - 60_000) })];
    const rollups = rollupByCompetitor(competitors, events, NOW);
    const stats = buildWireStats(events, rollups);
    expect(stats[1]?.head).toContain('AlphaGear most active');
  });

  it('calls out a silent competitor in stat 4', () => {
    const competitors = [
      comp({ id: 'a', name: 'Active' }),
      comp({ id: 'z', name: 'FlexFuel' }),
    ];
    const events = [event({ monitorId: 'a', timestamp: new Date(NOW - 60_000) })];
    const rollups = rollupByCompetitor(competitors, events, NOW);
    const stats = buildWireStats(events, rollups);
    expect(stats[3]?.head).toContain('FlexFuel went silent');
  });
});

describe('formatRelative', () => {
  it('formats minutes, hours, days, months', () => {
    expect(formatRelative(new Date(NOW), NOW)).toBe('just now');
    expect(formatRelative(new Date(NOW - 5 * 60_000), NOW)).toBe('5m ago');
    expect(formatRelative(new Date(NOW - 3 * 60 * 60_000), NOW)).toBe('3h ago');
    expect(formatRelative(new Date(NOW - 2 * 24 * 60 * 60_000), NOW)).toBe('2d ago');
    expect(formatRelative(new Date(NOW - 60 * 24 * 60 * 60_000), NOW)).toBe('2mo ago');
  });
});

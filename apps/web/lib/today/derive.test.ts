import { describe, it, expect } from 'vitest';
import {
  pickScenario,
  buildBriefingHeadline,
  buildLeadAction,
  buildBusinessStats,
  groupByCompetitor,
  reliabilityDirection,
  getRecentOutage,
  getOpenIncident,
} from './derive';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { IntelligenceEvent } from '@/lib/repositories/intelligence';
import type { FeedItem } from '@/lib/repositories/notifications-feed';

function monitor(partial: Partial<MonitorRow>): MonitorRow {
  return {
    id: 'm1',
    name: 'Test',
    url: 'https://example.com',
    type: 'http',
    isActive: true,
    isCompetitor: false,
    pausedReason: null,
    pausedAt: null,
    currentStatus: 'up',
    intervalSeconds: 60,
    timeoutMs: 30_000,
    lastCheckedAt: null,
    nextCheckAt: null,
    responseTimeThresholdMs: null,
    keyword: null,
    keywordCondition: null,
    config: {},
    anomalyDetectionEnabled: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

function event(partial: Partial<IntelligenceEvent>): IntelligenceEvent {
  return {
    id: 'e1',
    type: 'competitor_event',
    timestamp: new Date(),
    monitorId: 'c1',
    monitorName: 'GymGear',
    monitorUrl: 'https://gymgear.com',
    competitorEventType: 'price_changed',
    payload: {},
    ...partial,
  };
}

function feedItem(partial: Partial<FeedItem>): FeedItem {
  return {
    id: 'fi1',
    kind: 'incident.opened',
    title: 'Checkout unreachable',
    subtitle: 'HTTP 503',
    href: '/incidents/1',
    occurredAt: new Date().toISOString(),
    monitorName: 'Checkout',
    ...partial,
  };
}

describe('pickScenario', () => {
  it('returns "issue" when a monitor is down', () => {
    expect(pickScenario([monitor({ currentStatus: 'down' })], 0, [])).toBe('issue');
  });

  it('returns "issue" on a recent outage even with no down monitors', () => {
    expect(pickScenario([monitor({})], 0, [feedItem({ kind: 'incident.resolved' })])).toBe('issue');
  });

  it('returns "high" when many competitor events arrived in 24h', () => {
    expect(pickScenario([monitor({})], 7, [])).toBe('high');
  });

  it('returns "quiet" when the day is calm', () => {
    expect(pickScenario([monitor({})], 1, [])).toBe('quiet');
  });
});

describe('groupByCompetitor', () => {
  it('groups events and sorts by count descending', () => {
    const groups = groupByCompetitor([
      event({ monitorId: 'a', monitorName: 'A' }),
      event({ monitorId: 'b', monitorName: 'B' }),
      event({ monitorId: 'a', monitorName: 'A' }),
      event({ monitorId: 'a', monitorName: 'A' }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.monitorId).toBe('a');
    expect(groups[0]?.count).toBe(3);
    expect(groups[1]?.count).toBe(1);
  });

  it('skips non-competitor events', () => {
    const groups = groupByCompetitor([
      event({ type: 'content_change', monitorId: 'a' }),
      event({ monitorId: 'b' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.monitorId).toBe('b');
  });
});

describe('buildBriefingHeadline', () => {
  it('issue: emphasizes the down monitor name in red', () => {
    const h = buildBriefingHeadline(
      'issue',
      [monitor({ name: 'Checkout', currentStatus: 'down' })],
      0,
      [],
      0,
      undefined
    );
    expect(h.parts[0]?.emphasized?.tone).toBe('red');
    expect(h.parts[0]?.emphasized?.text).toContain('Checkout');
  });

  it('high: leads with the busiest competitor', () => {
    const groups = groupByCompetitor([
      event({ monitorId: 'g', monitorName: 'GymGear' }),
      event({ monitorId: 'g', monitorName: 'GymGear' }),
      event({ monitorId: 'b', monitorName: 'BestGear' }),
    ]);
    const h = buildBriefingHeadline('high', [], 3, groups, 2, undefined);
    expect(h.parts[0]?.emphasized?.text).toContain('GymGear moved 2');
  });

  it('quiet with no competitors: prompts adding one', () => {
    const h = buildBriefingHeadline('quiet', [], 0, [], 0, undefined);
    expect(h.parts[0]?.before).toContain('No competitors yet');
  });

  it('quiet with competitors: reassures', () => {
    const h = buildBriefingHeadline('quiet', [monitor({})], 0, [], 3, undefined);
    expect(h.parts[0]?.emphasized?.text).toContain('No significant competitor moves');
    expect(h.parts[1]?.emphasized?.tone).toBe('green');
  });
});

describe('buildLeadAction', () => {
  it('issue: routes to the down monitor', () => {
    const lead = buildLeadAction(
      'issue',
      [monitor({ id: 'mx', name: 'Storefront', currentStatus: 'down' })],
      [],
      undefined,
      undefined
    );
    expect(lead.sev).toBe('high');
    expect(lead.href).toBe('/monitors/mx');
    expect(lead.title).toContain('Storefront');
  });

  it('issue: routes to an open incident when no monitor is down', () => {
    const incident = feedItem({ id: 'i1', href: '/incidents/i1', title: 'API errors' });
    const lead = buildLeadAction('issue', [monitor({})], [], undefined, incident);
    expect(lead.href).toBe('/incidents/i1');
    expect(lead.title).toBe('API errors');
  });

  it('high: routes to the busiest competitor in the wire', () => {
    const groups = groupByCompetitor([
      event({ monitorId: 'top', monitorName: 'TopCo' }),
      event({ monitorId: 'top', monitorName: 'TopCo' }),
    ]);
    const lead = buildLeadAction('high', [], groups, undefined, undefined);
    expect(lead.href).toBe('/wire/competitors/top?tab=events');
  });

  it('quiet: shieldCheck "all clear" pointing to the wire', () => {
    const lead = buildLeadAction('quiet', [monitor({})], [], undefined, undefined);
    expect(lead.icon).toBe('shieldCheck');
    expect(lead.sev).toBe('low');
    expect(lead.href).toBe('/wire');
  });
});

describe('buildBusinessStats', () => {
  it('returns exactly four stats', () => {
    const stats = buildBusinessStats(2, 5, 0, 1, 3, [monitor({})], 99.97, 'quiet');
    expect(stats).toHaveLength(4);
  });

  it('flags down monitors in red', () => {
    const stats = buildBusinessStats(0, 0, 0, 0, 0, [monitor({ currentStatus: 'down' })], 99, 'issue');
    expect(stats.some((s) => s.tone === 'red' && s.head.includes('down'))).toBe(true);
  });

  it('switches the fourth stat to "pricing pressure" on high-activity days', () => {
    const stats = buildBusinessStats(8, 12, 4, 3, 5, [monitor({})], 99.95, 'high');
    expect(stats[3]?.head).toBe('Pricing pressure rising');
    expect(stats[3]?.tone).toBe('amber');
  });
});

describe('getRecentOutage / getOpenIncident', () => {
  it('finds incidents within 24h', () => {
    const recent = feedItem({ kind: 'incident.opened', occurredAt: new Date().toISOString() });
    const old = feedItem({
      id: 'old',
      kind: 'incident.opened',
      occurredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    });
    expect(getRecentOutage([recent, old])?.id).toBe(recent.id);
  });

  it('returns an open incident when no resolved counterpart exists', () => {
    const open = feedItem({ id: 'open', kind: 'incident.opened' });
    expect(getOpenIncident([open])?.id).toBe('open');
  });

  it('considers an incident resolved if a later resolved entry shares its ID', () => {
    const open = feedItem({
      id: 'incident-open:abc123',
      kind: 'incident.opened',
      occurredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });
    const resolved = feedItem({
      id: 'incident-resolved:abc123',
      kind: 'incident.resolved',
      occurredAt: new Date().toISOString(),
    });
    expect(getOpenIncident([open, resolved])).toBeUndefined();
  });

  it('does not consider an incident resolved when the resolved entry is for a different incident', () => {
    const open = feedItem({
      id: 'incident-open:abc123',
      kind: 'incident.opened',
      occurredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });
    const resolved = feedItem({
      id: 'incident-resolved:xyz999',
      kind: 'incident.resolved',
      occurredAt: new Date().toISOString(),
    });
    expect(getOpenIncident([open, resolved])?.id).toBe('incident-open:abc123');
  });
});

describe('reliabilityDirection', () => {
  it('classifies improving, steady, and degrading', () => {
    expect(reliabilityDirection(99.97)).toBe('up');
    expect(reliabilityDirection(99.5)).toBe('flat');
    expect(reliabilityDirection(98)).toBe('down');
    expect(reliabilityDirection(undefined)).toBe('flat');
  });
});

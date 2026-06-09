import type { IntelligenceEvent } from '@/lib/repositories/intelligence';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { FeedItem } from '@/lib/repositories/notifications-feed';

export type Scenario = 'high' | 'quiet' | 'issue';

export interface CompetitorEventGroup {
  monitorId: string;
  monitorName: string;
  count: number;
}

export interface BriefingSentence {
  before: string;
  emphasized?: { text: string; tone: 'text' | 'red' | 'green' };
  after: string;
}

export interface BriefingHeadline {
  parts: BriefingSentence[];
}

const HIGH_THRESHOLD = 6;
const PRICING_TYPES = new Set(['price_changed', 'sale_started', 'sale_ended']);

function downMonitorsCount(monitors: MonitorRow[]): number {
  return monitors.filter((m) => m.currentStatus === 'down').length;
}

function recentOutageItem(items: FeedItem[]): FeedItem | undefined {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return items.find(
    (i) =>
      (i.kind === 'incident.opened' || i.kind === 'incident.resolved') &&
      new Date(i.occurredAt).getTime() >= cutoff
  );
}

function openIncidentItem(items: FeedItem[]): FeedItem | undefined {
  const opened = items.filter((i) => i.kind === 'incident.opened');
  return opened.find(
    (o) =>
      !items.some(
        (r) =>
          r.kind === 'incident.resolved' &&
          r.subtitle.includes(o.title) &&
          new Date(r.occurredAt) > new Date(o.occurredAt)
      )
  );
}

export function pickScenario(
  monitors: MonitorRow[],
  competitorEvents24h: number,
  notifications: FeedItem[]
): Scenario {
  if (downMonitorsCount(monitors) > 0 || openIncidentItem(notifications)) return 'issue';
  if (recentOutageItem(notifications)) return 'issue';
  if (competitorEvents24h >= HIGH_THRESHOLD) return 'high';
  return 'quiet';
}

export function groupByCompetitor(events: IntelligenceEvent[]): CompetitorEventGroup[] {
  const map = new Map<string, CompetitorEventGroup>();
  for (const e of events) {
    if (e.type !== 'competitor_event') continue;
    const existing = map.get(e.monitorId);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(e.monitorId, { monitorId: e.monitorId, monitorName: e.monitorName, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function buildBriefingHeadline(
  scenario: Scenario,
  monitors: MonitorRow[],
  competitorEvents24h: number,
  groups: CompetitorEventGroup[],
  activeCompetitorCount: number,
  outage: FeedItem | undefined
): BriefingHeadline {
  if (scenario === 'issue') {
    const downName = monitors.find((m) => m.currentStatus === 'down')?.name;
    if (downName) {
      return {
        parts: [
          {
            before: '',
            emphasized: { text: `${downName} is currently down.`, tone: 'red' },
            after: ' Your team should investigate immediately.',
          },
        ],
      };
    }
    if (outage) {
      return {
        parts: [
          {
            before: '',
            emphasized: { text: `${outage.title} was recently flagged.`, tone: 'red' },
            after: ` ${outage.subtitle || 'Worth confirming nothing slipped through.'}`,
          },
        ],
      };
    }
    return {
      parts: [
        {
          before: '',
          emphasized: { text: 'A reliability issue was detected.', tone: 'red' },
          after: ' Review the command center to confirm everything has recovered.',
        },
      ],
    };
  }

  if (scenario === 'high') {
    const top = groups[0];
    const second = groups[1];
    if (top) {
      const topClause: BriefingSentence = {
        before: '',
        emphasized: {
          text: `${top.monitorName} moved ${top.count} time${top.count === 1 ? '' : 's'} in the last 24 hours`,
          tone: 'text',
        },
        after: second
          ? `, and ${second.monitorName} also pushed ${second.count} update${second.count === 1 ? '' : 's'}.`
          : '.',
      };
      const others = groups.length > 2
        ? ` ${groups.length - 2} other competitor${groups.length - 2 === 1 ? '' : 's'} moved today.`
        : '';
      return {
        parts: [
          topClause,
          { before: others, after: '' },
        ],
      };
    }
    return {
      parts: [
        {
          before: '',
          emphasized: {
            text: `${competitorEvents24h} competitor moves in the last 24 hours.`,
            tone: 'text',
          },
          after: ' Review the Wire for full context.',
        },
      ],
    };
  }

  if (activeCompetitorCount === 0) {
    return {
      parts: [
        {
          before: 'No competitors yet. ',
          emphasized: {
            text: 'Add a competitor to start tracking the market.',
            tone: 'text',
          },
          after: '',
        },
      ],
    };
  }

  return {
    parts: [
      {
        before: '',
        emphasized: {
          text: 'No significant competitor moves in the last 24 hours.',
          tone: 'text',
        },
        after: ` Your store stayed `,
      },
      {
        before: '',
        emphasized: { text: 'healthy', tone: 'green' },
        after: ', and nothing needs you right now.',
      },
    ],
  };
}

export interface LeadAction {
  sev: 'high' | 'med' | 'low';
  icon: 'trendingDown' | 'shieldCheck' | 'circleAlert' | 'flame';
  tag: string;
  title: string;
  detail: string;
  cta: string;
  href: string;
}

export function buildLeadAction(
  scenario: Scenario,
  monitors: MonitorRow[],
  groups: CompetitorEventGroup[],
  outage: FeedItem | undefined,
  openIncident: FeedItem | undefined
): LeadAction {
  if (scenario === 'issue') {
    const down = monitors.find((m) => m.currentStatus === 'down');
    if (down) {
      return {
        sev: 'high',
        icon: 'circleAlert',
        tag: 'Needs you now',
        title: `${down.name} is down`,
        detail: `The monitor at ${down.url} is currently unreachable. Check the incident timeline for context.`,
        cta: 'View monitor',
        href: `/monitors/${down.id}`,
      };
    }
    if (openIncident) {
      return {
        sev: 'high',
        icon: 'circleAlert',
        tag: 'Open incident',
        title: openIncident.title,
        detail: openIncident.subtitle || 'An incident is currently open. Review the timeline.',
        cta: 'Open incident',
        href: openIncident.href || '/incidents',
      };
    }
    if (outage) {
      return {
        sev: 'high',
        icon: 'circleAlert',
        tag: 'Resolved, needs a look',
        title: outage.title,
        detail: outage.subtitle || 'Recently flagged and auto-recovered. Worth confirming.',
        cta: outage.href ? 'View details' : 'Open incidents',
        href: outage.href || '/incidents',
      };
    }
  }

  if (scenario === 'high') {
    const top = groups[0];
    if (top) {
      return {
        sev: 'high',
        icon: 'trendingDown',
        tag: 'Act today',
        title: `${top.monitorName} is the busiest today`,
        detail: `They pushed ${top.count} update${top.count === 1 ? '' : 's'} in the last 24 hours. Review what changed and decide whether to respond.`,
        cta: 'View competitor',
        href: `/wire/competitors/${top.monitorId}?tab=events`,
      };
    }
    return {
      sev: 'med',
      icon: 'flame',
      tag: 'Act today',
      title: 'Competitor activity is elevated',
      detail: 'Several competitors moved in the last 24 hours. Browse the Wire for the full story.',
      cta: 'Open the Wire',
      href: '/wire',
    };
  }

  return {
    sev: 'low',
    icon: 'shieldCheck',
    tag: 'All clear',
    title: 'The market is calm and your store is healthy',
    detail:
      'We are still watching every monitor and competitor in the background. We will surface anything that matters the moment it happens.',
    cta: 'Browse the Wire',
    href: '/wire',
  };
}

export interface BusinessStat {
  head: string;
  sub: string;
  tone: 'text' | 'green' | 'amber' | 'red';
}

export function buildBusinessStats(
  competitorEvents24h: number,
  competitorEvents7d: number,
  activeCompetitorCount: number,
  totalCompetitorCount: number,
  monitors: MonitorRow[],
  reliabilityRate: number | undefined,
  scenario: Scenario
): BusinessStat[] {
  const stats: BusinessStat[] = [];

  if (competitorEvents24h === 0) {
    stats.push({ head: 'No competitor moves', sub: 'last 24 hours', tone: 'text' });
  } else {
    stats.push({
      head: `${competitorEvents24h} competitor move${competitorEvents24h === 1 ? '' : 's'}`,
      sub: 'last 24 hours',
      tone: scenario === 'high' ? 'amber' : 'text',
    });
  }

  if (totalCompetitorCount === 0) {
    stats.push({ head: 'No competitors tracked', sub: 'add your first', tone: 'text' });
  } else if (activeCompetitorCount === 0) {
    stats.push({
      head: `0 of ${totalCompetitorCount} active`,
      sub: 'market is calm',
      tone: 'text',
    });
  } else {
    stats.push({
      head: `${activeCompetitorCount} of ${totalCompetitorCount} active`,
      sub:
        activeCompetitorCount < totalCompetitorCount
          ? `${totalCompetitorCount - activeCompetitorCount} stayed quiet`
          : 'all competitors moved',
      tone: 'text',
    });
  }

  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;
  if (downCount > 0) {
    stats.push({
      head: `${downCount} monitor${downCount === 1 ? '' : 's'} down`,
      sub: 'needs attention',
      tone: 'red',
    });
  } else if (monitors.length === 0) {
    stats.push({ head: 'No monitors yet', sub: 'add your first', tone: 'text' });
  } else {
    stats.push({
      head: 'Store healthy all week',
      sub: `${monitors.length} monitor${monitors.length === 1 ? '' : 's'} operational`,
      tone: 'green',
    });
  }

  if (reliabilityRate === undefined) {
    stats.push({ head: 'Reliability calculating', sub: 'first 30 days', tone: 'text' });
  } else if (reliabilityRate >= 99.9) {
    stats.push({
      head: 'Reliability strong',
      sub: `${reliabilityRate.toFixed(2)}% over 30d`,
      tone: 'green',
    });
  } else if (reliabilityRate >= 99) {
    stats.push({
      head: 'Reliability steady',
      sub: `${reliabilityRate.toFixed(2)}% over 30d`,
      tone: 'text',
    });
  } else {
    stats.push({
      head: 'Reliability degrading',
      sub: `${reliabilityRate.toFixed(2)}% over 30d`,
      tone: 'amber',
    });
  }

  if (scenario === 'high' && competitorEvents7d > 0) {
    const pricingEvents = competitorEvents7d;
    if (pricingEvents > 0) {
      stats[stats.length - 1] = {
        head: 'Pricing pressure rising',
        sub: `${pricingEvents} move${pricingEvents === 1 ? '' : 's'} in 7d`,
        tone: 'amber',
      };
    }
  }

  return stats.slice(0, 4);
}

export function countPricingEvents(events: IntelligenceEvent[]): number {
  return events.filter(
    (e) => e.type === 'competitor_event' && PRICING_TYPES.has(e.competitorEventType ?? '')
  ).length;
}

export function getRecentOutage(items: FeedItem[]): FeedItem | undefined {
  return recentOutageItem(items);
}

export function getOpenIncident(items: FeedItem[]): FeedItem | undefined {
  return openIncidentItem(items);
}

export function reliabilityDirection(rate: number | undefined): 'up' | 'flat' | 'down' {
  if (rate === undefined) return 'flat';
  if (rate >= 99.9) return 'up';
  if (rate >= 99) return 'flat';
  return 'down';
}

export function pseudoReliabilitySpark(rate: number | undefined): number[] {
  const target = rate === undefined ? 99.5 : rate;
  const len = 12;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    const drift = Math.sin(i * 0.7) * 0.4;
    const ramp = (i / (len - 1)) * (target - 99) * 0.6;
    out.push(Math.max(95, Math.min(100, 99.5 + drift + ramp)));
  }
  out[len - 1] = target;
  return out;
}

import type { IntelligenceEvent } from '@/lib/repositories/intelligence';
import type { CompetitorItem } from '@/lib/hooks/use-competitors';

export type Trend = 'rising' | 'quiet' | 'silent';

export interface CompetitorRollup {
  competitor: CompetitorItem;
  week: number;
  month: number;
  spark: number[];
  trend: Trend;
  lastEvent: IntelligenceEvent | undefined;
  events: IntelligenceEvent[];
}

const MS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

export const EVENT_LABEL: Record<string, string> = {
  price_changed: 'Price change',
  product_added: 'New product',
  product_removed: 'Product removed',
  stock_changed: 'Stock change',
  out_of_stock: 'Out of stock',
  back_in_stock: 'Back in stock',
  sale_started: 'Sale started',
  sale_ended: 'Sale ended',
  site_changed: 'Site change',
  promo_detected: 'Promo detected',
};

export function eventLabel(type: string | undefined): string {
  if (!type) return 'Activity';
  return EVENT_LABEL[type] ?? 'Competitor event';
}

export function binBy7Days(events: IntelligenceEvent[], nowMs: number = Date.now()): number[] {
  const bins = new Array<number>(7).fill(0);
  for (const e of events) {
    const daysAgo = Math.floor((nowMs - new Date(e.timestamp).getTime()) / MS.day);
    const idx = 6 - daysAgo;
    if (idx >= 0 && idx < 7) bins[idx]!++;
  }
  return bins;
}

export function computeTrend(events: IntelligenceEvent[], nowMs: number = Date.now()): Trend {
  let last7 = 0;
  let prev7 = 0;
  for (const e of events) {
    const age = nowMs - new Date(e.timestamp).getTime();
    if (age < MS.week) last7++;
    else if (age < MS.week * 2) prev7++;
  }
  if (last7 === 0 && prev7 === 0) return 'silent';
  if (last7 > prev7) return 'rising';
  return 'quiet';
}

export function rollupByCompetitor(
  competitors: CompetitorItem[],
  events: IntelligenceEvent[],
  nowMs: number = Date.now()
): CompetitorRollup[] {
  const monthFloor = nowMs - 30 * MS.day;
  const weekFloor = nowMs - MS.week;

  const byMonitor = new Map<string, IntelligenceEvent[]>();
  for (const e of events) {
    if (e.type !== 'competitor_event') continue;
    const ts = new Date(e.timestamp).getTime();
    if (ts < monthFloor) continue;
    const list = byMonitor.get(e.monitorId);
    if (list) list.push(e);
    else byMonitor.set(e.monitorId, [e]);
  }

  for (const list of byMonitor.values()) {
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  const rollups: CompetitorRollup[] = competitors.map((c) => {
    const evs = byMonitor.get(c.id) ?? [];
    const week = evs.filter((e) => new Date(e.timestamp).getTime() >= weekFloor).length;
    return {
      competitor: c,
      week,
      month: evs.length,
      spark: binBy7Days(evs, nowMs),
      trend: computeTrend(evs, nowMs),
      lastEvent: evs[0],
      events: evs,
    };
  });

  return rollups.sort((a, b) => {
    if (b.month !== a.month) return b.month - a.month;
    return b.week - a.week;
  });
}

export function formatRelative(ts: Date | string, nowMs: number = Date.now()): string {
  const diff = nowMs - new Date(ts).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export interface WireSentenceStat {
  head: string;
  sub: string;
  tone: 'text' | 'amber' | 'green';
}

export function buildWireStats(
  events: IntelligenceEvent[],
  rollups: CompetitorRollup[]
): WireSentenceStat[] {
  const competitorEvents = events
    .filter((e) => e.type === 'competitor_event')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const activeRollups = rollups.filter((r) => r.month > 0);
  const monthTotal = activeRollups.reduce((sum, r) => sum + r.month, 0);
  const competitorCount = activeRollups.length;

  const top = activeRollups[0];

  const pricingCount = competitorEvents.filter(
    (e) => e.competitorEventType === 'price_changed' || e.competitorEventType === 'sale_started' || e.competitorEventType === 'sale_ended'
  ).length;
  const recent12 = competitorEvents.slice(0, 12);
  const recent12Pricing = recent12.filter(
    (e) => e.competitorEventType === 'price_changed' || e.competitorEventType === 'sale_started' || e.competitorEventType === 'sale_ended'
  ).length;

  const silent = rollups.find((r) => r.month === 0 && r.trend === 'silent');

  const stats: WireSentenceStat[] = [];

  stats.push({
    head:
      monthTotal === 0
        ? 'No moves this month'
        : `${monthTotal} ${monthTotal === 1 ? 'move' : 'moves'} this month`,
    sub:
      competitorCount === 0
        ? 'No competitor activity'
        : `across ${competitorCount} ${competitorCount === 1 ? 'competitor' : 'competitors'}`,
    tone: monthTotal >= 10 ? 'amber' : 'text',
  });

  stats.push(
    top
      ? {
          head: `${top.competitor.name} most active`,
          sub: `${top.week} ${top.week === 1 ? 'move' : 'moves'} in 7 days`,
          tone: 'text',
        }
      : {
          head: 'No top competitor yet',
          sub: 'Add a competitor to start',
          tone: 'text',
        }
  );

  stats.push({
    head:
      pricingCount === 0
        ? 'No pricing signals'
        : 'Pricing is the top signal',
    sub:
      recent12.length === 0
        ? 'Nothing to compare'
        : `${recent12Pricing} of last ${recent12.length} moves`,
    tone: pricingCount > 0 ? 'amber' : 'text',
  });

  stats.push(
    silent
      ? {
          head: `${silent.competitor.name} went silent`,
          sub: '0 moves in 30 days',
          tone: 'text',
        }
      : {
          head:
            activeRollups.length > 1
              ? 'All competitors active'
              : monthTotal > 0
                ? 'Watching steadily'
                : 'Quiet across the board',
          sub:
            activeRollups.length > 1
              ? 'No silent watchlist members'
              : 'No silent watchlist members',
          tone: 'green',
        }
  );

  return stats;
}

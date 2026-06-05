import { prisma } from '@beaconmon/db';
import { clampToPlanRetention, type Result, ok, err } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { competitorRepository } from './competitors';

export type IntelligenceEventType =
  | 'content_change'
  | 'pricing_change'
  | 'expiry_alert'
  | 'competitor_event';

export interface IntelligenceEvent {
  id: string;
  type: IntelligenceEventType;
  timestamp: Date;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  monitorSelector?: string;
  snapshotId?: string;
  diffSummary?: string;
  expiryType?: 'ssl' | 'domain';
  daysRemaining?: number;
  threshold?: number;
  competitorEventType?: string;
  payload?: Record<string, unknown>;
}

const PRICING_PATTERN = /price|pricing|\.price|#price|\/pricing/i;

function isPricingMonitor(url: string, selector?: string): boolean {
  return PRICING_PATTERN.test(url) || (selector ? PRICING_PATTERN.test(selector) : false);
}

export interface FindFeedOpts {
  limit: number;
  before?: Date;
  monitorId?: string;
  types?: string[];
  range?: '7d' | '30d' | '90d';
}

export interface FeedResult {
  events: IntelligenceEvent[];
  hasMore: boolean;
  activeCompetitorCount: number;
  last24hCompetitorEventCount: number;
}

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

export const intelligenceRepository = {
  async findFeed(teamId: string, plan: PlanTier, opts: FindFeedOpts): Promise<Result<FeedResult, string>> {
    try {
      const rangeDays = RANGE_DAYS[opts.range ?? '30d'] ?? 30;
      const rangeFrom = new Date();
      rangeFrom.setUTCDate(rangeFrom.getUTCDate() - rangeDays);
      rangeFrom.setUTCHours(0, 0, 0, 0);

      const from = clampToPlanRetention(rangeFrom, plan);
      const { limit, before, monitorId } = opts;
      const types = opts.types ?? ['content_change', 'pricing_change', 'expiry_alert', 'competitor_event'];

      const wantsContent = types.some((t) => t === 'content_change' || t === 'pricing_change');
      const wantsCompetitorEvent = types.includes('competitor_event');

      const last24hFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [snapshotRows, competitorEventRows, activeCompetitorCount, last24hCompetitorEventCount] = await Promise.all([
        wantsContent
          ? prisma.contentSnapshot.findMany({
              where: {
                teamId,
                competitorPageId: { not: null },
                capturedAt: { gte: from, ...(before ? { lt: before } : {}) },
                ...(monitorId ? { competitorPage: { competitorId: monitorId } } : {}),
              },
              select: {
                id: true,
                competitorPageId: true,
                capturedAt: true,
                diffSummary: true,
                competitorPage: { select: { url: true, label: true, selector: true, competitor: { select: { id: true, name: true } } } },
              },
              orderBy: { capturedAt: 'desc' },
              take: limit + 1,
            })
          : Promise.resolve([]),
        wantsCompetitorEvent
          ? prisma.competitorEvent.findMany({
              where: {
                teamId,
                ...(monitorId ? { competitorId: monitorId } : {}),
                detectedAt: { gte: from, ...(before ? { lt: before } : {}) },
              },
              select: {
                id: true,
                competitorId: true,
                pageId: true,
                productId: true,
                type: true,
                payload: true,
                detectedAt: true,
                competitor: { select: { id: true, name: true, domain: true } },
              },
              orderBy: { detectedAt: 'desc' },
              take: limit + 1,
            })
          : Promise.resolve([]),
        competitorRepository.countActive(teamId),
        prisma.competitorEvent.count({
          where: { teamId, detectedAt: { gte: last24hFrom } },
        }),
      ]);

      const contentEvents: IntelligenceEvent[] = snapshotRows.map((r) => {
        const page = r.competitorPage!;
        const selector = page.selector ?? undefined;
        const derivedType: IntelligenceEventType = isPricingMonitor(page.url, selector)
          ? 'pricing_change'
          : 'content_change';
        return {
          id: r.id,
          type: derivedType,
          timestamp: r.capturedAt,
          monitorId: page.competitor.id,
          monitorName: page.competitor.name,
          monitorUrl: page.url,
          monitorSelector: selector,
          snapshotId: r.id,
          diffSummary: r.diffSummary ?? undefined,
        };
      });

      const competitorEvents: IntelligenceEvent[] = competitorEventRows.map((r) => ({
        id: r.id,
        type: 'competitor_event' as const,
        timestamp: r.detectedAt,
        monitorId: r.competitor.id,
        monitorName: r.competitor.name,
        monitorUrl: r.competitor.domain,
        competitorEventType: r.type,
        payload: r.payload as Record<string, unknown>,
      }));

      const filteredContent = contentEvents.filter((e) => types.includes(e.type));

      const merged = [...filteredContent, ...competitorEvents].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      const hasMore = merged.length > limit;
      const events = merged.slice(0, limit);

      return ok({ events, hasMore, activeCompetitorCount, last24hCompetitorEventCount });
    } catch (e) {
      return err(e instanceof Error ? e.message : 'unknown_error');
    }
  },
};

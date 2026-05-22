import { prisma } from '@beaconmon/db';
import { clampToPlanRetention, type Result, ok, err } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { competitorRepository } from './competitors';

export type IntelligenceEventType = 'content_change' | 'pricing_change' | 'expiry_alert';

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
      const types = opts.types ?? ['content_change', 'pricing_change', 'expiry_alert'];

      const wantsContent = types.some((t) => t === 'content_change' || t === 'pricing_change');
      const wantsExpiry = types.includes('expiry_alert');

      const monitorFilter = monitorId ? { id: monitorId } : {};

      const [snapshotRows, expiryRows, activeCompetitorCount] = await Promise.all([
        wantsContent
          ? prisma.contentSnapshot.findMany({
              where: {
                teamId,
                monitor: { isCompetitor: true, deletedAt: null, ...monitorFilter },
                capturedAt: { gte: from, ...(before ? { lt: before } : {}) },
              },
              select: {
                id: true,
                monitorId: true,
                capturedAt: true,
                diffSummary: true,
                monitor: { select: { name: true, url: true, config: true } },
              },
              orderBy: { capturedAt: 'desc' },
              take: limit + 1,
            })
          : Promise.resolve([]),
        wantsExpiry
          ? prisma.expiryAlert.findMany({
              where: {
                teamId,
                sentAt: { gte: from, ...(before ? { lt: before } : {}) },
                monitor: { isCompetitor: true, deletedAt: null, ...monitorFilter },
              },
              select: {
                id: true,
                type: true,
                daysRemaining: true,
                threshold: true,
                sentAt: true,
                monitor: { select: { id: true, name: true, url: true } },
              },
              orderBy: { sentAt: 'desc' },
              take: limit + 1,
            })
          : Promise.resolve([]),
        competitorRepository.countActive(teamId),
      ]);

      const contentEvents: IntelligenceEvent[] = snapshotRows.map((r) => {
        const config = r.monitor.config as { selector?: string } | null;
        const selector = config?.selector;
        const derivedType: IntelligenceEventType = isPricingMonitor(r.monitor.url, selector)
          ? 'pricing_change'
          : 'content_change';
        return {
          id: r.id,
          type: derivedType,
          timestamp: r.capturedAt,
          monitorId: r.monitorId,
          monitorName: r.monitor.name,
          monitorUrl: r.monitor.url,
          monitorSelector: selector,
          snapshotId: r.id,
          diffSummary: r.diffSummary ?? undefined,
        };
      });

      const expiryEvents: IntelligenceEvent[] = expiryRows.map((r) => ({
        id: r.id,
        type: 'expiry_alert',
        timestamp: r.sentAt,
        monitorId: r.monitor.id,
        monitorName: r.monitor.name,
        monitorUrl: r.monitor.url,
        expiryType: r.type as 'ssl' | 'domain',
        daysRemaining: r.daysRemaining,
        threshold: r.threshold,
      }));

      const filteredContent = contentEvents.filter((e) => types.includes(e.type));

      const merged = [...filteredContent, ...expiryEvents].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      const hasMore = merged.length > limit;
      const events = merged.slice(0, limit);

      return ok({ events, hasMore, activeCompetitorCount });
    } catch (e) {
      return err(e instanceof Error ? e.message : 'unknown_error');
    }
  },
};

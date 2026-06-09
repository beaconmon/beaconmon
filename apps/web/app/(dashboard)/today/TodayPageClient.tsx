'use client';

import { useMemo, useState, useEffect } from 'react';
import { MorningBriefing } from '@/components/dashboard/morning-briefing';
import { BusinessStatStrip } from '@/components/dashboard/business-stat-strip';
import { CommandCenter } from '@/components/dashboard/command-center';
import { TodayFeed } from '@/components/dashboard/today-feed';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useIntelligenceLastSeen } from '@/lib/hooks/use-intelligence-last-seen';
import { useReliability } from '@/lib/hooks/use-reliability';
import { useNotifications } from '@/lib/hooks/use-notifications';
import {
  pickScenario,
  groupByCompetitor,
  buildBriefingHeadline,
  buildLeadAction,
  buildBusinessStats,
  getRecentOutage,
  getOpenIncident,
  reliabilityDirection,
  pseudoReliabilitySpark,
} from '@/lib/today/derive';

export function TodayPageClient() {
  const { data: monitors, isLoading: monitorsLoading } = useMonitors();
  const {
    events: feedEvents,
    last24hCompetitorEventCount,
    activeCompetitorCount,
    isLoading: feedLoading,
  } = useIntelligenceFeed({ range: '7d' });
  const { data: reliability } = useReliability();
  const { previousLastSeenAt, isReady: lastSeenReady } = useIntelligenceLastSeen();
  const { data: notifications } = useNotifications();

  const resolvedMonitors = useMemo(() => monitors ?? [], [monitors]);
  const notificationItems = useMemo(() => notifications?.items ?? [], [notifications]);

  const [windowStartMs, setWindowStartMs] = useState<number>(() => Date.now() - 24 * 60 * 60 * 1000);
  useEffect(() => {
    const id = setInterval(() => setWindowStartMs(Date.now() - 24 * 60 * 60 * 1000), 60_000);
    return () => clearInterval(id);
  }, []);

  const competitorEvents = useMemo(
    () => feedEvents.filter((e) => e.type === 'competitor_event'),
    [feedEvents]
  );

  const competitorEvents24h = useMemo(
    () => competitorEvents.filter((e) => new Date(e.timestamp).getTime() >= windowStartMs),
    [competitorEvents, windowStartMs]
  );

  const totalCompetitorCount = useMemo(() => {
    const ids = new Set<string>();
    competitorEvents.forEach((e) => ids.add(e.monitorId));
    return Math.max(ids.size, activeCompetitorCount);
  }, [competitorEvents, activeCompetitorCount]);

  const newSinceLastVisit = useMemo(() => {
    if (!lastSeenReady || previousLastSeenAt === null) return 0;
    return competitorEvents.filter((e) => new Date(e.timestamp) > previousLastSeenAt).length;
  }, [competitorEvents, previousLastSeenAt, lastSeenReady]);

  const recentOutage = useMemo(() => getRecentOutage(notificationItems), [notificationItems]);
  const openIncident = useMemo(() => getOpenIncident(notificationItems), [notificationItems]);

  const scenario = useMemo(
    () => pickScenario(resolvedMonitors, competitorEvents24h.length, notificationItems),
    [resolvedMonitors, competitorEvents24h.length, notificationItems]
  );

  const groups = useMemo(
    () => groupByCompetitor(competitorEvents24h),
    [competitorEvents24h]
  );

  const headline = useMemo(
    () =>
      buildBriefingHeadline(
        scenario,
        resolvedMonitors,
        competitorEvents24h.length,
        groups,
        activeCompetitorCount,
        recentOutage
      ),
    [scenario, resolvedMonitors, competitorEvents24h.length, groups, activeCompetitorCount, recentOutage]
  );

  const lead = useMemo(
    () => buildLeadAction(scenario, resolvedMonitors, groups, recentOutage, openIncident),
    [scenario, resolvedMonitors, groups, recentOutage, openIncident]
  );

  const stats = useMemo(
    () =>
      buildBusinessStats(
        competitorEvents24h.length,
        competitorEvents.length,
        activeCompetitorCount,
        totalCompetitorCount,
        resolvedMonitors,
        reliability?.successRate,
        scenario
      ),
    [
      competitorEvents24h.length,
      competitorEvents.length,
      activeCompetitorCount,
      totalCompetitorCount,
      resolvedMonitors,
      reliability?.successRate,
      scenario,
    ]
  );

  const direction = reliabilityDirection(reliability?.successRate);
  const reliabilitySpark = useMemo(
    () => pseudoReliabilitySpark(reliability?.successRate),
    [reliability?.successRate]
  );

  if (monitorsLoading || feedLoading) {
    return (
      <div className="space-y-5">
        <div
          className="h-44 animate-pulse rounded-lg"
          style={{
            background: 'var(--brand-bg2)',
            boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
          }}
        />
        <div
          className="h-16 animate-pulse rounded-lg"
          style={{
            background: 'var(--brand-bg2)',
            boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
          }}
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div
            className="h-80 animate-pulse rounded-lg"
            style={{
              background: 'var(--brand-bg2)',
              boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
            }}
          />
          <div
            className="h-80 animate-pulse rounded-lg"
            style={{
              background: 'var(--brand-bg2)',
              boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MorningBriefing
        scenario={scenario}
        headline={headline}
        lead={lead}
        newSinceLastVisit={newSinceLastVisit}
        hasEverVisited={lastSeenReady && previousLastSeenAt !== null}
      />

      <BusinessStatStrip stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <TodayFeed
          events={feedEvents}
          last24hCount={last24hCompetitorEventCount}
          previousLastSeenAt={lastSeenReady ? previousLastSeenAt : null}
        />
        <CommandCenter
          monitors={resolvedMonitors}
          reliabilityRate={reliability?.successRate}
          reliabilityDirection={direction}
          reliabilitySpark={reliabilitySpark}
          openIncident={openIncident}
          recentOutage={recentOutage}
        />
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { TodayHero } from '@/components/dashboard/today-hero';
import { TodayFeed } from '@/components/dashboard/today-feed';
import { MonitorsRailCard } from '@/components/dashboard/monitors-rail-card';
import { ReliabilityPanel } from '@/components/dashboard/reliability-panel';
import { RecentAlertsPanel } from '@/components/dashboard/recent-alerts-panel';
import { useMonitors, useMonitorSummaries } from '@/lib/hooks/use-monitors';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useIntelligenceLastSeen } from '@/lib/hooks/use-intelligence-last-seen';
import { useSession } from '@/lib/hooks/use-session';
import { useReliability } from '@/lib/hooks/use-reliability';

export function TodayPageClient() {
  const { data: monitors = [] } = useMonitors();
  const { data: summaries = {} } = useMonitorSummaries();
  const {
    events: feedEvents,
    last24hCompetitorEventCount,
    activeCompetitorCount,
  } = useIntelligenceFeed({ range: '7d' });
  const { data: session } = useSession();
  const { data: reliability } = useReliability();
  const { previousLastSeenAt, isReady: lastSeenReady } = useIntelligenceLastSeen();

  const plan = session?.plan ?? 'free';
  const primaryMonitor = monitors.find((m) => m.currentStatus === 'down') ?? monitors[0];

  const newSinceLastVisit = useMemo(() => {
    if (!lastSeenReady || previousLastSeenAt === null) return 0;
    return feedEvents.filter(
      (e) => e.type === 'competitor_event' && new Date(e.timestamp) > previousLastSeenAt
    ).length;
  }, [feedEvents, previousLastSeenAt, lastSeenReady]);

  return (
    <div className="space-y-5">
      <TodayHero
        monitors={monitors}
        feedEvents={feedEvents}
        activeCompetitorCount={activeCompetitorCount}
        reliabilityRate={reliability?.successRate}
        newSinceLastVisit={newSinceLastVisit}
        hasEverVisited={lastSeenReady && previousLastSeenAt !== null}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <TodayFeed
          events={feedEvents}
          last24hCount={last24hCompetitorEventCount}
          previousLastSeenAt={lastSeenReady ? previousLastSeenAt : null}
        />

        <div className="space-y-4">
          <MonitorsRailCard monitors={monitors} summaries={summaries} />
          <ReliabilityPanel primaryMonitor={primaryMonitor} plan={plan} />
          <RecentAlertsPanel />
        </div>
      </div>
    </div>
  );
}

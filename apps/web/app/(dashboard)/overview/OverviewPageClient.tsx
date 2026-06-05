'use client';

import { OverviewHero } from '@/components/dashboard/overview-hero';
import { OverviewMonitorsTable } from '@/components/dashboard/overview-monitors-table';
import { ReliabilityPanel } from '@/components/dashboard/reliability-panel';
import { RecentAlertsPanel } from '@/components/dashboard/recent-alerts-panel';
import { CompetitorSignalsPanel } from '@/components/dashboard/competitor-signals-panel';
import { useMonitors, useMonitorSummaries } from '@/lib/hooks/use-monitors';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useSession } from '@/lib/hooks/use-session';
import { useReliability } from '@/lib/hooks/use-reliability';

export function OverviewPageClient() {
  const { data: monitors = [] } = useMonitors();
  const { data: summaries = {} } = useMonitorSummaries();
  const { events: feedEvents, last24hCompetitorEventCount } = useIntelligenceFeed({ range: '7d' });
  const { data: session } = useSession();
  const { data: reliability } = useReliability();

  const plan = session?.plan ?? 'free';
  const primaryMonitor = monitors.find((m) => m.currentStatus === 'down') ?? monitors[0];
  const last24hCount = last24hCompetitorEventCount;

  return (
    <div className="space-y-5">
      <OverviewHero monitors={monitors} feedEvents={feedEvents} reliabilityRate={reliability?.successRate} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Left — monitors table */}
        <OverviewMonitorsTable monitors={monitors} summaries={summaries} />

        {/* Right rail */}
        <div className="space-y-4">
          <CompetitorSignalsPanel events={feedEvents} last24hCount={last24hCount} />
          <ReliabilityPanel primaryMonitor={primaryMonitor} plan={plan} />
          <RecentAlertsPanel />
        </div>
      </div>
    </div>
  );
}

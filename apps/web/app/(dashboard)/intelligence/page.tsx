'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceFeed } from '@/components/intelligence/intelligence-feed';
import { IntelligenceFilters } from '@/components/intelligence/intelligence-filters';
import { IntelligenceUpgradeTeaser } from '@/components/intelligence/intelligence-upgrade-teaser';
import { IntelStatStrip } from '@/components/intelligence/intel-stat-strip';
import { TheWireBanner } from '@/components/intelligence/the-wire-banner';
import { CompetitorWatchlistPanel } from '@/components/intelligence/competitor-watchlist-panel';
import { CompetitorManagementSheet } from '@/components/intelligence/competitor-management-sheet';
import { DigestPreviewPanel } from '@/components/intelligence/digest-preview-panel';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useSession } from '@/lib/hooks/use-session';
import { PLAN_LIMITS } from '@beaconmon/types';
import { QueryState } from '@/components/dashboard/query-state';

function IntelligencePageInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const plan = session?.plan ?? 'free';

  const monitorId = searchParams.get('monitorId') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const range = (searchParams.get('range') as '7d' | '30d' | '90d' | null) ?? '30d';

  const [showCompetitorSheet, setShowCompetitorSheet] = useState(false);

  const { events, hasMore, activeCompetitorCount, isLoading, isError, loadMore, refresh } =
    useIntelligenceFeed({ monitorId, type, range });

  const { data: monitors } = useMonitors();
  const competitorMonitors = [] as NonNullable<typeof monitors>;

  const monitorIsCompetitorMap = new Map<string, boolean>();

  const isFreePlan = plan === 'free';
  const competitorLimit = PLAN_LIMITS[plan].competitorMonitors;
  const hasCompetitorAccess = competitorLimit !== 0;

  return (
    <div className="space-y-5">
      {isFreePlan ? (
        <IntelligenceUpgradeTeaser />
      ) : (
        <>
          {/* Stat strip */}
          <IntelStatStrip events={events} />

          {/* The Wire editorial banner */}
          <TheWireBanner plan={plan} />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* Left — feed */}
            <div className="space-y-4">
              {/* Filters */}
              <IntelligenceFilters events={events} />

              {/* Feed card */}
              <div
                className="overflow-hidden rounded-lg"
                style={{
                  background: 'var(--brand-bg2)',
                  boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
                }}
              >
                <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                    Activity feed
                  </p>
                  <span className="font-mono text-[11px] text-brand-muted">
                    {activeCompetitorCount} active
                  </span>
                </div>

                <QueryState
                  isLoading={isLoading && events.length === 0}
                  isError={isError}
                  onRetry={refresh}
                  skeletonRows={5}
                >
                  {events.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Brain className="mb-3 h-10 w-10 text-brand-muted" />
                      <h3 className="text-sm font-medium text-brand-text">No activity yet</h3>
                      <p className="mt-1 max-w-xs text-sm text-brand-muted">
                        {activeCompetitorCount === 0
                          ? 'Add competitor monitors to start tracking changes.'
                          : 'No events match your current filters.'}
                      </p>
                      {activeCompetitorCount === 0 && hasCompetitorAccess && (
                        <Button size="sm" className="mt-4" onClick={() => setShowCompetitorSheet(true)}>
                          Add your first competitor
                        </Button>
                      )}
                    </div>
                  ) : (
                    <IntelligenceFeed
                      events={events}
                      hasMore={hasMore}
                      isLoading={isLoading}
                      onLoadMore={loadMore}
                      monitorIsCompetitorMap={monitorIsCompetitorMap}
                    />
                  )}
                </QueryState>
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-4">
              <CompetitorWatchlistPanel
                competitors={competitorMonitors}
                events={events}
                plan={plan}
                onChanged={refresh}
              />
              <DigestPreviewPanel />
            </div>
          </div>
        </>
      )}

      <CompetitorManagementSheet
        open={showCompetitorSheet}
        onOpenChange={setShowCompetitorSheet}
        plan={plan}
        onChanged={refresh}
      />
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <Suspense>
      <IntelligencePageInner />
    </Suspense>
  );
}

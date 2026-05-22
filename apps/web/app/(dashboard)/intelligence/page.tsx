'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceFeed } from '@/components/intelligence/intelligence-feed';
import { IntelligenceFilters } from '@/components/intelligence/intelligence-filters';
import { IntelligenceUpgradeTeaser } from '@/components/intelligence/intelligence-upgrade-teaser';
import { CompetitorManagementSheet } from '@/components/intelligence/competitor-management-sheet';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useSession } from '@/lib/hooks/use-session';
import { PLAN_LIMITS } from '@beaconmon/types';
import { QueryState } from '@/components/dashboard/query-state';

function IntelligencePageInner() {
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: session } = useSession();
  const plan = session?.plan ?? 'free';

  const monitorId = searchParams.get('monitorId') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const range = (searchParams.get('range') as '7d' | '30d' | '90d' | null) ?? '30d';

  const { events, hasMore, activeCompetitorCount, isLoading, isError, loadMore, refresh } =
    useIntelligenceFeed({ monitorId, type, range });

  const { data: monitors } = useMonitors();
  const competitorOptions = (monitors ?? [])
    .filter((m) => m.isCompetitor && m.isActive)
    .map((m) => ({ id: m.id, name: m.name }));

  const isFreePlan = plan === 'free';
  const competitorLimit = PLAN_LIMITS[plan].competitorMonitors;
  const hasCompetitorAccess = competitorLimit !== 0;

  function handleSheetChanged() {
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand-green-ink" />
            <h1 className="text-2xl font-semibold text-brand-text">Intelligence</h1>
          </div>
          <p className="mt-0.5 text-sm text-brand-muted">
            Track competitor pricing changes, content updates, and certificate health.
          </p>
        </div>

        {hasCompetitorAccess && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="gap-1.5 border-brand-line"
          >
            <Users className="h-3.5 w-3.5" />
            Manage competitors
          </Button>
        )}
      </div>

      {isFreePlan ? (
        <IntelligenceUpgradeTeaser />
      ) : (
        <>
          {activeCompetitorCount > 0 && (
            <IntelligenceFilters competitors={competitorOptions} />
          )}

          <QueryState
            isLoading={isLoading && events.length === 0}
            isError={isError}
            onRetry={refresh}
            skeletonRows={5}
          >
            {events.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-brand-line bg-brand-surface py-16 text-center">
                <Brain className="h-10 w-10 text-brand-muted mb-3" />
                <h3 className="text-sm font-medium text-brand-text">No activity yet</h3>
                <p className="mt-1 text-sm text-brand-muted max-w-xs">
                  {activeCompetitorCount === 0
                    ? 'Add competitor monitors to start tracking changes.'
                    : 'No events match your current filters.'}
                </p>
                {activeCompetitorCount === 0 && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setSheetOpen(true)}
                  >
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
              />
            )}
          </QueryState>
        </>
      )}

      <CompetitorManagementSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plan={plan}
        onChanged={handleSheetChanged}
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

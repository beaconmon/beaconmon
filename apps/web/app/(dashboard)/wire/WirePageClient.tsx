'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IntelligenceUpgradeTeaser } from '@/components/intelligence/intelligence-upgrade-teaser';
import { TheWireBanner } from '@/components/intelligence/the-wire-banner';
import { CompetitorManagementSheet } from '@/components/intelligence/competitor-management-sheet';
import { AddCompetitorWizard } from '@/components/competitors/add-competitor-wizard';
import { RestoreBanner } from '@/components/competitors/restore-banner';
import { WireStatStrip } from '@/components/wire/wire-stat-strip';
import { CompetitorGroupCard } from '@/components/wire/competitor-group-card';
import { CompetitorJumpStrip } from '@/components/wire/competitor-jump-strip';
import { DigestPreviewCard } from '@/components/wire/digest-preview-card';
import { CompetitorsAssessmentTable } from '@/components/wire/competitors-assessment-table';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useCompetitors } from '@/lib/hooks/use-competitors';
import { useSession } from '@/lib/hooks/use-session';
import { QueryState } from '@/components/dashboard/query-state';
import { buildWireStats, rollupByCompetitor } from '@/lib/wire/rollup';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';

const VALID_TABS = ['feed', 'competitors'] as const;
type Tab = (typeof VALID_TABS)[number];

export function WirePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const plan: PlanTier = session?.plan ?? 'free';

  const rawTab = searchParams.get('tab');
  const tab: Tab = (VALID_TABS as readonly string[]).includes(rawTab ?? '')
    ? (rawTab as Tab)
    : 'feed';

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'feed') {
      params.delete('tab');
    } else {
      params.set('tab', next);
    }
    const qs = params.toString();
    router.replace(`/wire${qs ? `?${qs}` : ''}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-brand-line">
        <TabButton label="Feed" active={tab === 'feed'} onClick={() => setTab('feed')} />
        <TabButton
          label="Competitors"
          active={tab === 'competitors'}
          onClick={() => setTab('competitors')}
        />
      </div>

      {tab === 'feed' ? <FeedTab plan={plan} /> : <CompetitorsTab plan={plan} />}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
        active
          ? 'border-brand-green-ink text-brand-text'
          : 'border-transparent text-brand-muted hover:text-brand-text'
      )}
    >
      {label}
    </button>
  );
}

function useNow(intervalMs: number = 60_000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function FeedTab({ plan }: { plan: PlanTier }) {
  const [showCompetitorSheet, setShowCompetitorSheet] = useState(false);
  const now = useNow();

  const { events, activeCompetitorCount, isLoading, isError, refresh } =
    useIntelligenceFeed({ range: '30d' });
  const { data: competitors = [] } = useCompetitors();

  const rollups = useMemo(
    () => rollupByCompetitor(competitors, events, now),
    [competitors, events, now]
  );
  const stats = useMemo(() => buildWireStats(events, rollups), [events, rollups]);
  const activeRollups = useMemo(() => rollups.filter((r) => r.month > 0), [rollups]);

  const competitorLimit = PLAN_LIMITS[plan].competitorMonitors;
  const hasCompetitorAccess = competitorLimit > 0 || competitorLimit === -1;
  const isFreePlan = plan === 'free';

  if (isFreePlan) {
    return <IntelligenceUpgradeTeaser />;
  }

  return (
    <>
      <WireStatStrip stats={stats} />
      <TheWireBanner plan={plan} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
              Grouped by competitor · 30d
            </p>
            <a
              href="/api/competitors/products.csv"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-muted transition-colors hover:text-brand-dim"
            >
              <Download className="h-3 w-3" />
              export all products
            </a>
          </div>

          <QueryState
            isLoading={isLoading && events.length === 0}
            isError={isError}
            onRetry={refresh}
            skeletonRows={3}
          >
            {activeRollups.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-lg py-16 text-center"
                style={{
                  background: 'var(--brand-bg2)',
                  boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
                }}
              >
                <Brain className="mb-3 h-10 w-10 text-brand-muted" />
                <h3 className="text-sm font-medium text-brand-text">
                  {activeCompetitorCount === 0 ? 'No competitors yet' : 'The market is quiet'}
                </h3>
                <p className="mt-1 max-w-xs text-sm text-brand-muted">
                  {activeCompetitorCount === 0
                    ? 'Add a competitor to start tracking their prices, products, and content.'
                    : 'No qualifying moves in the last 30 days.'}
                </p>
                {activeCompetitorCount === 0 && hasCompetitorAccess && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCompetitorSheet(true)}
                  >
                    Add your first competitor
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {activeRollups.map((rollup, i) => (
                  <CompetitorGroupCard
                    key={rollup.competitor.id}
                    rollup={rollup}
                    rank={i + 1}
                  />
                ))}
              </div>
            )}
          </QueryState>
        </div>

        <aside className="space-y-4">
          <CompetitorJumpStrip rollups={rollups} />
          <DigestPreviewCard rollups={rollups} />
        </aside>
      </div>

      <CompetitorManagementSheet
        open={showCompetitorSheet}
        onOpenChange={setShowCompetitorSheet}
        plan={plan}
        onChanged={refresh}
      />
    </>
  );
}

function CompetitorsTab({ plan }: { plan: PlanTier }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const now = useNow();

  const { data: competitors = [], isLoading, isError, refetch } = useCompetitors();
  const { events } = useIntelligenceFeed({ range: '30d' });

  const rollups = useMemo(
    () => rollupByCompetitor(competitors, events, now),
    [competitors, events, now]
  );

  return (
    <>
      <RestoreBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-text">Competitive watchlist</h1>
          <p className="mt-0.5 text-sm text-brand-muted">
            Ranked by activity. The busiest competitor sits on top.
          </p>
        </div>
        <Button size="sm" onClick={() => setWizardOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add competitor
        </Button>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        skeletonRows={4}
      >
        {competitors.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-lg py-16 text-center"
            style={{
              background: 'var(--brand-bg2)',
              boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
            }}
          >
            <Brain className="mb-3 h-10 w-10 text-brand-muted" />
            <h3 className="text-sm font-medium text-brand-text">No competitors yet</h3>
            <p className="mt-1 max-w-xs text-sm text-brand-muted">
              Add a competitor to start tracking their prices, products, and content changes.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setWizardOpen(true)}>
              Add competitor
            </Button>
          </div>
        ) : (
          <CompetitorsAssessmentTable rollups={rollups} />
        )}
      </QueryState>

      <AddCompetitorWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        plan={plan}
        onCreated={() => void refetch()}
      />
    </>
  );
}

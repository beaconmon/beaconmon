'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IntelligenceFeed } from '@/components/intelligence/intelligence-feed';
import { IntelligenceFilters } from '@/components/intelligence/intelligence-filters';
import { IntelligenceUpgradeTeaser } from '@/components/intelligence/intelligence-upgrade-teaser';
import { IntelStatStrip } from '@/components/intelligence/intel-stat-strip';
import { TheWireBanner } from '@/components/intelligence/the-wire-banner';
import { CompetitorWatchlistPanel } from '@/components/intelligence/competitor-watchlist-panel';
import { CompetitorManagementSheet } from '@/components/intelligence/competitor-management-sheet';
import { DigestPreviewPanel } from '@/components/intelligence/digest-preview-panel';
import { AddCompetitorWizard } from '@/components/competitors/add-competitor-wizard';
import { RestoreBanner } from '@/components/competitors/restore-banner';
import { useIntelligenceFeed } from '@/lib/hooks/use-intelligence-feed';
import { useIntelligenceLastSeen } from '@/lib/hooks/use-intelligence-last-seen';
import { useCompetitors } from '@/lib/hooks/use-competitors';
import { useSession } from '@/lib/hooks/use-session';
import { QueryState } from '@/components/dashboard/query-state';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';

const VALID_TABS = ['feed', 'competitors'] as const;
type Tab = (typeof VALID_TABS)[number];

const VALID_RANGES = ['7d', '30d', '90d'] as const;
type Range = (typeof VALID_RANGES)[number];

const PLATFORM_LABEL: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  other: 'Other',
};

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

function FeedTab({ plan }: { plan: PlanTier }) {
  const searchParams = useSearchParams();
  const monitorId = searchParams.get('monitorId') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const rawRange = searchParams.get('range');
  const range: Range = (VALID_RANGES as readonly string[]).includes(rawRange ?? '')
    ? (rawRange as Range)
    : '30d';

  const [showCompetitorSheet, setShowCompetitorSheet] = useState(false);

  const { events, hasMore, activeCompetitorCount, isLoading, isError, loadMore, refresh } =
    useIntelligenceFeed({ monitorId, type, range });
  const { previousLastSeenAt, isReady: lastSeenReady } = useIntelligenceLastSeen();

  const isFreePlan = plan === 'free';
  const competitorLimit = PLAN_LIMITS[plan].competitorMonitors;
  const hasCompetitorAccess = competitorLimit > 0 || competitorLimit === -1;

  if (isFreePlan) {
    return <IntelligenceUpgradeTeaser />;
  }

  return (
    <>
      <IntelStatStrip events={events} />
      <TheWireBanner plan={plan} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <IntelligenceFilters events={events} />

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
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-brand-muted">
                  {activeCompetitorCount} active
                </span>
                <a
                  href="/api/competitors/products.csv"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-muted transition-colors hover:text-brand-dim"
                >
                  <Download className="h-3 w-3" />
                  export all products
                </a>
              </div>
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
                <IntelligenceFeed
                  events={events}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onLoadMore={loadMore}
                  monitorIsCompetitorMap={new Map()}
                  previousLastSeenAt={lastSeenReady ? previousLastSeenAt : null}
                />
              )}
            </QueryState>
          </div>
        </div>

        <div className="space-y-4">
          <CompetitorWatchlistPanel events={events} plan={plan} onChanged={refresh} />
          <DigestPreviewPanel />
        </div>
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
  const { data: competitors, isLoading, isError, refetch } = useCompetitors();

  return (
    <>
      <RestoreBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-text">Competitors</h1>
          <p className="mt-0.5 text-sm text-brand-muted">
            Track price, content, and product changes across your competitive landscape.
          </p>
        </div>
        <Button size="sm" onClick={() => setWizardOpen(true)}>
          Add competitor
        </Button>
      </div>

      <div
        className="overflow-hidden rounded-lg"
        style={{
          background: 'var(--brand-bg2)',
          boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
        }}
      >
        <div className="border-b border-brand-line px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
            All competitors
          </p>
        </div>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          skeletonRows={4}
        >
          {!competitors || competitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
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
            <div>
              {competitors.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/wire/competitors/${c.id}`}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-bg3/40 ${
                    i > 0 ? 'border-t border-brand-line/60' : ''
                  }`}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--brand-amber)' }}
                  >
                    {(c.name[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-text">{c.name}</p>
                    <p className="truncate font-mono text-xs text-brand-muted">{c.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                      style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
                    >
                      {PLATFORM_LABEL[c.platform] ?? 'Other'}
                    </span>
                    {!c.isActive && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                        Inactive
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-brand-muted" />
                </Link>
              ))}
            </div>
          )}
        </QueryState>
      </div>

      <AddCompetitorWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        plan={plan}
        onCreated={() => void refetch()}
      />
    </>
  );
}

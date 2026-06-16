'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Plus, Tag, Pause, Play, Trash2, Clock, Tag as TagIcon, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueryState } from '@/components/dashboard/query-state';
import { DiscoverEmptyState } from '@/components/monitors/discover-empty-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Sparkline } from '@/components/dashboard/sparkline';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useMonitors,
  useMonitorSummaries,
  useMonitorTags,
  useBulkMonitorAction,
  type MonitorSummary,
  type BulkMonitorAction,
} from '@/lib/hooks/use-monitors';
import { useIncidents } from '@/lib/hooks/use-incidents';
import { useSession } from '@/lib/hooks/use-session';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { IncidentWithMonitor } from '@/lib/repositories/incidents';

// ─── Type pill ───────────────────────────────────────────────────────────────

function TypePill({ type }: { type: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md bg-brand-bg3 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-brand-dim"
      style={{ boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
    >
      {type}
    </span>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-text">{value}</p>
    </div>
  );
}

// ─── Down banner ─────────────────────────────────────────────────────────────

function DownBanner({
  monitors,
  incidents,
}: {
  monitors: MonitorRow[];
  incidents: IncidentWithMonitor[];
}) {
  const downMonitors = monitors.filter((m) => m.currentStatus === 'down');
  if (downMonitors.length === 0) return null;

  const openIncidents = incidents.filter((i) => !i.resolvedAt);
  const first = downMonitors[0]!;
  const incident = openIncidents.find((i) => i.monitorId === first.id);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-red/30 bg-brand-red/5 px-4 py-3">
      <AlertCircle className="h-4 w-4 shrink-0 text-brand-red" />
      <div className="min-w-0 flex-1 text-sm">
        <span className="font-medium text-brand-text">{first.name}</span>
        <span className="text-brand-dim"> is down</span>
        {incident?.startedAt && (
          <span className="text-brand-dim">
            {' '}— {formatDistanceToNow(new Date(incident.startedAt))} ago
          </span>
        )}
        {downMonitors.length > 1 && (
          <span className="text-brand-dim">
            {' '}and {downMonitors.length - 1} other{downMonitors.length > 2 ? 's' : ''}
          </span>
        )}
      </div>
      <Link
        href="/incidents"
        className="shrink-0 text-xs font-medium text-brand-red transition-colors hover:text-brand-red/80"
      >
        View incidents →
      </Link>
    </div>
  );
}

// ─── Ownership badge ─────────────────────────────────────────────────────────

function OwnershipBadge({ isCompetitor, type }: { isCompetitor: boolean; type: string }) {
  if (isCompetitor) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Eye className="h-2.5 w-2.5" />
        Competitor
      </span>
    );
  }
  // "Your store" only makes sense for page-level monitors. Infra checks
  // (SSL, domain, TCP) are not store pages, so leave them unbadged.
  if (type === 'ssl' || type === 'domain' || type === 'tcp') return null;
  return (
    <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-brand-green/10 text-brand-green-ink">
      Your store
    </span>
  );
}

// ─── Category filter tabs ─────────────────────────────────────────────────────

type CategoryFilter = 'all' | 'store' | 'competitors';

function CategoryTabs({
  active,
  counts,
  onChange,
}: {
  active: CategoryFilter;
  counts: { all: number; store: number; competitors: number };
  onChange: (c: CategoryFilter) => void;
}) {
  const tabs: { key: CategoryFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'store', label: 'Your Store', count: counts.store },
    { key: 'competitors', label: 'Competitors', count: counts.competitors },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          aria-pressed={active === tab.key}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            active === tab.key
              ? 'border-brand-green/40 bg-brand-green/15 text-brand-green-ink'
              : 'border-brand-line bg-brand-bg3 text-brand-muted hover:border-brand-green/30 hover:text-brand-text'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
              active === tab.key ? 'bg-brand-green/25 text-brand-green-ink' : 'bg-brand-surface text-brand-muted'
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Tag filter strip ────────────────────────────────────────────────────────

function TagFilter({
  tags,
  active,
  onChange,
}: {
  tags: string[];
  active: string | null;
  onChange: (tag: string | null) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag className="h-3 w-3 text-brand-muted" />
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors',
          active === null
            ? 'bg-brand-green/20 text-brand-green-ink'
            : 'bg-brand-bg3 text-brand-muted hover:text-brand-text'
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag === active ? null : tag)}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors',
            tag === active
              ? 'bg-brand-green/20 text-brand-green-ink'
              : 'bg-brand-bg3 text-brand-muted hover:text-brand-text'
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

// ─── Monitor table row ───────────────────────────────────────────────────────

const GRID_COLS = '32px 20px 1fr 72px 110px 100px 72px 110px 120px';

function p95Color(rts: number[], threshold?: number | null): string {
  if (rts.length === 0) return 'text-brand-muted';
  const sorted = [...rts].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1]!;
  if (!threshold) return 'text-brand-dim';
  if (p95 >= threshold) return 'text-brand-red';
  if (p95 >= threshold * 0.7) return 'text-amber-500 dark:text-amber-400';
  return 'text-brand-green-ink';
}

function MonitorTableRow({
  monitor,
  summary,
  selected,
  onToggle,
}: {
  monitor: MonitorRow;
  summary: MonitorSummary | undefined;
  selected: boolean;
  onToggle: (id: string, e: React.MouseEvent) => void;
}) {
  const rts = summary?.recentRts ?? [];
  const sorted = [...rts].sort((a, b) => a - b);
  const p95 = sorted.length > 0
    ? sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1]
    : null;

  return (
    <div
      className="group grid items-center gap-4 border-b border-brand-line px-4 py-3 transition-colors last:border-b-0 hover:bg-brand-surface/60"
      style={{ gridTemplateColumns: GRID_COLS }}
    >
      {/* Checkbox */}
      <div onClick={(e) => onToggle(monitor.id, e)} className="flex items-center justify-center cursor-pointer">
        <Checkbox checked={selected} onCheckedChange={() => {}} />
      </div>

      <Link href={`/monitors/${monitor.id}`} className="contents">
        {/* Status dot */}
        <span
          className={cn(
            'h-2 w-2 rounded-full shrink-0',
            monitor.currentStatus === 'up'
              ? 'bg-brand-green animate-pulse'
              : monitor.currentStatus === 'down'
              ? 'bg-brand-red'
              : 'bg-brand-muted'
          )}
        />

        {/* Name + URL */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate font-medium text-sm text-brand-text transition-colors group-hover:text-brand-green-ink">
              {monitor.name}
            </span>
            <OwnershipBadge isCompetitor={monitor.isCompetitor} type={monitor.type} />
            {monitor.tags.length > 0 && (
              <span className="flex shrink-0 gap-1">
                {monitor.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-brand-bg3 px-1.5 py-0 text-[9px] font-medium text-brand-muted"
                  >
                    {t}
                  </span>
                ))}
                {monitor.tags.length > 3 && (
                  <span className="text-[9px] text-brand-muted">+{monitor.tags.length - 3}</span>
                )}
              </span>
            )}
          </div>
          <span className="block truncate text-xs text-brand-muted font-mono">{monitor.url}</span>
        </div>

        {/* Type */}
        <TypePill type={monitor.type} />

        {/* Status */}
        <StatusBadge status={monitor.currentStatus} />

        {/* Response sparkline + p95 */}
        <div className="flex items-center gap-2">
          <Sparkline data={rts} width={56} height={20} />
          {p95 != null && (
            <span className={`font-mono text-[11px] ${p95Color(rts, monitor.responseTimeThresholdMs)}`}>
              {p95 >= 1000 ? `${(p95 / 1000).toFixed(1)}s` : `${p95}ms`}
            </span>
          )}
        </div>

        {/* Uptime 30d */}
        <span className="font-mono text-sm text-brand-dim">
          {summary?.uptime30d != null ? `${summary.uptime30d}%` : '—'}
        </span>

        {/* Last change (content snapshots) — competitor rows only */}
        <span className="text-xs text-brand-muted">
          {monitor.isCompetitor
            ? summary?.lastSnapshotAt
              ? formatDistanceToNow(new Date(summary.lastSnapshotAt), { addSuffix: true })
              : 'Never'
            : '—'}
        </span>

        {/* Last checked */}
        <span className="text-xs text-brand-muted">
          {monitor.lastCheckedAt
            ? formatDistanceToNow(new Date(monitor.lastCheckedAt), { addSuffix: true })
            : 'Never'}
        </span>
      </Link>
    </div>
  );
}

// ─── Bulk action bar ─────────────────────────────────────────────────────────

function BulkActionBar({
  selectedIds,
  onClear,
  onDone,
  minInterval,
}: {
  selectedIds: string[];
  onClear: () => void;
  onDone: () => void;
  minInterval: number;
}) {
  const bulk = useBulkMonitorAction();
  const [mode, setMode] = useState<'idle' | 'set-interval' | 'add-tag' | 'delete'>('idle');
  const [intervalInput, setIntervalInput] = useState(String(minInterval));
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function run(payload: BulkMonitorAction) {
    setError(null);
    bulk.mutate(payload, {
      onSuccess: () => {
        setMode('idle');
        setTagInput('');
        onDone();
      },
      onError: (err) => setError(err.message),
    });
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-2 rounded-lg border border-brand-line bg-brand-surface px-4 py-3 shadow-xl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium text-brand-text">
          {selectedIds.length} selected
        </span>

        {mode === 'idle' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={bulk.isPending}
              onClick={() => run({ action: 'pause', monitorIds: selectedIds })}
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={bulk.isPending}
              onClick={() => run({ action: 'resume', monitorIds: selectedIds })}
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={bulk.isPending}
              onClick={() => setMode('set-interval')}
            >
              <Clock className="h-3.5 w-3.5" /> Interval
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={bulk.isPending}
              onClick={() => setMode('add-tag')}
            >
              <TagIcon className="h-3.5 w-3.5" /> Add tag
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-brand-red hover:text-brand-red"
              disabled={bulk.isPending}
              onClick={() => setMode('delete')}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        )}

        {mode === 'set-interval' && (
          <>
            <Input
              type="number"
              value={intervalInput}
              onChange={(e) => setIntervalInput(e.target.value)}
              className="h-8 w-32"
              min={minInterval}
            />
            <span className="text-xs text-brand-muted">seconds (min {minInterval})</span>
            <Button
              size="sm"
              className="h-8"
              disabled={
                bulk.isPending ||
                !Number.isFinite(parseInt(intervalInput, 10)) ||
                parseInt(intervalInput, 10) < minInterval
              }
              onClick={() => {
                const seconds = parseInt(intervalInput, 10);
                if (!Number.isFinite(seconds) || seconds < minInterval) {
                  setError(`Interval must be a number ≥ ${minInterval}`);
                  return;
                }
                run({
                  action: 'set-interval',
                  monitorIds: selectedIds,
                  intervalSeconds: seconds,
                });
              }}
            >
              Apply
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setMode('idle')}>
              Cancel
            </Button>
          </>
        )}

        {mode === 'add-tag' && (
          <>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="h-8 w-40"
              placeholder="production"
            />
            <Button
              size="sm"
              className="h-8"
              disabled={bulk.isPending || !tagInput.trim()}
              onClick={() =>
                run({ action: 'add-tag', monitorIds: selectedIds, tag: tagInput.trim() })
              }
            >
              Apply
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setMode('idle')}>
              Cancel
            </Button>
          </>
        )}

        {mode === 'delete' && (
          <>
            <span className="text-sm text-brand-text">Delete {selectedIds.length} monitor(s)?</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-8"
              disabled={bulk.isPending}
              onClick={() => run({ action: 'delete', monitorIds: selectedIds })}
            >
              Confirm delete
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setMode('idle')}>
              Cancel
            </Button>
          </>
        )}

        <button
          type="button"
          onClick={onClear}
          className="ml-auto rounded p-1 text-brand-muted transition-colors hover:bg-brand-bg3 hover:text-brand-text"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const ONBOARDING_KEY = 'beaconmon_onboarding_dismissed';

export default function MonitorsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limitBannerDismissed, setLimitBannerDismissed] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  });
  const monitorsQ = useMonitors({ tag: activeTag ?? undefined });
  const summariesQ = useMonitorSummaries();
  const incidentsQ = useIncidents();
  const tagsQ = useMonitorTags();
  const sessionQ = useSession();

  const allMonitors = monitorsQ.data ?? [];
  const summaries = summariesQ.data ?? {};
  const incidents = (incidentsQ.data ?? []) as IncidentWithMonitor[];
  const allTags = tagsQ.data ?? [];
  const plan = sessionQ.data?.plan ?? 'free';
  const minInterval = PLAN_LIMITS[plan].checkIntervalSeconds;
  const planMax = PLAN_LIMITS[plan].monitors;
  const nearLimit = planMax > 0 && allMonitors.length >= Math.floor(planMax * 0.8);
  const atLimit = planMax > 0 && allMonitors.length >= planMax;

  const competitorCount = allMonitors.filter((m) => m.isCompetitor).length;
  const storeCount = allMonitors.filter((m) => !m.isCompetitor).length;

  const monitors = activeCategory === 'competitors'
    ? allMonitors.filter((m) => m.isCompetitor)
    : activeCategory === 'store'
    ? allMonitors.filter((m) => !m.isCompetitor)
    : allMonitors;

  const visibleIds = monitors.map((m) => m.id);
  const visibleSelectedIds = selectedIds.filter((id) => visibleIds.includes(id));
  const allVisibleSelected =
    visibleIds.length > 0 && visibleSelectedIds.length === visibleIds.length;

  function toggleOne(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  const upCount = allMonitors.filter((m) => m.currentStatus === 'up').length;
  const downCount = allMonitors.filter((m) => m.currentStatus === 'down').length;

  const avgUptime = (() => {
    const values = Object.values(summaries)
      .map((s) => s.uptime30d)
      .filter((v): v is number => v != null);
    if (values.length === 0) return null;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  })();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Monitors</h1>
          <p className="mt-0.5 text-xs text-brand-muted">Track uptime for your store and watch for moves by competitors.</p>
        </div>
        <Link
          href="/monitors/new"
          className="flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-fg transition-colors hover:bg-brand-green/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add monitor
        </Link>
      </div>

      {!onboardingDismissed && allMonitors.length === 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-brand-green/30 bg-brand-green/5 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-text">Track your store and watch your competitors</p>
              <p className="text-xs text-brand-muted">Add your store for uptime monitoring, then add competitor sites to watch for price and promo changes.</p>
            </div>
            <button
              onClick={() => {
                setOnboardingDismissed(true);
                localStorage.setItem(ONBOARDING_KEY, '1');
              }}
              aria-label="Dismiss"
              className="shrink-0 rounded p-0.5 text-brand-muted hover:bg-brand-green/10 hover:text-brand-text transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/monitors/new"
              className="rounded-md border border-brand-green bg-brand-green/10 px-3 py-1.5 text-xs font-medium text-brand-green-ink transition-colors hover:bg-brand-green/20"
            >
              Add your store
            </Link>
            <Link
              href="/wire?tab=competitors"
              className="rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-dim transition-colors hover:text-brand-text"
            >
              Add competitors
            </Link>
            <Link
              href="/today"
              className="rounded-md border border-brand-line bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-dim transition-colors hover:text-brand-text"
            >
              Check today
            </Link>
          </div>
        </div>
      )}

      {nearLimit && !limitBannerDismissed && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {atLimit
              ? <>You have reached your monitor limit ({planMax} monitors on the {plan} plan).</>
              : <>You are using {allMonitors.length} of {planMax} monitors on the {plan} plan.</>
            }{' '}
            <Link href="/settings/billing" className="font-medium underline hover:no-underline">
              Upgrade your plan
            </Link>{' '}
            to add more.
          </span>
          <button
            onClick={() => setLimitBannerDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 rounded p-0.5 hover:bg-amber-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryTabs
          active={activeCategory}
          counts={{ all: allMonitors.length, store: storeCount, competitors: competitorCount }}
          onChange={(c) => { setActiveCategory(c); setSelectedIds([]); }}
        />
        <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
      </div>

      <QueryState
        isLoading={monitorsQ.isLoading}
        isError={monitorsQ.isError}
        error={monitorsQ.error}
        onRetry={() => monitorsQ.refetch()}
        skeletonRows={5}
      >
        {allMonitors.length === 0 ? (
          <DiscoverEmptyState />
        ) : (
          <>
            {/* Down banner */}
            <DownBanner monitors={allMonitors} incidents={incidents} />

            {/* ICP summary banner */}
            {competitorCount > 0 && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-line bg-brand-surface px-4 py-3">
                <p className="text-sm text-brand-dim">
                  <span className="font-medium text-brand-text">{competitorCount} competitor {competitorCount === 1 ? 'site' : 'sites'}</span>
                  {' '}being tracked{storeCount > 0 && <>, alongside <span className="font-medium text-brand-text">{storeCount} of your store{storeCount === 1 ? "'s page" : "'s pages"}</span></>}.
                </p>
                <Link
                  href="/wire?tab=competitors"
                  className="shrink-0 text-xs font-medium text-brand-green-ink transition-colors hover:text-brand-green-ink/80"
                >
                  Browse the Wire →
                </Link>
              </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard label="Total" value={allMonitors.length} />
              <MetricCard label="Up" value={upCount} />
              <MetricCard label="Down" value={downCount} />
              <MetricCard
                label="Avg uptime 30d"
                value={avgUptime != null ? `${avgUptime}%` : '—'}
              />
            </div>

            {/* Monitor table */}
            <div className="overflow-hidden rounded-lg border border-brand-line bg-brand-surface">
              {/* Header */}
              <div
                className="grid items-center gap-4 border-b border-brand-line px-4 py-2"
                style={{ gridTemplateColumns: GRID_COLS }}
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleAllVisible}
                    aria-label="Select all visible monitors"
                  />
                </div>
                <span />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Name / URL
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Type
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Status
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Response
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  30d
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Last change
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                  Last check
                </span>
              </div>

              {monitors.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-brand-muted">
                  No {activeCategory === 'competitors' ? 'competitor' : 'store'} monitors yet.
                </div>
              ) : (
                monitors.map((monitor) => (
                  <MonitorTableRow
                    key={monitor.id}
                    monitor={monitor}
                    summary={summaries[monitor.id]}
                    selected={selectedIds.includes(monitor.id)}
                    onToggle={toggleOne}
                  />
                ))
              )}
            </div>
          </>
        )}
      </QueryState>

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          onDone={() => setSelectedIds([])}
          minInterval={minInterval}
        />
      )}
    </div>
  );
}

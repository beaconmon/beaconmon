'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useMonitors, useMonitorSummaries, type MonitorSummary } from '@/lib/hooks/use-monitors';
import { useIncidents } from '@/lib/hooks/use-incidents';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { IncidentWithMonitor } from '@/lib/repositories/incidents';

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) {
    return <span className="text-brand-muted text-xs font-mono">—</span>;
  }

  const W = 80;
  const H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={W} height={H} className="shrink-0 overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="#00E57A"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

// ─── Type pill ───────────────────────────────────────────────────────────────

function TypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded border border-brand-line bg-brand-bg3 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-dim">
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

// ─── Monitor table row ───────────────────────────────────────────────────────

const GRID_COLS = '20px 1fr 72px 110px 100px 72px 120px';

function MonitorTableRow({
  monitor,
  summary,
}: {
  monitor: MonitorRow;
  summary: MonitorSummary | undefined;
}) {
  return (
    <Link
      href={`/monitors/${monitor.id}`}
      className="group grid items-center gap-4 border-b border-brand-line px-4 py-3 transition-colors last:border-b-0 hover:bg-brand-surface/60"
      style={{ gridTemplateColumns: GRID_COLS }}
    >
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
        <span className="block truncate font-medium text-sm text-brand-text transition-colors group-hover:text-brand-green">
          {monitor.name}
        </span>
        <span className="block truncate text-xs text-brand-muted font-mono">{monitor.url}</span>
      </div>

      {/* Type */}
      <TypePill type={monitor.type} />

      {/* Status */}
      <StatusBadge status={monitor.currentStatus} />

      {/* Sparkline */}
      <div className="flex items-center">
        <Sparkline data={summary?.recentRts ?? []} />
      </div>

      {/* Uptime 30d */}
      <span className="font-mono text-sm text-brand-dim">
        {summary?.uptime30d != null ? `${summary.uptime30d}%` : '—'}
      </span>

      {/* Last checked */}
      <span className="text-xs text-brand-muted">
        {monitor.lastCheckedAt
          ? formatDistanceToNow(new Date(monitor.lastCheckedAt), { addSuffix: true })
          : 'Never'}
      </span>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MonitorsPage() {
  const monitorsQ = useMonitors();
  const summariesQ = useMonitorSummaries();
  const incidentsQ = useIncidents();

  const monitors = monitorsQ.data ?? [];
  const summaries = summariesQ.data ?? {};
  const incidents = (incidentsQ.data ?? []) as IncidentWithMonitor[];

  const upCount = monitors.filter((m) => m.currentStatus === 'up').length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;

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
        <h1 className="text-lg font-semibold text-brand-text">Monitors</h1>
        <Link
          href="/monitors/new"
          className="flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-bg transition-colors hover:bg-brand-green/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add monitor
        </Link>
      </div>

      <QueryState
        isLoading={monitorsQ.isLoading}
        isError={monitorsQ.isError}
        error={monitorsQ.error}
        onRetry={() => monitorsQ.refetch()}
        skeletonRows={5}
      >
        {monitors.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No monitors yet"
            description="Add your first monitor to start tracking uptime."
            action={{ label: 'Add monitor', href: '/monitors/new' }}
          />
        ) : (
          <>
            {/* Down banner */}
            <DownBanner monitors={monitors} incidents={incidents} />

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard label="Total" value={monitors.length} />
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
                <span />
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Name / URL
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Type
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Status
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Response
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  30d
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Last check
                </span>
              </div>

              {monitors.map((monitor) => (
                <MonitorTableRow
                  key={monitor.id}
                  monitor={monitor}
                  summary={summaries[monitor.id]}
                />
              ))}
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, differenceInMinutes } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/dashboard/empty-state';
import { QueryState } from '@/components/dashboard/query-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useIncidents, useResolveIncident } from '@/lib/hooks/use-incidents';
import { AckButton } from '@/components/dashboard/ack-button';
import { useSession } from '@/lib/hooks/use-session';
import type { IncidentWithMonitor } from '@/lib/repositories/incidents';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function durationStr(startedAt: string | Date, resolvedAt: string | Date | null) {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const mins = differenceInMinutes(end, new Date(startedAt));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

type FilterTab = 'all' | 'ongoing' | 'resolved';

// ─── Incident card ────────────────────────────────────────────────────────────

function IncidentCard({
  incident,
  sessionUserId,
}: {
  incident: IncidentWithMonitor;
  sessionUserId?: string;
}) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;
  const status = isOpen ? 'ongoing' : 'resolved';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-brand-surface transition-colors hover:bg-brand-surface/80',
        isOpen ? 'border-brand-red/40' : 'border-brand-line'
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-1 rounded-l-lg',
          isOpen ? 'bg-brand-red' : 'bg-brand-line'
        )}
      />

      <div className="pl-5 pr-4 py-4">
        {/* Monitor name + status */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <Link
            href={`/monitors/${incident.monitorId}`}
            className="font-medium text-sm text-brand-text transition-colors hover:text-brand-green-ink truncate"
          >
            {incident.monitor.name}
          </Link>
          <StatusBadge status={status} />
        </div>

        {/* URL */}
        <p className="font-mono text-xs text-brand-muted truncate mb-3">
          {incident.monitor.url}
        </p>

        {/* Info grid */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
          <div>
            <span className="text-brand-muted">Started </span>
            <span className="text-brand-dim">
              {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
            </span>
          </div>
          <div>
            <span className="text-brand-muted">Duration </span>
            <span className="font-mono text-brand-dim">
              {durationStr(incident.startedAt, incident.resolvedAt)}
            </span>
          </div>
          {incident.resolvedAt && incident.resolutionType && (
            <div>
              <span className="text-brand-muted">Resolution </span>
              <span className="capitalize text-brand-dim">{incident.resolutionType}</span>
            </div>
          )}
        </div>

        {/* Acknowledge + Resolve buttons */}
        {isOpen && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <AckButton
              incidentId={incident.id}
              resolvedAt={incident.resolvedAt ? String(incident.resolvedAt) : null}
              acknowledgedAt={incident.acknowledgedAt ? String(incident.acknowledgedAt) : null}
              acknowledgedBy={incident.acknowledgedBy}
              sessionUserId={sessionUserId}
            />
            <button
              onClick={() => resolve.mutate()}
              disabled={resolve.isPending}
              className="rounded-md border border-brand-line px-3 py-1 text-xs text-brand-dim transition-colors hover:border-brand-outline hover:text-brand-text disabled:opacity-50"
            >
              {resolve.isPending ? 'Resolving…' : 'Mark as resolved'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabs({
  value,
  onChange,
  counts,
}: {
  value: FilterTab;
  onChange: (v: FilterTab) => void;
  counts: { all: number; ongoing: number; resolved: number };
}) {
  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: counts.all },
    { key: 'ongoing',  label: 'Ongoing',  count: counts.ongoing },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-brand-line bg-brand-surface p-1">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === key
              ? 'bg-brand-bg3 text-brand-text'
              : 'text-brand-muted hover:text-brand-dim'
          )}
        >
          {label}
          <span
            className={cn(
              'rounded px-1 py-0.5 text-[10px] font-semibold',
              value === key ? 'bg-brand-bg text-brand-dim' : 'text-brand-muted'
            )}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const { data: incidents, isLoading, isError, error, refetch } = useIncidents();
  const { data: session } = useSession();

  const all = useMemo(() => incidents ?? [], [incidents]);
  const ongoing = useMemo(() => all.filter((i) => !i.resolvedAt), [all]);
  const resolved = useMemo(() => all.filter((i) => i.resolvedAt), [all]);

  const filtered = useMemo(() => {
    if (filter === 'ongoing') return ongoing;
    if (filter === 'resolved') return resolved;
    return all;
  }, [filter, all, ongoing, resolved]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Incidents</h1>
      </div>

      {/* Filter bar */}
      <FilterTabs
        value={filter}
        onChange={setFilter}
        counts={{ all: all.length, ongoing: ongoing.length, resolved: resolved.length }}
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        skeletonRows={4}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={filter === 'ongoing' ? 'No ongoing incidents' : 'No incidents recorded'}
            description={
              filter === 'ongoing'
                ? 'All monitors are operational.'
                : 'Incidents appear here when a monitor goes down.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} sessionUserId={session?.userId} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

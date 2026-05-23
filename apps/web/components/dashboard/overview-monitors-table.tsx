'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Sparkline } from '@/components/dashboard/sparkline';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { MonitorSummary } from '@/lib/hooks/use-monitors';

interface OverviewMonitorsTableProps {
  monitors: MonitorRow[];
  summaries: Record<string, MonitorSummary>;
}

export function OverviewMonitorsTable({ monitors, summaries }: OverviewMonitorsTableProps) {
  const top = monitors.slice(0, 8);

  if (top.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg py-12 text-sm text-brand-muted"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        No monitors yet.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Monitors
        </p>
      </div>
      <div>
        {top.map((m, i) => {
          const summary = summaries[m.id];
          return (
            <Link
              key={m.id}
              href={`/monitors/${m.id}`}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-brand-bg3/40',
                i > 0 && 'border-t border-brand-line/60'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  m.currentStatus === 'up'
                    ? 'bg-brand-green'
                    : m.currentStatus === 'down'
                      ? 'bg-brand-red'
                      : 'bg-brand-muted'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-text">{m.name}</p>
                <p className="truncate font-mono text-xs text-brand-muted">{m.url}</p>
              </div>
              <StatusBadge status={m.currentStatus} />
              <div className="shrink-0">
                {summary?.recentRts && summary.recentRts.length >= 2 ? (
                  <Sparkline data={summary.recentRts} width={48} height={16} />
                ) : (
                  <span className="font-mono text-xs text-brand-muted">—</span>
                )}
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-brand-dim">
                {summary?.uptime30d != null ? `${summary.uptime30d}%` : '—'}
              </span>
            </Link>
          );
        })}
      </div>
      {monitors.length > 8 && (
        <div className="border-t border-brand-line px-4 py-2.5">
          <Link href="/monitors" className="text-xs text-brand-green-ink hover:underline">
            View all {monitors.length} monitors →
          </Link>
        </div>
      )}
    </div>
  );
}

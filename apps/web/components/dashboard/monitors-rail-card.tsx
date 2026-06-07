'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { MonitorSummary } from '@/lib/hooks/use-monitors';

interface MonitorsRailCardProps {
  monitors: MonitorRow[];
  summaries: Record<string, MonitorSummary>;
}

export function MonitorsRailCard({ monitors, summaries }: MonitorsRailCardProps) {
  const downFirst = [...monitors].sort((a, b) => {
    if (a.currentStatus === b.currentStatus) return 0;
    if (a.currentStatus === 'down') return -1;
    if (b.currentStatus === 'down') return 1;
    return 0;
  });
  const top = downFirst.slice(0, 6);

  if (top.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg py-8 text-xs text-brand-muted"
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
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Monitors
        </p>
        <Link
          href="/monitors"
          className="font-mono text-[10px] text-brand-muted transition-colors hover:text-brand-dim"
        >
          {monitors.length} total →
        </Link>
      </div>
      <div>
        {top.map((m, i) => {
          const summary = summaries[m.id];
          return (
            <Link
              key={m.id}
              href={`/monitors/${m.id}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2 transition-colors hover:bg-brand-bg3/40',
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
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-brand-text">{m.name}</p>
              <span className="shrink-0 font-mono text-[10px] text-brand-dim">
                {summary?.uptime30d != null ? `${summary.uptime30d}%` : '—'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

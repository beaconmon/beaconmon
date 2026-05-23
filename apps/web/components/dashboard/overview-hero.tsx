'use client';

import Link from 'next/link';
import { Brain, BookOpen } from 'lucide-react';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface OverviewHeroProps {
  monitors: MonitorRow[];
  feedEvents: IntelligenceEvent[];
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function editorialHeadline(downCount: number, total: number): string {
  if (total === 0) return 'No monitors yet. Add one to get started.';
  if (downCount === 0) return `All ${total} monitors are healthy.`;
  return `${downCount} monitor${downCount === 1 ? '' : 's'} need${downCount === 1 ? 's' : ''} attention.`;
}

export function OverviewHero({ monitors, feedEvents }: OverviewHeroProps) {
  const now = new Date();
  const dayLabel = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const timeLabel = formatTime(now);

  const upCount = monitors.filter((m) => m.currentStatus === 'up').length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;
  const competitorMoves = feedEvents.length;

  return (
    <div
      className="overflow-hidden rounded-lg p-6"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-muted">
            {dayLabel} · {timeLabel}
          </p>
          <h2 className="text-2xl font-semibold italic leading-snug text-brand-text">
            {editorialHeadline(downCount, monitors.length)}
          </h2>

          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/intelligence"
              className="flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-brand-green-fg transition-opacity hover:opacity-90"
            >
              <Brain className="h-3.5 w-3.5" />
              Open Intelligence
            </Link>
            <Link
              href="/intelligence/settings"
              className="flex items-center gap-1.5 rounded-full border border-brand-line px-4 py-1.5 text-xs font-medium text-brand-dim transition-colors hover:bg-brand-bg3 hover:text-brand-text"
            >
              <BookOpen className="h-3.5 w-3.5" />
              View today&apos;s digest
            </Link>
          </div>
        </div>

        {/* 3-cell stat box */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-brand-line">
          <div className="flex flex-col items-center justify-center px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">Up</span>
            <span className="mt-0.5 text-xl font-bold text-brand-green-ink">{upCount}</span>
          </div>
          <div className="w-px bg-brand-line" />
          <div className="flex flex-col items-center justify-center px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">Down</span>
            <span className={`mt-0.5 text-xl font-bold ${downCount > 0 ? 'text-brand-red' : 'text-brand-muted'}`}>
              {downCount}
            </span>
          </div>
          <div className="w-px bg-brand-line" />
          <div className="flex flex-col items-center justify-center px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">Signals</span>
            <span className={`mt-0.5 text-xl font-bold ${competitorMoves > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-brand-muted'}`}>
              {competitorMoves}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

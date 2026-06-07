'use client';

import Link from 'next/link';
import { Brain, BookOpen } from 'lucide-react';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface TodayHeroProps {
  monitors: MonitorRow[];
  feedEvents: IntelligenceEvent[];
  activeCompetitorCount: number;
  reliabilityRate?: number;
  newSinceLastVisit: number;
  hasEverVisited: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function editorialHeadline(competitorEventsLast7d: number, activeCompetitors: number): string {
  if (activeCompetitors === 0) {
    return 'Add a competitor to start tracking the market.';
  }
  if (competitorEventsLast7d === 0) {
    return `Tracking ${activeCompetitors} competitor${activeCompetitors === 1 ? '' : 's'}. Quiet week.`;
  }
  return `${competitorEventsLast7d} competitor event${competitorEventsLast7d === 1 ? '' : 's'} in the last 7 days.`;
}

export function TodayHero({
  monitors,
  feedEvents,
  activeCompetitorCount,
  reliabilityRate,
  newSinceLastVisit,
  hasEverVisited,
}: TodayHeroProps) {
  const now = new Date();
  const dayLabel = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const timeLabel = formatTime(now);

  const competitorEvents = feedEvents.filter((e) => e.type === 'competitor_event');
  const competitorEventCount = competitorEvents.length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;

  return (
    <div
      className="overflow-hidden rounded-lg p-6"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-brand-muted">
              {dayLabel} · {timeLabel}
            </p>
            {hasEverVisited && newSinceLastVisit > 0 && (
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(0,229,122,0.12)',
                  color: 'var(--brand-green-ink)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,229,122,0.3)',
                }}
              >
                {newSinceLastVisit} new since your last visit
              </span>
            )}
          </div>
          <h2 className="text-2xl font-semibold italic leading-snug text-brand-text">
            {editorialHeadline(competitorEventCount, activeCompetitorCount)}
          </h2>

          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/wire"
              className="flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-brand-green-fg transition-opacity hover:opacity-90"
            >
              <Brain className="h-3.5 w-3.5" />
              Open the Wire
            </Link>
            <Link
              href="/wire/settings"
              className="flex items-center gap-1.5 rounded-full border border-brand-line px-4 py-1.5 text-xs font-medium text-brand-dim transition-colors hover:bg-brand-bg3 hover:text-brand-text"
            >
              <BookOpen className="h-3.5 w-3.5" />
              View today&apos;s digest
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 overflow-hidden rounded-lg border border-brand-line">
          <div className="flex flex-col items-center justify-center px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">Competitors</span>
            <span className="mt-0.5 text-xl font-bold text-brand-text">{activeCompetitorCount}</span>
          </div>
          <div className="w-px bg-brand-line" />
          <div className="flex flex-col items-center justify-center px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">Events 7d</span>
            <span className={`mt-0.5 text-xl font-bold ${competitorEventCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-brand-muted'}`}>
              {competitorEventCount}
            </span>
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
            <span className="font-mono text-xs uppercase tracking-wider text-brand-muted">30d Jobs</span>
            <span className={`mt-0.5 font-mono text-lg font-bold ${reliabilityRate !== undefined && reliabilityRate < 99 ? 'text-amber-500 dark:text-amber-400' : 'text-brand-green-ink'}`}>
              {reliabilityRate !== undefined ? `${reliabilityRate === 100 ? '100' : reliabilityRate.toFixed(1)}%` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

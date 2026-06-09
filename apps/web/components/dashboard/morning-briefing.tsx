'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Flame,
  ArrowRight,
  Brain,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  BriefingHeadline,
  LeadAction,
  Scenario,
} from '@/lib/today/derive';

interface MorningBriefingProps {
  scenario: Scenario;
  headline: BriefingHeadline;
  lead: LeadAction;
  newSinceLastVisit: number;
  hasEverVisited: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const LEAD_ICONS: Record<LeadAction['icon'], LucideIcon> = {
  trendingDown: TrendingDown,
  shieldCheck: ShieldCheck,
  circleAlert: AlertCircle,
  flame: Flame,
};

const SEV_STYLES: Record<
  LeadAction['sev'],
  { soft: string; line: string; ink: string; chip: string; chipBg: string }
> = {
  high: {
    soft: 'rgba(255,68,68,0.12)',
    line: 'rgba(255,68,68,0.32)',
    ink: 'var(--brand-red)',
    chip: 'var(--brand-red)',
    chipBg: 'rgba(255,68,68,0.16)',
  },
  med: {
    soft: 'rgba(245,180,0,0.12)',
    line: 'rgba(245,180,0,0.30)',
    ink: 'var(--brand-amber)',
    chip: 'var(--brand-amber)',
    chipBg: 'rgba(245,180,0,0.16)',
  },
  low: {
    soft: 'rgba(0,229,122,0.10)',
    line: 'rgba(0,229,122,0.28)',
    ink: 'var(--brand-green-ink)',
    chip: 'var(--brand-green-ink)',
    chipBg: 'rgba(0,229,122,0.14)',
  },
};

function scenarioAccent(scenario: Scenario): string {
  if (scenario === 'issue') return 'var(--brand-red)';
  if (scenario === 'high') return 'var(--brand-amber)';
  return 'var(--brand-green-ink)';
}

function emphasisColor(tone: 'text' | 'red' | 'green'): string {
  if (tone === 'red') return 'var(--brand-red)';
  if (tone === 'green') return 'var(--brand-green-ink)';
  return 'var(--brand-text)';
}

export function MorningBriefing({
  scenario,
  headline,
  lead,
  newSinceLastVisit,
  hasEverVisited,
}: MorningBriefingProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const dayLabel = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const timeLabel = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const accent = scenarioAccent(scenario);
  const Icon = LEAD_ICONS[lead.icon];
  const sev = SEV_STYLES[lead.sev];

  return (
    <section
      aria-label="Morning briefing"
      className="relative overflow-hidden rounded-lg p-6 sm:p-7"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: accent }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-muted">
          {dayLabel} · {timeLabel} · Morning briefing
        </p>
        {hasEverVisited && newSinceLastVisit > 0 && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{
              background:
                scenario === 'issue' ? 'rgba(255,68,68,0.12)' : 'rgba(0,229,122,0.12)',
              color:
                scenario === 'issue' ? 'var(--brand-red)' : 'var(--brand-green-ink)',
              boxShadow:
                scenario === 'issue'
                  ? 'inset 0 0 0 1px rgba(255,68,68,0.32)'
                  : 'inset 0 0 0 1px rgba(0,229,122,0.3)',
            }}
          >
            {newSinceLastVisit} new since your last visit
          </span>
        )}
      </div>

      <h2 className="mb-5 max-w-[60ch] text-xl italic leading-snug tracking-tight text-brand-dim sm:text-[1.4rem] sm:leading-[1.45]">
        {headline.parts.map((part, i) => (
          <span key={i}>
            {part.before}
            {part.emphasized && (
              <strong
                className="font-bold not-italic"
                style={{ color: emphasisColor(part.emphasized.tone) }}
              >
                {part.emphasized.text}
              </strong>
            )}
            {part.after}
          </span>
        ))}
      </h2>

      <div
        className="mb-5 flex flex-col items-start gap-3 rounded-[10px] p-3.5 sm:flex-row sm:items-stretch sm:gap-3.5 sm:p-4"
        style={{
          background: sev.soft,
          boxShadow: `inset 0 0 0 1px ${sev.line}`,
        }}
      >
        <div
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px]"
          style={{
            background: 'var(--brand-bg)',
            boxShadow: `inset 0 0 0 1px ${sev.line}`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: sev.ink }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ background: sev.chipBg, color: sev.chip }}
            >
              {lead.tag}
            </span>
          </div>
          <p className="mb-0.5 text-[15px] font-semibold leading-snug text-brand-text">
            {lead.title}
          </p>
          <p className="text-[13px] leading-[1.5] text-brand-dim">{lead.detail}</p>
        </div>
        <Link
          href={lead.href}
          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-bg3"
          style={{
            background: 'var(--brand-bg)',
            boxShadow: `inset 0 0 0 1px ${sev.line}`,
          }}
        >
          {lead.cta} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/wire"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-brand-green-fg transition-opacity hover:opacity-90"
        >
          <Brain className="h-3.5 w-3.5" />
          Open the Wire
        </Link>
        <Link
          href="/wire/settings"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-brand-dim transition-colors hover:bg-brand-bg3 hover:text-brand-text"
          style={{ boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Wire settings
        </Link>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { ChevronRight, Flame } from 'lucide-react';
import { Sparkline } from '@/components/dashboard/sparkline';
import { CompetitorAvatar } from './competitor-avatar';
import { TrendTag } from './trend-tag';
import { eventLabel, formatRelative, type CompetitorRollup } from '@/lib/wire/rollup';

interface CompetitorsAssessmentTableProps {
  rollups: CompetitorRollup[];
}

const PLATFORM_LABEL: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  other: 'Other',
};

export function CompetitorsAssessmentTable({ rollups }: CompetitorsAssessmentTableProps) {
  if (rollups.length === 0) return null;

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="hidden border-b border-brand-line px-4 py-2.5 sm:flex sm:items-center sm:gap-4">
        <span className="w-[220px] font-mono text-[9px] uppercase tracking-[0.12em] text-brand-muted">
          Competitor
        </span>
        <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-muted">
          Last detected change
        </span>
        <span className="w-[110px] font-mono text-[9px] uppercase tracking-[0.12em] text-brand-muted">
          Trend
        </span>
        <span className="w-[72px] text-right font-mono text-[9px] uppercase tracking-[0.12em] text-brand-muted">
          Volume
        </span>
        <span className="w-4" />
      </div>
      <ul>
        {rollups.map((r, i) => {
          const isHot = i === 0 && r.month > 0;
          const silent = r.trend === 'silent';
          return (
            <li key={r.competitor.id}>
              <Link
                href={`/wire/competitors/${r.competitor.id}`}
                className="flex flex-col gap-3 border-t border-brand-line-soft px-4 py-3 transition-colors hover:bg-brand-bg3/40 sm:flex-row sm:items-center sm:gap-4 first:border-t-0"
                style={{
                  background: isHot ? 'rgba(180,83,9,0.06)' : undefined,
                  opacity: silent ? 0.75 : 1,
                }}
              >
                <div className="flex w-full items-center gap-3 sm:w-[220px]">
                  <CompetitorAvatar
                    name={r.competitor.name}
                    size={36}
                    tone={isHot ? 'amber' : 'muted'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-semibold text-brand-text">
                        {r.competitor.name}
                      </p>
                      {isHot && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0 font-mono text-[9px] font-semibold uppercase tracking-wider"
                          style={{
                            background: 'rgba(180,83,9,0.12)',
                            color: 'var(--brand-amber)',
                          }}
                        >
                          <Flame className="h-2.5 w-2.5" /> Top threat
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="truncate font-mono text-[10.5px] text-brand-muted">
                        {r.competitor.domain}
                      </span>
                      <span
                        className="rounded px-1.5 py-0 font-mono text-[9px] font-semibold uppercase tracking-wider"
                        style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
                      >
                        {PLATFORM_LABEL[r.competitor.platform] ?? 'Other'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {r.lastEvent ? (
                    <>
                      <p className="truncate text-[12.5px] text-brand-dim">
                        {eventLabel(r.lastEvent.competitorEventType)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-brand-muted">
                        {formatRelative(r.lastEvent.timestamp)}
                      </p>
                    </>
                  ) : (
                    <p className="text-[12.5px] text-brand-muted">No changes detected</p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:w-[110px]">
                  <Sparkline
                    data={r.spark}
                    width={44}
                    height={16}
                    color={
                      isHot
                        ? 'var(--brand-amber)'
                        : silent
                          ? 'var(--brand-line)'
                          : 'var(--brand-muted)'
                    }
                    fill={isHot}
                  />
                  <TrendTag trend={r.trend} size="sm" />
                </div>

                <div className="sm:w-[72px] sm:text-right">
                  <p
                    className="text-[16px] font-bold leading-none"
                    style={{ color: silent ? 'var(--brand-muted)' : 'var(--brand-text)' }}
                  >
                    {r.month}
                  </p>
                  <p className="mt-1 font-mono text-[8.5px] uppercase tracking-wider text-brand-muted">
                    events / 30d
                  </p>
                </div>

                <ChevronRight className="hidden h-4 w-4 shrink-0 text-brand-muted sm:block" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

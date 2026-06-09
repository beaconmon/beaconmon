'use client';

import Link from 'next/link';
import { Sparkline } from '@/components/dashboard/sparkline';
import type { CompetitorRollup } from '@/lib/wire/rollup';

interface CompetitorJumpStripProps {
  rollups: CompetitorRollup[];
}

export function CompetitorJumpStrip({ rollups }: CompetitorJumpStripProps) {
  if (rollups.length === 0) return null;

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
          Ranked by activity
        </p>
      </div>
      <ul>
        {rollups.map((r, i) => {
          const silent = r.trend === 'silent';
          const isTop = i === 0;
          const color = isTop ? 'var(--brand-amber)' : 'var(--brand-muted)';
          return (
            <li key={r.competitor.id}>
              <Link
                href={`/wire/competitors/${r.competitor.id}?tab=events`}
                className="flex items-center gap-2.5 border-t border-brand-line-soft px-4 py-2 transition-colors hover:bg-brand-bg3/40 first:border-t-0"
                style={{ opacity: silent ? 0.55 : 1 }}
              >
                <span
                  className="w-3 shrink-0 font-mono text-[10px] font-bold"
                  style={{ color }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-brand-text">
                  {r.competitor.name}
                </span>
                <Sparkline
                  data={r.spark}
                  width={40}
                  height={13}
                  color={color}
                />
                <span className="w-5 shrink-0 text-right font-mono text-[11px] text-brand-dim">
                  {r.week}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

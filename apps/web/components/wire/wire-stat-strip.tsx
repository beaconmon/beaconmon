'use client';

import type { WireSentenceStat } from '@/lib/wire/rollup';

interface WireStatStripProps {
  stats: WireSentenceStat[];
}

function colorFor(tone: WireSentenceStat['tone']): string {
  switch (tone) {
    case 'green':
      return 'var(--brand-green-ink)';
    case 'amber':
      return 'var(--brand-amber)';
    default:
      return 'var(--brand-text)';
  }
}

export function WireStatStrip({ stats }: WireStatStripProps) {
  if (stats.length === 0) return null;
  return (
    <ul
      aria-label="Wire summary"
      className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
    >
      {stats.map((stat, i) => (
        <li
          key={i}
          className="rounded-lg px-3.5 py-3"
          style={{
            background: 'var(--brand-bg2)',
            boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
          }}
        >
          <p
            className="text-[13px] font-semibold leading-tight"
            style={{ color: colorFor(stat.tone) }}
          >
            {stat.head}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-brand-muted">
            {stat.sub}
          </p>
        </li>
      ))}
    </ul>
  );
}

'use client';

import { ArrowUp, Minus, MoonStar } from 'lucide-react';
import type { Trend } from '@/lib/wire/rollup';

interface TrendTagProps {
  trend: Trend;
  size?: 'sm' | 'md';
}

const STYLES: Record<Trend, { label: string; color: string; bg: string; icon: typeof ArrowUp }> = {
  rising: {
    label: 'Rising',
    color: 'var(--brand-amber)',
    bg: 'rgba(180,83,9,0.12)',
    icon: ArrowUp,
  },
  quiet: {
    label: 'Quiet',
    color: 'var(--brand-muted)',
    bg: 'var(--brand-bg3)',
    icon: Minus,
  },
  silent: {
    label: 'Silent',
    color: 'var(--brand-muted)',
    bg: 'var(--brand-bg3)',
    icon: MoonStar,
  },
};

export function TrendTag({ trend, size = 'md' }: TrendTagProps) {
  const s = STYLES[trend];
  const Icon = s.icon;
  const small = size === 'sm';
  return (
    <span
      className={
        small
          ? 'inline-flex items-center gap-1 rounded px-1.5 py-0 font-mono text-[9px] font-semibold uppercase tracking-wider'
          : 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider'
      }
      style={{ background: s.bg, color: s.color }}
    >
      <Icon className={small ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {s.label}
    </span>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

const TABS = [
  { key: 'all',            label: 'Everything',      type: undefined },
  { key: 'pricing_change', label: 'Pricing changes', type: 'pricing_change' },
  { key: 'content_change', label: 'Content edits',   type: 'content_change' },
  { key: 'expiry_alert',   label: 'Expiry alerts',   type: 'expiry_alert' },
] as const;

const RANGES = ['7d', '30d', '90d'] as const;

interface IntelligenceFiltersProps {
  events: IntelligenceEvent[];
}

export function IntelligenceFilters({ events }: IntelligenceFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const currentType = params.get('type') ?? 'all';
  const currentRange = (params.get('range') as typeof RANGES[number] | null) ?? '30d';

  function setType(type: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (!type || type === 'all') {
      next.delete('type');
    } else {
      next.set('type', type);
    }
    next.delete('before');
    router.replace(`/intelligence?${next.toString()}`);
  }

  function setRange(range: string) {
    const next = new URLSearchParams(params.toString());
    next.set('range', range);
    next.delete('before');
    router.replace(`/intelligence?${next.toString()}`);
  }

  const counts: Record<string, number> = {
    all: events.length,
    pricing_change: events.filter((e) => e.type === 'pricing_change').length,
    content_change: events.filter((e) => e.type === 'content_change').length,
    expiry_alert:   events.filter((e) => e.type === 'expiry_alert').length,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Pill tab bar */}
      <div className="flex flex-wrap items-center gap-1">
        {TABS.map((tab) => {
          const isActive = currentType === tab.key;
          const count = counts[tab.key] ?? 0;
          const isAmber = tab.key === 'pricing_change';
          const isRed = tab.key === 'expiry_alert';
          return (
            <button
              key={tab.key}
              onClick={() => setType(tab.type)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'bg-brand-bg3 text-brand-text'
                  : 'text-brand-dim hover:bg-brand-bg3/60 hover:text-brand-text'
              )}
              style={isActive ? { boxShadow: 'inset 0 0 0 1px var(--brand-line)' } : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold"
                  style={{
                    background: isAmber
                      ? 'rgba(180,83,9,0.12)'
                      : isRed
                        ? 'rgba(220,38,38,0.1)'
                        : 'var(--brand-bg3)',
                    color: isAmber
                      ? 'var(--brand-amber)'
                      : isRed
                        ? 'var(--brand-red)'
                        : 'var(--brand-muted)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Segmented range control */}
      <div
        className="flex items-center rounded-full p-0.5"
        style={{ background: 'var(--brand-bg3)', boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
      >
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'rounded-full px-3 py-1 font-mono text-xs font-medium transition-all',
              currentRange === r
                ? 'bg-brand-bg text-brand-text shadow-sm'
                : 'text-brand-muted hover:text-brand-dim'
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

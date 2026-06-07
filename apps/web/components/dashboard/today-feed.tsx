'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingDown, AlertTriangle, Activity, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface TodayFeedProps {
  events: IntelligenceEvent[];
  last24hCount: number;
  previousLastSeenAt: Date | null;
}

const EVENT_LABEL: Record<string, string> = {
  price_changed: 'Price change',
  product_added: 'New product',
  product_removed: 'Product removed',
  stock_changed: 'Stock change',
  out_of_stock: 'Out of stock',
  back_in_stock: 'Back in stock',
  sale_started: 'Sale started',
  sale_ended: 'Sale ended',
  site_changed: 'Site change',
  promo_detected: 'Promo detected',
};

type FilterKey = 'all' | 'pricing' | 'stock' | 'promo';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'stock', label: 'Stock' },
  { key: 'promo', label: 'Promo' },
];

const PRICING_TYPES = new Set(['price_changed', 'sale_started', 'sale_ended']);
const STOCK_TYPES = new Set(['stock_changed', 'out_of_stock', 'back_in_stock']);
const PROMO_TYPES = new Set(['promo_detected', 'product_added', 'product_removed']);

function iconForEvent(typeKey: string) {
  if (PRICING_TYPES.has(typeKey)) return TrendingDown;
  if (STOCK_TYPES.has(typeKey)) return ShoppingBag;
  if (PROMO_TYPES.has(typeKey)) return AlertTriangle;
  return Activity;
}

function matchesFilter(typeKey: string, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'pricing') return PRICING_TYPES.has(typeKey);
  if (filter === 'stock') return STOCK_TYPES.has(typeKey);
  if (filter === 'promo') return PROMO_TYPES.has(typeKey);
  return false;
}

export function TodayFeed({ events, last24hCount, previousLastSeenAt }: TodayFeedProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const competitorEvents = useMemo(
    () => events.filter((e) => e.type === 'competitor_event'),
    [events]
  );

  const filtered = useMemo(
    () =>
      competitorEvents.filter((e) =>
        matchesFilter(e.competitorEventType ?? '', filter)
      ),
    [competitorEvents, filter]
  );

  const visible = filtered.slice(0, 10);

  if (competitorEvents.length === 0) {
    return (
      <div
        className="rounded-lg p-8 text-center"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        <p className="text-sm font-medium text-brand-text">No competitor activity yet</p>
        <p className="mt-1 text-xs text-brand-muted">
          Add a competitor to start tracking pricing, stock, and promo changes.
        </p>
        <Link
          href="/wire?tab=competitors"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-brand-green-fg transition-opacity hover:opacity-90"
        >
          Add competitor
        </Link>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line px-5 py-3.5">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand-muted">
            Competitor activity
          </p>
          {last24hCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
              style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--brand-amber)' }}
            >
              {last24hCount} today
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider transition-colors',
                filter === f.key
                  ? 'bg-brand-bg3 text-brand-text'
                  : 'text-brand-muted hover:text-brand-dim'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-brand-muted">
          No events match this filter.
        </div>
      ) : (
        <div>
          {visible.map((e) => {
            const eventTime = new Date(e.timestamp);
            const isNew = previousLastSeenAt !== null && eventTime > previousLastSeenAt;
            const Icon = iconForEvent(e.competitorEventType ?? '');
            return (
              <Link
                key={e.id}
                href={`/wire/competitors/${e.monitorId}?tab=events`}
                className="flex items-start gap-3 border-b border-brand-line/60 px-5 py-3 last:border-b-0 transition-colors hover:bg-brand-bg3/40"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-brand-text">{e.monitorName}</p>
                    {isNew && (
                      <span
                        className="rounded-full px-1.5 py-0 font-mono text-[8px] font-bold uppercase tracking-wider"
                        style={{
                          background: 'rgba(0,229,122,0.12)',
                          color: 'var(--brand-green-ink)',
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted">
                    {EVENT_LABEL[e.competitorEventType ?? ''] ?? 'Competitor event'}
                  </p>
                </div>
                <time className="shrink-0 font-mono text-[10px] text-brand-muted">
                  {formatDistanceToNow(eventTime, { addSuffix: true })}
                </time>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length > visible.length && (
        <Link
          href="/wire"
          className="block border-t border-brand-line px-5 py-3 text-center font-mono text-[10px] text-brand-muted transition-colors hover:text-brand-dim"
        >
          {filtered.length - visible.length} more in the Wire →
        </Link>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Tag,
  Zap,
  Box,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface TodayFeedProps {
  events: IntelligenceEvent[];
  last24hCount: number;
  previousLastSeenAt: Date | null;
}

type FilterKey = 'all' | 'pricing' | 'stock' | 'promo';
type Severity = 'high' | 'med' | 'low';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'stock', label: 'Stock' },
  { key: 'promo', label: 'Promo' },
];

const PRICING_TYPES = new Set(['price_changed', 'sale_started', 'sale_ended']);
const STOCK_TYPES = new Set(['stock_changed', 'out_of_stock', 'back_in_stock']);
const PROMO_TYPES = new Set(['promo_detected', 'product_added', 'product_removed']);

const SEV_STYLES: Record<Severity, { rail: string; soft: string; line: string; ink: string }> = {
  high: {
    rail: 'var(--brand-red)',
    soft: 'rgba(255,68,68,0.12)',
    line: 'rgba(255,68,68,0.32)',
    ink: 'var(--brand-red)',
  },
  med: {
    rail: 'var(--brand-amber)',
    soft: 'rgba(245,180,0,0.12)',
    line: 'rgba(245,180,0,0.30)',
    ink: 'var(--brand-amber)',
  },
  low: {
    rail: 'var(--brand-line)',
    soft: 'var(--brand-bg3)',
    line: 'var(--brand-line)',
    ink: 'var(--brand-muted)',
  },
};

interface SentenceParts {
  verb: string;
  object: string;
  magnitude: string | null;
  derived: boolean;
}

function readNumber(payload: Record<string, unknown>, key: string): number | null {
  const v = payload[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function readString(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function parts(
  typeKey: string,
  payload: Record<string, unknown> | undefined
): SentenceParts {
  const p = payload ?? {};
  switch (typeKey) {
    case 'price_changed': {
      const oldPrice = readNumber(p, 'oldPrice');
      const newPrice = readNumber(p, 'newPrice');
      if (oldPrice !== null && newPrice !== null && oldPrice > 0) {
        const delta = ((newPrice - oldPrice) / oldPrice) * 100;
        const direction = delta < 0 ? 'reduced' : 'raised';
        const mag = `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`;
        return {
          verb: `${direction} prices`,
          object: readString(p, 'productHandle') ?? 'a tracked product',
          magnitude: mag,
          derived: true,
        };
      }
      return { verb: 'changed pricing', object: 'a tracked product', magnitude: null, derived: false };
    }
    case 'sale_started': {
      const current = readNumber(p, 'currentPrice');
      const wasPrice = readNumber(p, 'compareAtPrice');
      let mag: string | null = null;
      if (current !== null && wasPrice !== null && wasPrice > 0) {
        const off = ((wasPrice - current) / wasPrice) * 100;
        if (off > 0) mag = `${off.toFixed(0)}% off`;
      }
      return { verb: 'launched a sale', object: 'on a tracked product', magnitude: mag, derived: mag !== null };
    }
    case 'sale_ended':
      return { verb: 'ended a sale', object: 'on a tracked product', magnitude: null, derived: false };
    case 'product_added': {
      const title = readString(p, 'title');
      return {
        verb: 'added',
        object: title ? `“${title}”` : 'a new product',
        magnitude: null,
        derived: false,
      };
    }
    case 'product_removed': {
      const title = readString(p, 'title');
      return {
        verb: 'removed',
        object: title ? `“${title}”` : 'a product',
        magnitude: null,
        derived: false,
      };
    }
    case 'out_of_stock': {
      const handle = readString(p, 'productHandle');
      return {
        verb: 'sold out of',
        object: handle ? `the ${handle}` : 'a tracked product',
        magnitude: null,
        derived: false,
      };
    }
    case 'back_in_stock': {
      const handle = readString(p, 'productHandle');
      return {
        verb: 'restocked',
        object: handle ? `the ${handle}` : 'a tracked product',
        magnitude: null,
        derived: false,
      };
    }
    case 'stock_changed': {
      const avail = p.newAvailable;
      return {
        verb: avail ? 'restocked' : 'sold out of',
        object: 'a tracked product',
        magnitude: null,
        derived: false,
      };
    }
    case 'promo_detected':
      return {
        verb: 'launched',
        object: readString(p, 'diffSummary') ?? 'a new promo',
        magnitude: null,
        derived: false,
      };
    case 'site_changed':
      return {
        verb: 'updated',
        object: readString(p, 'diffSummary') ?? 'their site',
        magnitude: null,
        derived: false,
      };
    default:
      return { verb: 'made a change', object: '', magnitude: null, derived: false };
  }
}

function severity(typeKey: string, hoursAgo: number, payload: Record<string, unknown> | undefined): Severity {
  if (PRICING_TYPES.has(typeKey)) {
    if (typeKey === 'price_changed' && payload) {
      const oldPrice = readNumber(payload, 'oldPrice');
      const newPrice = readNumber(payload, 'newPrice');
      if (oldPrice !== null && newPrice !== null && oldPrice > 0) {
        const delta = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);
        if (delta >= 10) return 'high';
        if (delta >= 3) return 'med';
        return 'low';
      }
    }
    if (typeKey === 'sale_started') return hoursAgo <= 12 ? 'high' : 'med';
    return 'med';
  }
  if (PROMO_TYPES.has(typeKey)) return 'med';
  if (STOCK_TYPES.has(typeKey)) return 'low';
  return 'low';
}

function iconFor(typeKey: string, sev: Severity): LucideIcon {
  if (typeKey === 'price_changed') return sev === 'high' ? TrendingDown : TrendingUp;
  if (typeKey === 'sale_started' || typeKey === 'sale_ended') return Zap;
  if (typeKey === 'promo_detected') return Tag;
  if (STOCK_TYPES.has(typeKey)) return ShoppingBag;
  if (typeKey === 'product_added' || typeKey === 'product_removed') return Box;
  if (typeKey === 'site_changed') return Activity;
  return Activity;
}

function hoursSince(ts: string | Date): number {
  return (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60);
}

function matchesFilter(typeKey: string, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'pricing') return PRICING_TYPES.has(typeKey);
  if (filter === 'stock') return STOCK_TYPES.has(typeKey);
  if (filter === 'promo') return PROMO_TYPES.has(typeKey);
  return false;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
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

  const visible = filtered.slice(0, 8);

  if (competitorEvents.length === 0) {
    return (
      <div
        className="rounded-lg px-6 py-10 text-center"
        style={{
          background: 'var(--brand-bg2)',
          boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
        }}
      >
        <ShieldCheck
          className="mx-auto mb-2 h-6 w-6"
          style={{ color: 'var(--brand-green-ink)' }}
          aria-hidden
        />
        <p className="text-sm font-medium text-brand-text">The market is quiet</p>
        <p className="mt-1 text-xs text-brand-muted">
          No competitor changes detected. Add a competitor to start tracking pricing,
          stock, and promo moves.
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
    <section
      aria-label="Competitor activity"
      className="overflow-hidden rounded-lg"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line px-5 py-3">
        <div className="flex items-center gap-2.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
            Competitor activity
          </p>
          {last24hCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{
                background: 'rgba(245,180,0,0.16)',
                color: 'var(--brand-amber)',
              }}
            >
              {last24hCount} today
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" role="tablist" aria-label="Event filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
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
        <ul className="divide-y divide-brand-line-soft">
          {visible.map((e) => {
            const typeKey = e.competitorEventType ?? '';
            const hrs = hoursSince(e.timestamp);
            const sev = severity(typeKey, hrs, e.payload);
            const sevStyle = SEV_STYLES[sev];
            const Icon = iconFor(typeKey, sev);
            const sentence = parts(typeKey, e.payload);
            const eventTime = new Date(e.timestamp);
            const isNew = previousLastSeenAt !== null && eventTime > previousLastSeenAt;
            const domain = domainOf(e.monitorUrl);

            return (
              <li key={e.id} className="relative">
                <Link
                  href={`/wire/competitors/${e.monitorId}?tab=events`}
                  className="flex items-center gap-3 py-3 pl-4 pr-4 transition-colors hover:bg-brand-bg3/40"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{
                      background: sevStyle.rail,
                      opacity: sev === 'low' ? 0.5 : 1,
                    }}
                  />
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: sevStyle.soft,
                      boxShadow: `inset 0 0 0 1px ${sevStyle.line}`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: sevStyle.ink }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-snug text-brand-dim">
                      <span className="font-semibold text-brand-text">
                        {e.monitorName}
                      </span>{' '}
                      {sentence.verb} {sentence.object}
                      {sentence.magnitude && (
                        <>
                          {' ('}
                          <span
                            className="font-semibold"
                            style={{
                              color: sev === 'high' ? 'var(--brand-red)' : 'var(--brand-dim)',
                              borderBottom: sentence.derived
                                ? '1px dotted var(--brand-muted)'
                                : 'none',
                            }}
                            title={sentence.derived ? 'Approximate, derived from payload' : undefined}
                          >
                            {sentence.magnitude}
                          </span>
                          {')'}
                        </>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted">
                        {domain}
                      </span>
                      {isNew && (
                        <span
                          className="rounded-full px-1.5 py-0 font-mono text-[8.5px] font-bold uppercase tracking-wider"
                          style={{
                            background: 'rgba(0,229,122,0.12)',
                            color: 'var(--brand-green-ink)',
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <time
                    dateTime={eventTime.toISOString()}
                    className="shrink-0 font-mono text-[10.5px] text-brand-muted"
                  >
                    {formatDistanceToNow(eventTime, { addSuffix: true })}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > visible.length && (
        <Link
          href="/wire"
          className="block border-t border-brand-line px-5 py-3 text-center font-mono text-[10.5px] text-brand-muted transition-colors hover:text-brand-dim"
        >
          {filtered.length - visible.length} more in the Wire →
        </Link>
      )}
    </section>
  );
}

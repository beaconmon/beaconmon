'use client';

import Link from 'next/link';
import { TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface CompetitorSignalsPanelProps {
  events: IntelligenceEvent[];
  last24hCount: number;
}

const EVENT_LABEL: Record<string, string> = {
  price_changed: 'Price change',
  product_added: 'New product',
  product_removed: 'Removed',
  stock_changed: 'Stock change',
  out_of_stock: 'Out of stock',
  back_in_stock: 'Back in stock',
  sale_started: 'Sale started',
  sale_ended: 'Sale ended',
  site_changed: 'Site change',
  promo_detected: 'Promo detected',
};

export function CompetitorSignalsPanel({ events, last24hCount }: CompetitorSignalsPanelProps) {
  const competitorEvents = events.filter((e) => e.type === 'competitor_event');

  if (competitorEvents.length === 0) return null;

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Competitor signals
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

      <div>
        {competitorEvents.slice(0, 5).map((e) => (
          <Link
            key={e.id}
            href={`/competitors/${e.monitorId}?tab=events`}
            className="flex items-start gap-3 border-b border-brand-line/60 px-4 py-2.5 last:border-b-0 transition-colors hover:bg-brand-bg3/40"
          >
            <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-brand-text">{e.monitorName}</p>
              <p className="text-[10px] text-brand-muted">
                {EVENT_LABEL[e.competitorEventType ?? ''] ?? 'Competitor event'}
              </p>
            </div>
            <time className="shrink-0 font-mono text-[10px] text-brand-muted">
              {formatDistanceToNow(new Date(e.timestamp), { addSuffix: true })}
            </time>
          </Link>
        ))}
        {competitorEvents.length > 5 && (
          <Link
            href="/intelligence"
            className="block px-4 py-2.5 text-center font-mono text-[10px] text-brand-muted transition-colors hover:text-brand-dim"
          >
            {competitorEvents.length - 5} more in intelligence feed
          </Link>
        )}
      </div>
    </div>
  );
}

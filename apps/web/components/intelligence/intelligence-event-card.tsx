'use client';

import Link from 'next/link';
import { ShieldAlert, Globe, DollarSign, FileText, TrendingDown } from 'lucide-react';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface IntelligenceEventCardProps {
  event: IntelligenceEvent;
  isCompetitor?: boolean;
}

function formatTimestamp(ts: string | Date): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPayloadSummary(
  type: string | undefined,
  payload: Record<string, unknown> | undefined
): string {
  if (!type || !payload) return '';
  switch (type) {
    case 'price_changed':
      return `$${payload.oldPrice} → $${payload.newPrice}`;
    case 'product_added':
      return `New: ${payload.title}`;
    case 'product_removed':
      return `Removed: ${payload.title}`;
    case 'stock_changed':
      return payload.newAvailable ? 'Back in stock' : 'Out of stock';
    case 'out_of_stock':
      return `Out of stock: ${payload.productHandle ?? ''}`;
    case 'back_in_stock':
      return `Back in stock: ${payload.productHandle ?? ''}`;
    case 'sale_started':
      return `Sale: $${payload.currentPrice} (was $${payload.compareAtPrice})`;
    case 'sale_ended':
      return `Sale ended (was $${payload.wasCompareAtPrice})`;
    case 'site_changed':
    case 'promo_detected':
      return (payload.diffSummary as string | undefined) ?? 'Content changed';
    default:
      return '';
  }
}

function EventIcon({ event }: { event: IntelligenceEvent }) {
  if (event.type === 'expiry_alert') {
    return event.expiryType === 'ssl'
      ? <ShieldAlert className="h-4 w-4 text-amber-500" />
      : <Globe className="h-4 w-4 text-amber-500" />;
  }
  if (event.type === 'pricing_change') {
    return <DollarSign className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  }
  if (event.type === 'competitor_event') {
    return <TrendingDown className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  }
  return <FileText className="h-4 w-4 text-brand-dim" />;
}

export function IntelligenceEventCard({ event, isCompetitor = true }: IntelligenceEventCardProps) {
  const isExpiry = event.type === 'expiry_alert';
  const isCompetitorEvent = event.type === 'competitor_event';

  const sourceKicker = isExpiry
    ? null
    : (isCompetitor || isCompetitorEvent)
      ? { label: 'COMPETITOR', color: 'text-amber-500 dark:text-amber-400' }
      : { label: 'YOUR STORE', color: 'text-brand-muted' };

  const typeLabel = (() => {
    if (isCompetitorEvent) {
      const map: Record<string, string> = {
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
      return map[event.competitorEventType ?? ''] ?? 'Competitor event';
    }
    if (event.type === 'pricing_change') return 'Pricing change';
    if (event.type === 'content_change') return 'Content edit';
    return event.expiryType === 'ssl' ? 'SSL expiring' : 'Domain expiring';
  })();

  const badgeAmber = event.type === 'pricing_change' || isCompetitorEvent;
  const badgeRed = event.type === 'expiry_alert' && (event.daysRemaining ?? 99) <= 7;

  return (
    <div className="grid grid-cols-[38px_1fr_120px] gap-3 px-4 py-3 transition-colors hover:bg-brand-bg3/30">
      {/* Icon */}
      <div className="flex items-start justify-center pt-0.5">
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg"
          style={{ background: 'var(--brand-bg3)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
        >
          <EventIcon event={event} />
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 space-y-0.5">
        {sourceKicker && (
          <p className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${sourceKicker.color}`}>
            {sourceKicker.label}
          </p>
        )}
        <p className="truncate text-sm font-medium italic text-brand-text">{event.monitorName}</p>
        <p className="truncate font-mono text-xs text-brand-muted">{event.monitorUrl}</p>
        {isCompetitorEvent && (
          <p className="mt-1 text-sm text-brand-dim">
            {formatPayloadSummary(event.competitorEventType, event.payload)}
          </p>
        )}
        {!isCompetitorEvent && !isExpiry && event.diffSummary && (
          <p className="mt-1 line-clamp-2 text-sm text-brand-dim">{event.diffSummary}</p>
        )}
        {isExpiry && event.daysRemaining != null && (
          <p className="text-sm text-brand-dim">
            {event.daysRemaining} day{event.daysRemaining === 1 ? '' : 's'} remaining
          </p>
        )}
        {/* Action row */}
        <div className="flex items-center gap-3 pt-0.5">
          {isCompetitorEvent ? (
            <Link
              href={`/competitors/${event.monitorId}?tab=events`}
              className="text-xs text-brand-green-ink hover:underline"
            >
              View event
            </Link>
          ) : !isExpiry && event.snapshotId ? (
            <Link
              href={
                isCompetitor
                  ? `/competitors/${event.monitorId}?tab=pages`
                  : `/monitors/${event.monitorId}?tab=snapshots`
              }
              className="text-xs text-brand-green-ink hover:underline"
            >
              View change
            </Link>
          ) : null}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1">
        <time
          className="font-mono text-[11px] text-brand-muted"
          dateTime={new Date(event.timestamp).toISOString()}
        >
          {formatTimestamp(event.timestamp)}
        </time>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
          style={{
            background: badgeAmber
              ? 'rgba(180,83,9,0.1)'
              : badgeRed
                ? 'rgba(220,38,38,0.08)'
                : 'var(--brand-bg3)',
            color: badgeAmber
              ? 'var(--brand-amber)'
              : badgeRed
                ? 'var(--brand-red)'
                : 'var(--brand-muted)',
          }}
        >
          {typeLabel}
        </span>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ShieldAlert, Globe, DollarSign, FileText } from 'lucide-react';
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

function EventIcon({ event }: { event: IntelligenceEvent }) {
  if (event.type === 'expiry_alert') {
    return event.expiryType === 'ssl'
      ? <ShieldAlert className="h-4 w-4 text-amber-500" />
      : <Globe className="h-4 w-4 text-amber-500" />;
  }
  if (event.type === 'pricing_change') {
    return <DollarSign className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  }
  return <FileText className="h-4 w-4 text-brand-dim" />;
}

export function IntelligenceEventCard({ event, isCompetitor = true }: IntelligenceEventCardProps) {
  const isExpiry = event.type === 'expiry_alert';

  const sourceKicker = isExpiry
    ? null
    : isCompetitor
      ? { label: 'COMPETITOR', color: 'text-amber-500 dark:text-amber-400' }
      : { label: 'YOUR STORE', color: 'text-brand-muted' };

  const typeLabel =
    event.type === 'pricing_change'
      ? 'Pricing change'
      : event.type === 'content_change'
        ? 'Content edit'
        : event.expiryType === 'ssl'
          ? 'SSL expiring'
          : 'Domain expiring';

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
        <p className="font-mono text-xs text-brand-muted truncate">{event.monitorUrl}</p>
        {!isExpiry && event.diffSummary && (
          <p className="mt-1 line-clamp-2 text-sm text-brand-dim">{event.diffSummary}</p>
        )}
        {isExpiry && event.daysRemaining != null && (
          <p className="text-sm text-brand-dim">
            {event.daysRemaining} day{event.daysRemaining === 1 ? '' : 's'} remaining
          </p>
        )}
        {/* Action row */}
        <div className="flex items-center gap-3 pt-0.5">
          {!isExpiry && event.snapshotId && (
            <Link
              href={`/monitors/${event.monitorId}?tab=snapshots`}
              className="text-xs text-brand-green-ink hover:underline"
            >
              View change
            </Link>
          )}
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
            background:
              event.type === 'pricing_change'
                ? 'rgba(180,83,9,0.1)'
                : event.type === 'expiry_alert' && (event.daysRemaining ?? 99) <= 7
                  ? 'rgba(220,38,38,0.08)'
                  : 'var(--brand-bg3)',
            color:
              event.type === 'pricing_change'
                ? 'var(--brand-amber)'
                : event.type === 'expiry_alert' && (event.daysRemaining ?? 99) <= 7
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

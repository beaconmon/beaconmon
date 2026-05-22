'use client';

import Link from 'next/link';
import { ExternalLink, ShieldAlert, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface IntelligenceEventCardProps {
  event: IntelligenceEvent;
}

function formatTimestamp(ts: string | Date): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventTypeBadge({ type }: { type: IntelligenceEvent['type'] }) {
  if (type === 'pricing_change') {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
        Pricing change
      </Badge>
    );
  }
  if (type === 'content_change') {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
        Content change
      </Badge>
    );
  }
  return null;
}

function ExpiryBadge({ expiryType, daysRemaining }: { expiryType: 'ssl' | 'domain'; daysRemaining?: number }) {
  const isUrgent = (daysRemaining ?? 99) <= 7;
  const isSoon = (daysRemaining ?? 99) <= 14;
  const colorClass = isUrgent
    ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'
    : isSoon
    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';

  const label = expiryType === 'ssl' ? 'SSL expiring' : 'Domain expiring';
  return <Badge className={colorClass}>{label}</Badge>;
}

export function IntelligenceEventCard({ event }: IntelligenceEventCardProps) {
  const isExpiry = event.type === 'expiry_alert';

  return (
    <div className="flex items-start gap-4 px-4 py-3 hover:bg-brand-bg3/30">
      <div className="mt-1.5 shrink-0">
        {isExpiry ? (
          event.expiryType === 'ssl' ? (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          ) : (
            <Globe className="h-4 w-4 text-amber-500" />
          )
        ) : (
          <div className="h-2 w-2 rounded-full bg-brand-green mt-0.5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-brand-text truncate">{event.monitorName}</span>
          <a
            href={event.monitorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-brand-muted hover:text-brand-dim"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
          {isExpiry && event.expiryType ? (
            <ExpiryBadge expiryType={event.expiryType} daysRemaining={event.daysRemaining} />
          ) : (
            <EventTypeBadge type={event.type} />
          )}
          {isExpiry && event.daysRemaining != null && (
            <span className="rounded-full bg-brand-bg3 px-2 py-0.5 text-xs font-medium text-brand-muted">
              {event.daysRemaining}d remaining
            </span>
          )}
        </div>

        <p className="font-mono text-xs text-brand-muted truncate mt-0.5">{event.monitorUrl}</p>

        {!isExpiry && event.diffSummary && (
          <p className="mt-1 text-sm text-brand-dim line-clamp-2">{event.diffSummary}</p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <time className="font-mono text-xs text-brand-muted" dateTime={new Date(event.timestamp).toISOString()}>
          {formatTimestamp(event.timestamp)}
        </time>
        {!isExpiry && event.snapshotId && (
          <div className="mt-0.5">
            <Link
              href={`/monitors/${event.monitorId}?tab=snapshots`}
              className="text-xs text-brand-green-ink hover:underline"
            >
              View diff
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

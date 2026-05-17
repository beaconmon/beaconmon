'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { CompetitorFeedItem } from '@/lib/hooks/use-competitors';

interface CompetitorTimelineProps {
  items: CompetitorFeedItem[];
}

export function CompetitorTimeline({ items }: CompetitorTimelineProps) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Recent changes
        </h2>
      </div>

      <div className="divide-y divide-brand-line">
        {items.map((item) => (
          <div key={item.snapshotId} className="flex items-start gap-4 px-4 py-3 hover:bg-brand-bg3/30">
            {/* Timeline dot */}
            <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-brand-green" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-brand-text truncate">
                  {item.monitorName}
                </span>
                <a
                  href={item.monitorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-brand-muted hover:text-brand-dim"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="font-mono text-xs text-brand-muted truncate">{item.monitorUrl}</p>
            </div>

            <div className="shrink-0 text-right">
              <time className="font-mono text-xs text-brand-muted" dateTime={item.capturedAt}>
                {new Date(item.capturedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              <div className="mt-0.5">
                <Link
                  href={`/monitors/${item.monitorId}?tab=snapshots`}
                  className="text-xs text-brand-green-ink hover:underline"
                >
                  View diff
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

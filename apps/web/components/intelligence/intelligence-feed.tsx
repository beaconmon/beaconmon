'use client';

import { Button } from '@/components/ui/button';
import { IntelligenceEventCard } from './intelligence-event-card';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface IntelligenceFeedProps {
  events: IntelligenceEvent[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function IntelligenceFeed({ events, hasMore, isLoading, onLoadMore }: IntelligenceFeedProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Activity feed
          </h2>
        </div>
        <div className="divide-y divide-brand-line">
          {events.map((event) => (
            <IntelligenceEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            className="border-brand-line text-brand-dim hover:text-brand-text"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

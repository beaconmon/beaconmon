'use client';

import { Button } from '@/components/ui/button';
import { IntelligenceEventCard } from './intelligence-event-card';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface IntelligenceFeedProps {
  events: IntelligenceEvent[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  monitorIsCompetitorMap?: Map<string, boolean>;
  previousLastSeenAt?: Date | null;
}

export function IntelligenceFeed({
  events,
  hasMore,
  isLoading,
  onLoadMore,
  monitorIsCompetitorMap,
  previousLastSeenAt = null,
}: IntelligenceFeedProps) {
  return (
    <div className="space-y-4">
      <div className="divide-y divide-brand-line">
        {events.map((event) => (
          <IntelligenceEventCard
            key={event.id}
            event={event}
            isCompetitor={monitorIsCompetitorMap ? (monitorIsCompetitorMap.get(event.monitorId) ?? true) : true}
            previousLastSeenAt={previousLastSeenAt}
          />
        ))}
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

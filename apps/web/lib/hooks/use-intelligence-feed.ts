'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api-fetch';
import type { IntelligenceEvent } from '@/lib/repositories/intelligence';

export type { IntelligenceEvent };

interface FeedResponse {
  events: IntelligenceEvent[];
  hasMore: boolean;
  activeCompetitorCount: number;
}

export interface FilterParams {
  monitorId?: string;
  type?: string;
  range?: '7d' | '30d' | '90d';
}

interface UseFeedResult {
  events: IntelligenceEvent[];
  hasMore: boolean;
  activeCompetitorCount: number;
  isLoading: boolean;
  isError: boolean;
  loadMore: () => void;
  refresh: () => void;
}

function buildUrl(filters: FilterParams, before?: string): string {
  const params = new URLSearchParams({ limit: '20' });
  if (filters.monitorId) params.set('monitorId', filters.monitorId);
  if (filters.type) params.set('type', filters.type);
  if (filters.range) params.set('range', filters.range);
  if (before) params.set('before', before);
  return `/api/intelligence/feed?${params.toString()}`;
}

export function useIntelligenceFeed(filters: FilterParams): UseFeedResult {
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [activeCompetitorCount, setActiveCompetitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);

  const fetchPage = useCallback(
    async (before?: string, append = false) => {
      setIsLoading(true);
      setIsError(false);
      try {
        const res = await apiFetch(buildUrl(filters, before));
        if (!res.ok) throw new Error('Failed to fetch intelligence feed');
        const data: FeedResponse = await res.json();
        setEvents((prev) => (append ? [...prev, ...data.events] : data.events));
        setHasMore(data.hasMore);
        setActiveCompetitorCount(data.activeCompetitorCount);
        if (data.events.length > 0) {
          const last = data.events[data.events.length - 1];
          setCursor(last ? new Date(last.timestamp).toISOString() : undefined);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  );

  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      setCursor(undefined);
      setEvents([]);
    }
    void fetchPage(undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    void fetchPage(cursor, true);
  }, [hasMore, isLoading, cursor, fetchPage]);

  const refresh = useCallback(() => {
    setCursor(undefined);
    setEvents([]);
    void fetchPage(undefined, false);
  }, [fetchPage]);

  return { events, hasMore, activeCompetitorCount, isLoading, isError, loadMore, refresh };
}

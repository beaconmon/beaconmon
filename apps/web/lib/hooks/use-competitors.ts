'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

export interface CompetitorItem {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
}

export function useCompetitors() {
  return useQuery<CompetitorItem[]>({
    queryKey: ['competitors'],
    queryFn: async () => {
      const res = await apiFetch('/api/competitors');
      if (!res.ok) throw new Error('Failed to fetch competitors');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export interface CompetitorFeedItem {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  snapshotId: string;
  capturedAt: string;
}

interface FeedResponse {
  items: CompetitorFeedItem[];
  hasMore: boolean;
  activeCount: number;
}

export function useCompetitorFeed() {
  return useQuery<FeedResponse>({
    queryKey: ['competitor-feed'],
    queryFn: async () => {
      const res = await apiFetch('/api/competitors/feed?limit=20');
      if (!res.ok) throw new Error('Failed to fetch competitor feed');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useInvalidateCompetitorFeed() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['competitor-feed'] });
}

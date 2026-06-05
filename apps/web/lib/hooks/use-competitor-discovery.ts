'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

export type DiscoveryState = 'pending' | 'syncing' | 'ready' | 'failed' | 'not_applicable';

export interface DiscoveryStatus {
  state: DiscoveryState;
  productCount: number;
  lastSyncedAt: string | null;
  error: string | null;
}

export function useCompetitorDiscovery(competitorId: string) {
  return useQuery<DiscoveryStatus>({
    queryKey: ['competitor-discovery', competitorId],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${competitorId}/discovery`);
      if (!res.ok) throw new Error('Failed to fetch discovery state');
      return res.json() as Promise<DiscoveryStatus>;
    },
    refetchInterval: (query) => {
      const data = query.state.data as DiscoveryStatus | undefined;
      return data?.state === 'pending' || data?.state === 'syncing' ? 3000 : false;
    },
  });
}

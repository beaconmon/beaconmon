'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { ReliabilityStats } from '@/lib/repositories/monitoring-runs';

export function useReliability() {
  return useQuery<ReliabilityStats>({
    queryKey: ['reliability'],
    queryFn: async () => {
      const res = await apiFetch('/api/dashboard/reliability');
      if (!res.ok) throw new Error('Failed to fetch reliability');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

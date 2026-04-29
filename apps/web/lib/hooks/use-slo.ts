'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SloData } from '@/lib/repositories/slo';

export function useSlo(monitorId: string) {
  return useQuery<SloData>({
    queryKey: ['slo', monitorId],
    queryFn: async () => {
      const res = await fetch(`/api/monitors/${monitorId}/slo`);
      if (!res.ok) throw new Error('Failed to fetch SLO data');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

export interface UpdateSloInput {
  sloTarget: number | null;
  sloWindowDays?: number | null;
  sloBurnRateFastThreshold?: number | null;
  sloBurnRateSlowThreshold?: number | null;
}

export function useUpdateSlo(monitorId: string) {
  const queryClient = useQueryClient();
  return useMutation<SloData, Error, UpdateSloInput>({
    mutationFn: async (data) => {
      const res = await fetch(`/api/monitors/${monitorId}/slo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update SLO');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slo', monitorId] });
    },
  });
}

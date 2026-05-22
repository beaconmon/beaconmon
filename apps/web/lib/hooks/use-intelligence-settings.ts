'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { DigestPrefs, UpdateDigestPrefs } from '@beaconmon/types';

interface SettingsResponse {
  prefs: DigestPrefs;
  plan: string;
}

export function useIntelligenceSettings() {
  return useQuery<SettingsResponse>({
    queryKey: ['intelligence-settings'],
    queryFn: async () => {
      const res = await apiFetch('/api/intelligence/settings');
      if (!res.ok) throw new Error('Failed to fetch intelligence settings');
      return res.json();
    },
  });
}

export function useUpdateIntelligenceSettings() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateDigestPrefs>({
    mutationFn: async (data) => {
      const res = await apiFetch('/api/intelligence/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to save settings');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence-settings'] });
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { NotificationPreferenceRow } from '@/lib/repositories/notification-preferences';

export type { NotificationPreferenceRow };

export function useMyNotificationPreferences() {
  return useQuery<NotificationPreferenceRow>({
    queryKey: ['notification-preferences', 'me'],
    queryFn: async () => {
      const res = await apiFetch('/api/me/notification-preferences');
      if (!res.ok) throw new Error('Failed to fetch notification preferences');
      return res.json();
    },
  });
}

export function useUpdateMyPrimaryChannel() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferenceRow, Error, { primaryChannelId: string | null }>({
    mutationFn: async (data) => {
      const res = await apiFetch('/api/me/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Failed to update');
      return json as NotificationPreferenceRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', 'me'] });
    },
  });
}

export interface TeamNotificationSummaryRow {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  primaryChannelId: string | null;
  primaryChannelName: string | null;
}

export function useTeamNotificationSummary(enabled = true) {
  return useQuery<TeamNotificationSummaryRow[]>({
    queryKey: ['notification-preferences', 'team'],
    enabled,
    queryFn: async () => {
      const res = await apiFetch('/api/team/notification-preferences');
      if (!res.ok) throw new Error('Failed to fetch team notification preferences');
      return res.json();
    },
  });
}

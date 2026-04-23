'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AlertChannelRow } from '@/lib/repositories/alert-channels';
import type { CreateAlertChannelInput } from '@/lib/validations/alert-channels';

export function useAlertChannels() {
  return useQuery<AlertChannelRow[]>({
    queryKey: ['alert-channels'],
    queryFn: async () => {
      const res = await fetch('/api/alert-channels');
      if (!res.ok) throw new Error('Failed to fetch alert channels');
      return res.json();
    },
  });
}

export function useCreateAlertChannel() {
  const queryClient = useQueryClient();
  return useMutation<AlertChannelRow, Error, CreateAlertChannelInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/alert-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to create alert channel');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] });
    },
  });
}

export function useDeleteAlertChannel(id: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: async () => {
      const res = await fetch(`/api/alert-channels/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete alert channel');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] });
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MaintenanceWindowRow } from '@/lib/repositories/maintenance-windows';

export function useMaintenanceWindows() {
  return useQuery<MaintenanceWindowRow[]>({
    queryKey: ['maintenance-windows'],
    queryFn: async () => {
      const res = await fetch('/api/maintenance-windows');
      if (!res.ok) throw new Error('Failed to fetch maintenance windows');
      return res.json();
    },
  });
}

export interface CreateMaintenanceWindowInput {
  startsAt: string;
  endsAt: string;
  reason?: string;
  monitorIds: string[];
}

export function useCreateMaintenanceWindow() {
  const queryClient = useQueryClient();
  return useMutation<MaintenanceWindowRow, Error, CreateMaintenanceWindowInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/maintenance-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to create maintenance window');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] });
    },
  });
}

export function useDeleteMaintenanceWindow() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/maintenance-windows/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete maintenance window');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] });
    },
  });
}

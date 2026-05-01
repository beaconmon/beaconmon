'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { MaintenanceWindowRow } from '@/lib/repositories/maintenance-windows';

export function useMaintenanceWindows(opts?: { enabled?: boolean }) {
  return useQuery<MaintenanceWindowRow[]>({
    queryKey: ['maintenance-windows'],
    queryFn: async () => {
      const res = await apiFetch('/api/maintenance-windows');
      if (!res.ok) throw new Error('Failed to fetch maintenance windows');
      return res.json();
    },
    enabled: opts?.enabled ?? true,
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
      const res = await apiFetch('/api/maintenance-windows', {
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

export interface UpdateMaintenanceWindowInput {
  startsAt?: string;
  endsAt?: string;
  reason?: string | null;
  monitorIds?: string[];
}

export function useUpdateMaintenanceWindow(id: string) {
  const queryClient = useQueryClient();
  return useMutation<MaintenanceWindowRow, Error, UpdateMaintenanceWindowInput>({
    mutationFn: async (data) => {
      const res = await apiFetch(`/api/maintenance-windows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update maintenance window');
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
      const res = await apiFetch(`/api/maintenance-windows/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete maintenance window');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] });
    },
  });
}

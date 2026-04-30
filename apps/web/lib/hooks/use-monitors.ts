'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { CreateMonitorInput, UpdateMonitorInput } from '@/lib/validations/monitors';

export interface MonitorSummary {
  uptime30d: number | null;
  recentRts: number[];
}

export function useMonitorSummaries() {
  return useQuery<Record<string, MonitorSummary>>({
    queryKey: ['monitor-summaries'],
    queryFn: async () => {
      const res = await apiFetch('/api/monitors/summaries');
      if (!res.ok) throw new Error('Failed to fetch monitor summaries');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useMonitors() {
  return useQuery<MonitorRow[]>({
    queryKey: ['monitors'],
    queryFn: async () => {
      const res = await apiFetch('/api/monitors');
      if (!res.ok) throw new Error('Failed to fetch monitors');
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useMonitor(id: string) {
  return useQuery<MonitorRow>({
    queryKey: ['monitors', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/monitors/${id}`);
      if (!res.ok) throw new Error('Failed to fetch monitor');
      return res.json();
    },
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();
  return useMutation<MonitorRow, Error, CreateMonitorInput>({
    mutationFn: async (data) => {
      const res = await apiFetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to create monitor');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

export function useUpdateMonitor(id: string) {
  const queryClient = useQueryClient();
  return useMutation<MonitorRow, Error, UpdateMonitorInput>({
    mutationFn: async (data) => {
      const res = await apiFetch(`/api/monitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update monitor');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', id] });
    },
  });
}

export function useDeleteMonitor(id: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: async () => {
      const res = await apiFetch(`/api/monitors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete monitor');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });
}

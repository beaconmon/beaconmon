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

export function useMonitors(opts?: { enabled?: boolean; tag?: string }) {
  const tag = opts?.tag;
  return useQuery<MonitorRow[]>({
    queryKey: tag ? ['monitors', { tag }] : ['monitors'],
    queryFn: async () => {
      const url = tag ? `/api/monitors?tag=${encodeURIComponent(tag)}` : '/api/monitors';
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch monitors');
      return res.json();
    },
    refetchInterval: 30_000,
    enabled: opts?.enabled ?? true,
  });
}

export function useMonitorTags() {
  return useQuery<string[]>({
    queryKey: ['monitor-tags'],
    queryFn: async () => {
      const res = await apiFetch('/api/monitors/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      return res.json();
    },
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

export type BulkMonitorAction =
  | { action: 'pause'; monitorIds: string[] }
  | { action: 'resume'; monitorIds: string[] }
  | { action: 'delete'; monitorIds: string[] }
  | { action: 'set-interval'; monitorIds: string[]; intervalSeconds: number }
  | { action: 'add-tag'; monitorIds: string[]; tag: string };

export function useBulkMonitorAction() {
  const queryClient = useQueryClient();
  return useMutation<{ updated: number }, Error, BulkMonitorAction>({
    mutationFn: async (input) => {
      const res = await apiFetch('/api/monitors/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Bulk action failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-tags'] });
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

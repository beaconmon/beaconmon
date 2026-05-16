'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { CreateMonitorInput } from '@/lib/validations/monitors';

export interface DiscoverySuggestion {
  type: 'http' | 'ssl' | 'domain';
  url: string;
  name: string;
  reason: string;
  defaultIntervalSeconds: number;
  checkedByDefault: boolean;
}

export interface DiscoverResponse {
  domain: string;
  suggestions: DiscoverySuggestion[];
  warnings: string[];
  cappedByPlan: boolean;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function useDiscoverMonitors() {
  return useMutation<DiscoverResponse, Error, { domain: string }>({
    mutationFn: (input) => postJson<DiscoverResponse>('/api/monitors/discover', input),
  });
}

export interface BulkCreateInput {
  monitors: CreateMonitorInput[];
  source?: 'discovery' | 'template' | 'import';
}

export interface BulkCreateResponse {
  created: MonitorRow[];
}

export function useBulkCreateMonitors() {
  const queryClient = useQueryClient();
  return useMutation<BulkCreateResponse, Error, BulkCreateInput>({
    mutationFn: (input) => postJson<BulkCreateResponse>('/api/monitors/bulk-create', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-tags'] });
    },
  });
}

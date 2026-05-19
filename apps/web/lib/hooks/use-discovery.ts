'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { CreateMonitorInput } from '@/lib/validations/monitors';

export interface DiscoverySuggestion {
  type: 'http' | 'ssl' | 'domain' | 'content';
  url: string;
  name: string;
  reason: string;
  defaultIntervalSeconds: number;
  checkedByDefault: boolean;
  source?: 'sitemap' | 'ai' | 'ai+sitemap' | 'apex';
  aiReason?: string;
  selectorCandidates?: string[];
  selectorChosen?: string | null;
  classification?: 'pricing' | 'changelog' | 'feature' | 'docs' | 'legal' | 'other';
  generatedAt?: string;
}

export interface AiClassification {
  category: 'saas' | 'ecommerce' | 'marketing' | 'blog' | 'docs' | 'app' | 'other';
  confidence: number;
}

export interface DiscoverResponse {
  domain: string;
  suggestions: DiscoverySuggestion[];
  warnings: string[];
  cappedByPlan: boolean;
  degraded?: boolean;
  aiClassification?: AiClassification;
  aiModel?: string;
  aiDurationMs?: number;
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
  source?: 'discovery' | 'template' | 'import' | 'smart-setup';
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

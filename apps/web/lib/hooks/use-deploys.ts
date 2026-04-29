'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeployEventRow } from '@/lib/repositories/deploy-events';

export function useDeploys(monitorId: string) {
  return useQuery<DeployEventRow[]>({
    queryKey: ['deploys', monitorId],
    queryFn: async () => {
      const res = await fetch(`/api/monitors/${monitorId}/deploys?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch deploys');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

export interface CreateDeployInput {
  description?: string;
  commitSha?: string;
  suppressAlerts?: boolean;
}

export function useStartDeploy(monitorId: string) {
  const queryClient = useQueryClient();
  return useMutation<DeployEventRow, Error, CreateDeployInput>({
    mutationFn: async (data) => {
      const res = await fetch(`/api/monitors/${monitorId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to start deploy');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploys', monitorId] });
    },
  });
}

export function useEndDeploy(monitorId: string) {
  const queryClient = useQueryClient();
  return useMutation<DeployEventRow | null, Error>({
    mutationFn: async () => {
      const res = await fetch(`/api/monitors/${monitorId}/deploy/end`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to end deploy');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploys', monitorId] });
    },
  });
}

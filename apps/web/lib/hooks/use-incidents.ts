'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IncidentRow, IncidentWithMonitor } from '@/lib/repositories/incidents';

export function useIncidents() {
  return useQuery<IncidentWithMonitor[]>({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return res.json();
    },
  });
}

export function useMonitorIncidents(monitorId: string) {
  return useQuery<IncidentRow[]>({
    queryKey: ['incidents', 'monitor', monitorId],
    queryFn: async () => {
      const res = await fetch(`/api/monitors/${monitorId}/incidents`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

export function useResolveIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation<{ resolved: boolean }, Error>({
    mutationFn: async () => {
      const res = await fetch(`/api/incidents/${id}/resolve`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to resolve incident');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

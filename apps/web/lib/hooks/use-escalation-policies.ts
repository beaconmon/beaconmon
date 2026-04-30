'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';
import type { EscalationPolicyRow, EscalationStepInput } from '@/lib/repositories/escalation-policies';

export type { EscalationPolicyRow };

export function useEscalationPolicies() {
  return useQuery<EscalationPolicyRow[]>({
    queryKey: ['escalation-policies'],
    queryFn: async () => {
      const res = await apiFetch('/api/escalation-policies');
      if (!res.ok) throw new Error('Failed to fetch escalation policies');
      return res.json();
    },
  });
}

export function useCreateEscalationPolicy() {
  const queryClient = useQueryClient();
  return useMutation<
    EscalationPolicyRow,
    Error,
    { name: string; steps: EscalationStepInput[] }
  >({
    mutationFn: async (data) => {
      const res = await apiFetch('/api/escalation-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Failed to create policy');
      return json as EscalationPolicyRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
    },
  });
}

export function useUpdateEscalationPolicy(id: string) {
  const queryClient = useQueryClient();
  return useMutation<
    EscalationPolicyRow,
    Error,
    { name?: string; steps?: EscalationStepInput[] }
  >({
    mutationFn: async (data) => {
      const res = await apiFetch(`/api/escalation-policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Failed to update policy');
      return json as EscalationPolicyRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
    },
  });
}

export function useDeleteEscalationPolicy(id: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: async () => {
      const res = await apiFetch(`/api/escalation-policies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete policy');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-policies'] });
    },
  });
}

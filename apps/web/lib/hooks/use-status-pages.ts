'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StatusPageRow {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useStatusPages() {
  return useQuery<StatusPageRow[]>({
    queryKey: ['status-pages'],
    queryFn: async () => {
      const res = await fetch('/api/status-pages');
      if (!res.ok) throw new Error('Failed to fetch status pages');
      return res.json();
    },
  });
}

export interface StatusPageDetail extends StatusPageRow {
  customDomainVerified: boolean;
  monitors: { monitorId: string; displayOrder: number }[];
}

export function useStatusPage(id: string) {
  return useQuery<StatusPageDetail>({
    queryKey: ['status-pages', id],
    queryFn: async () => {
      const res = await fetch(`/api/status-pages/${id}`);
      if (!res.ok) throw new Error('Failed to fetch status page');
      return res.json();
    },
    enabled: Boolean(id),
  });
}

export function useCreateStatusPage() {
  const queryClient = useQueryClient();
  return useMutation<StatusPageRow, Error, { name: string; slug: string }>({
    mutationFn: async (data) => {
      const res = await fetch('/api/status-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to create status page');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-pages'] });
    },
  });
}

interface UpdateStatusPageInput {
  name?: string;
  customDomain?: string | null;
  isPublic?: boolean;
  monitorIds?: string[];
}

export function useUpdateStatusPage(id: string) {
  const queryClient = useQueryClient();
  return useMutation<StatusPageDetail, Error, UpdateStatusPageInput>({
    mutationFn: async (data) => {
      const res = await fetch(`/api/status-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update status page');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-pages'] });
      queryClient.invalidateQueries({ queryKey: ['status-pages', id] });
    },
  });
}

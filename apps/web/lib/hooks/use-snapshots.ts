'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { SnapshotSummary } from '@/lib/repositories/content-snapshots';

export interface SnapshotListResponse {
  snapshots: SnapshotSummary[];
  planLimit: number;
}

export function useSnapshots(monitorId: string) {
  return useQuery<SnapshotListResponse>({
    queryKey: ['snapshots', monitorId],
    queryFn: async () => {
      const res = await fetch(`/api/monitors/${monitorId}/snapshots`);
      if (!res.ok) throw new Error('Failed to fetch snapshots');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

export interface DiffLine {
  op: 'equal' | 'add' | 'remove';
  text: string;
}

export interface SnapshotDiff {
  from: { id: string; capturedAt: string };
  to: { id: string; capturedAt: string };
  added: number;
  removed: number;
  truncated: boolean;
  lines: DiffLine[];
}

export function useSnapshotDiff(monitorId: string, fromId: string | null, toId: string | null) {
  return useQuery<SnapshotDiff>({
    queryKey: ['snapshot-diff', monitorId, fromId, toId],
    queryFn: async () => {
      const res = await fetch(
        `/api/monitors/${monitorId}/snapshots/diff?from=${fromId}&to=${toId}`
      );
      if (!res.ok) throw new Error('Failed to fetch snapshot diff');
      return res.json();
    },
    enabled: Boolean(monitorId && fromId && toId),
  });
}

export function useNotifySnapshot(monitorId: string) {
  return useMutation({
    mutationFn: async (snapshotId: string) => {
      const res = await fetch(
        `/api/monitors/${monitorId}/snapshots/${snapshotId}/notify`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to send notification');
      return res.json();
    },
  });
}

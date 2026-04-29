'use client';

import { useQuery } from '@tanstack/react-query';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export interface CheckResultRow {
  id: string;
  checkedAt: string;
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
  region: string | null;
}

function rangeToMs(range: TimeRange): number {
  switch (range) {
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d':  return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
  }
}

export function useCheckResults(monitorId: string, range: TimeRange = '24h', limit = 500) {
  return useQuery<CheckResultRow[]>({
    queryKey: ['check-results', monitorId, range, limit],
    queryFn: async () => {
      const to = new Date();
      const from = new Date(to.getTime() - rangeToMs(range));
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        limit: String(limit),
      });
      const res = await fetch(`/api/monitors/${monitorId}/results?${params}`);
      if (!res.ok) throw new Error('Failed to fetch check results');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

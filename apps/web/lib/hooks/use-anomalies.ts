'use client';

import { useQuery } from '@tanstack/react-query';
import type { PerformanceAlertRow } from '@/lib/repositories/performance-alerts';

export type { PerformanceAlertRow };

export function useAnomalies(monitorId: string) {
  return useQuery<PerformanceAlertRow[]>({
    queryKey: ['anomalies', monitorId],
    queryFn: async () => {
      const to = new Date();
      const from = new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        limit: '500',
      });
      const res = await fetch(`/api/monitors/${monitorId}/anomalies?${params}`);
      if (!res.ok) throw new Error('Failed to fetch anomalies');
      return res.json();
    },
    enabled: Boolean(monitorId),
  });
}

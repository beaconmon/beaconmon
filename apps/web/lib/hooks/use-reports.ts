'use client';

import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

interface GenerateReportInput {
  periodStart: string;
  periodEnd: string;
  clientName: string;
  clientNotes?: string;
}

interface GenerateReportResult {
  jobId: string;
}

export function useGenerateReport() {
  return useMutation<GenerateReportResult, Error, GenerateReportInput>({
    mutationFn: async (data) => {
      const res = await apiFetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? 'Failed to generate report');
      return json as GenerateReportResult;
    },
  });
}

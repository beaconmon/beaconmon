'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitorForm, type MonitorFormValues } from '@/components/monitors/monitor-form';
import { useCreateMonitor } from '@/lib/hooks/use-monitors';
import { useSession } from '@/lib/hooks/use-session';
import { analytics } from '@/lib/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateMonitorInput } from '@/lib/validations/monitors';

function buildApiPayload(data: MonitorFormValues): CreateMonitorInput {
  const base = {
    name: data.name,
    type: data.type,
    intervalSeconds: data.intervalSeconds,
    timeoutMs: data.timeoutMs,
    responseTimeThresholdMs: data.responseTimeThresholdMs,
    keyword: data.keyword,
    keywordCondition: data.keywordCondition,
    tags: data.tags,
  };

  if (data.type === 'tcp') {
    return { ...base, url: `${data.host}:${data.port}`, config: { host: data.host, port: data.port } };
  }
  if (data.type === 'ssl' || data.type === 'domain') {
    return { ...base, url: data.domain ?? '' };
  }
  if (data.type === 'content') {
    return { ...base, url: data.url ?? '', config: data.cssSelector ? { selector: data.cssSelector } : {} };
  }
  if (data.type === 'heartbeat') {
    return { ...base, url: '', config: { gracePeriodSeconds: data.gracePeriodSeconds ?? 60 } };
  }
  return { ...base, url: data.url ?? '' };
}

export default function NewMonitorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const sessionQ = useSession();
  const createMonitor = useCreateMonitor();

  if (sessionQ.isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const plan = sessionQ.data?.plan ?? 'free';

  async function handleSubmit(data: MonitorFormValues) {
    setError(null);
    const payload = buildApiPayload(data);
    createMonitor.mutate(payload, {
      onSuccess: (monitor) => {
        try {
          analytics.monitorCreated({ type: payload.type, intervalSeconds: payload.intervalSeconds });
        } catch {
          // analytics failure must not block navigation
        }
        router.push(`/monitors/${monitor.id}`);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6 text-brand-text">Add monitor</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitor details</CardTitle>
        </CardHeader>
        <CardContent>
          <MonitorForm
            plan={plan}
            onSubmit={handleSubmit}
            isSubmitting={createMonitor.isPending}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

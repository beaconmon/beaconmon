'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MonitorForm, type MonitorFormValues } from '@/components/monitors/monitor-form';
import { useMonitor, useUpdateMonitor } from '@/lib/hooks/use-monitors';
import { useBreadcrumbOverride } from '@/lib/breadcrumb-context';
import { useSession } from '@/lib/hooks/use-session';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { UpdateMonitorInput } from '@/lib/validations/monitors';

function toFormValues(monitor: MonitorRow): Partial<MonitorFormValues> {
  const base: Partial<MonitorFormValues> = {
    name: monitor.name,
    type: monitor.type as MonitorFormValues['type'],
    intervalSeconds: monitor.intervalSeconds,
    timeoutMs: monitor.timeoutMs,
    responseTimeThresholdMs: monitor.responseTimeThresholdMs ?? undefined,
    keyword: monitor.keyword ?? undefined,
    keywordCondition: (monitor.keywordCondition ?? undefined) as MonitorFormValues['keywordCondition'],
    tags: monitor.tags,
  };

  if (monitor.type === 'tcp') {
    const cfg = monitor.config as { host?: string; port?: number };
    base.host = cfg.host;
    base.port = cfg.port;
  } else if (monitor.type === 'ssl' || monitor.type === 'domain') {
    base.domain = monitor.url;
  } else if (monitor.type === 'content') {
    base.url = monitor.url;
    const cfg = monitor.config as { selector?: string };
    base.cssSelector = cfg.selector;
  } else {
    base.url = monitor.url;
  }

  return base;
}

function buildApiPayload(data: MonitorFormValues): UpdateMonitorInput {
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
  return { ...base, url: data.url ?? '' };
}

export default function EditMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const monitorQ = useMonitor(id);
  const sessionQ = useSession();
  const updateMonitor = useUpdateMonitor(id);
  useBreadcrumbOverride(id, monitorQ.data?.name);

  const isLoading = monitorQ.isLoading || sessionQ.isLoading;

  if (isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!monitorQ.data) {
    return <p className="text-sm text-brand-muted">Monitor not found.</p>;
  }

  const plan = sessionQ.data?.plan ?? 'free';
  const defaultValues = toFormValues(monitorQ.data);

  async function handleSubmit(data: MonitorFormValues) {
    setError(null);
    const payload = buildApiPayload(data);
    updateMonitor.mutate(payload, {
      onSuccess: () => {
        router.push(`/monitors/${id}`);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6 text-brand-text">Edit monitor</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitor details</CardTitle>
        </CardHeader>
        <CardContent>
          <MonitorForm
            defaultValues={defaultValues}
            plan={plan}
            onSubmit={handleSubmit}
            isSubmitting={updateMonitor.isPending}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

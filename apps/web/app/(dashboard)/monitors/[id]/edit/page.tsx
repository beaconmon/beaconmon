'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { GeneralTab } from '@/components/monitors/settings/general-tab';
import { ReliabilityTab } from '@/components/monitors/settings/reliability-tab';
import { AlertsTab } from '@/components/monitors/settings/alerts-tab';
import { AdvancedTab } from '@/components/monitors/settings/advanced-tab';
import { SettingsRail } from '@/components/monitors/settings/settings-rail';
import { useMonitor, useUpdateMonitor, useBulkMonitorAction } from '@/lib/hooks/use-monitors';
import { useBreadcrumbOverride } from '@/lib/breadcrumb-context';
import { useSession } from '@/lib/hooks/use-session';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { UpdateMonitorInput } from '@/lib/validations/monitors';
import type { MonitorFormValues } from '@/components/monitors/monitor-form';

const TABS = ['General', 'Reliability', 'Alerts', 'Advanced'] as const;
type Tab = typeof TABS[number];

function toFormValues(monitor: MonitorRow): Partial<MonitorFormValues> {
  const base: Partial<MonitorFormValues> = {
    name: monitor.name,
    type: monitor.type as MonitorFormValues['type'],
    intervalSeconds: monitor.intervalSeconds,
    timeoutMs: monitor.timeoutMs,
    responseTimeThresholdMs: monitor.responseTimeThresholdMs ?? undefined,
    keyword: monitor.keyword ?? undefined,
    keywordCondition: (monitor.keywordCondition ?? undefined) as MonitorFormValues['keywordCondition'],
    anomalyDetectionEnabled: monitor.anomalyDetectionEnabled,
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
    anomalyDetectionEnabled: data.anomalyDetectionEnabled,
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
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [error, setError] = useState<string | null>(null);
  const [anomalyEnabled, setAnomalyEnabled] = useState<boolean | undefined>(undefined);

  const monitorQ = useMonitor(id);
  const sessionQ = useSession();
  const updateMonitor = useUpdateMonitor(id);
  const bulkAction = useBulkMonitorAction();
  useBreadcrumbOverride(id, monitorQ.data?.name);

  const isLoading = monitorQ.isLoading || sessionQ.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!monitorQ.data) {
    return <p className="text-sm text-brand-muted">Monitor not found.</p>;
  }

  const monitor = monitorQ.data;
  const plan = sessionQ.data?.plan ?? 'free';
  const defaultValues = toFormValues(monitor);

  const effectiveAnomaly = anomalyEnabled ?? monitor.anomalyDetectionEnabled;

  async function handleSubmit(data: MonitorFormValues) {
    setError(null);
    const payload = buildApiPayload({ ...data, anomalyDetectionEnabled: effectiveAnomaly });
    updateMonitor.mutate(payload, {
      onSuccess: () => {
        router.push(`/monitors/${id}`);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  function handlePause() {
    bulkAction.mutate(
      { action: monitor.isActive ? 'pause' : 'resume', monitorIds: [id] },
      {
        onSuccess: () => monitorQ.refetch(),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 font-mono text-xs text-brand-muted">
        <Link href="/monitors" className="hover:text-brand-text">Monitors</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/monitors/${id}`} className="hover:text-brand-text">{monitor.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-dim">Settings</span>
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-brand-text">{monitor.name}</h1>
        <StatusBadge status={monitor.currentStatus} />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handlePause}
            disabled={bulkAction.isPending}
            className="rounded-full border border-brand-line px-4 py-1.5 text-xs font-medium text-brand-dim transition-colors hover:bg-brand-bg3 hover:text-brand-text disabled:opacity-50"
          >
            {monitor.isActive ? 'Pause monitor' : 'Resume monitor'}
          </button>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {/* Tab bar */}
          <div
            className="mb-5 flex overflow-hidden rounded-lg p-0.5"
            style={{ background: 'var(--brand-bg3)', boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-brand-bg text-brand-text shadow-sm'
                    : 'text-brand-muted hover:text-brand-dim'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === 'General' && (
            <GeneralTab
              defaultValues={defaultValues}
              plan={plan}
              onSubmit={handleSubmit}
              isSubmitting={updateMonitor.isPending}
              error={error}
            />
          )}
          {activeTab === 'Reliability' && (
            <ReliabilityTab monitorId={id} plan={plan} />
          )}
          {activeTab === 'Alerts' && (
            <AlertsTab
              anomalyDetectionEnabled={effectiveAnomaly}
              onAnomalyToggle={(v) => setAnomalyEnabled(v)}
            />
          )}
          {activeTab === 'Advanced' && (
            <AdvancedTab monitorId={id} monitorName={monitor.name} />
          )}
        </div>

        {/* Settings rail */}
        <div className="hidden lg:block">
          <SettingsRail monitor={monitor} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { format } from 'date-fns';
import {
  ExternalLink,
  Pencil,
  Trash2,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { useMonitor, useDeleteMonitor, useUpdateMonitor } from '@/lib/hooks/use-monitors';
import { Switch } from '@/components/ui/switch';
import { useBreadcrumbOverride } from '@/lib/breadcrumb-context';
import { useCheckResults, defaultLimitForRange, type TimeRange, type CheckResultRow } from '@/lib/hooks/use-check-results';
import { useMonitorIncidents } from '@/lib/hooks/use-incidents';
import { useSession } from '@/lib/hooks/use-session';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import { useAnomalies, type PerformanceAlertRow } from '@/lib/hooks/use-anomalies';
import { PerformanceTab } from '@/components/monitors/tabs/PerformanceTab';
import { IncidentsTab, type IncidentApiRow } from '@/components/monitors/tabs/IncidentsTab';
import { SloTab } from '@/components/monitors/tabs/SloTab';
import { DeploysTab } from '@/components/monitors/tabs/DeploysTab';
import { SnapshotsTab } from '@/components/monitors/tabs/SnapshotsTab';
import { AnomaliesTab } from '@/components/monitors/tabs/AnomaliesTab';
import { RegionsTab } from '@/components/monitors/tabs/RegionsTab';

const RANGES: TimeRange[] = ['24h', '7d', '30d', '90d'];
const RANGE_MS: Record<TimeRange, number> = { '24h': 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 };

function computeUptime(results: CheckResultRow[]) {
  if (results.length === 0) return null;
  const up = results.filter((r) => r.success).length;
  return Math.round((up / results.length) * 10000) / 100;
}

function UptimeRangeCard({ monitorId, range }: { monitorId: string; range: TimeRange }) {
  const { data, isLoading } = useCheckResults(monitorId, range, defaultLimitForRange(range));
  const pct = data != null ? computeUptime(data) : null;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-brand-line bg-brand-surface p-4">
        <div className="h-3 w-12 animate-pulse rounded bg-brand-bg3" />
        <div className="mt-2 h-6 w-16 animate-pulse rounded bg-brand-bg3" />
      </div>
    );
  }

  const color =
    pct == null ? 'text-brand-muted' : pct >= 99 ? 'text-brand-green-ink' : pct >= 90 ? 'text-brand-amber' : 'text-brand-red';

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">{range}</p>
      <p className={cn('mt-2 text-2xl font-bold', color)}>
        {pct != null ? `${pct}%` : '—'}
      </p>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'performance';
  const [range, setRange] = useState<TimeRange>('24h');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recentLimit, setRecentLimit] = useState(25);

  const sessionQ = useSession();
  const monitorQ = useMonitor(id);
  const resultsQ = useCheckResults(id, range, defaultLimitForRange(range));
  const incidentsQ = useMonitorIncidents(id);
  const channelsQ = useAlertChannels();
  const deleteMonitor = useDeleteMonitor(id);
  const updateMonitor = useUpdateMonitor(id);

  const monitor = monitorQ.data;
  useBreadcrumbOverride(id, monitor?.name);
  const results = resultsQ.data ?? [];
  const incidents = (incidentsQ.data ?? []) as unknown as IncidentApiRow[];
  const channels = channelsQ.data ?? [];
  const sessionUserId = sessionQ.data?.userId;
  const plan = sessionQ.data?.plan ?? 'free';

  const anomaliesQ = useAnomalies(id);
  const anomalies: PerformanceAlertRow[] = monitor?.anomalyDetectionEnabled ? (anomaliesQ.data ?? []) : [];

  const multiLocationEnabled = process.env['NEXT_PUBLIC_FEATURE_MULTI_LOCATION'] === 'true';
  const hasRegionData = results.some((r) => r.region != null);
  const isContentMonitor = monitor?.type === 'content';
  const isCompetitorMonitor = false;
  const isAnomalyMonitor = (monitor?.type === 'http' || monitor?.type === 'keyword') && monitor?.anomalyDetectionEnabled;

  const bucketFmt =
    range === '24h' ? 'HH:mm' :
    range === '7d'  ? 'MMM d HH:00' :
                      'MMM d';

  // eslint-disable-next-line react-hooks/purity
  const cutoff = useMemo(() => new Date(Date.now() - RANGE_MS[range]), [range]);
  const chartAnomalies = anomalies.filter((a) => new Date(a.checkedAt) >= cutoff);

  function handleDelete() {
    deleteMonitor.mutate(undefined, {
      onSuccess: () => router.push('/monitors'),
    });
  }

  return (
    <div className="space-y-5">
      <Link
        href="/monitors"
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-dim"
      >
        <ArrowLeft className="h-3 w-3" />
        Monitors
      </Link>

      <QueryState
        isLoading={monitorQ.isLoading}
        isError={monitorQ.isError}
        error={monitorQ.error}
        onRetry={() => monitorQ.refetch()}
        skeletonRows={1}
      >
        {monitor && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-brand-text">{monitor.name}</h1>
                <StatusBadge status={monitor.currentStatus} />
              </div>
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-sm text-brand-muted transition-colors hover:text-brand-dim"
              >
                {monitor.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/monitors/${id}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </QueryState>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RANGES.map((r) => (
          <UptimeRangeCard key={r} monitorId={id} range={r} />
        ))}
      </div>

      <div className="flex gap-5 items-start flex-col lg:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <Tabs defaultValue={initialTab}>
            <TabsList className="mb-4 bg-brand-bg3 border border-brand-line flex-wrap h-auto gap-0.5 p-1">
              {[
                { value: 'performance', label: 'Performance' },
                ...(!isCompetitorMonitor ? [{ value: 'incidents', label: 'Incidents' }] : []),
                ...(!isCompetitorMonitor ? [{ value: 'slo', label: 'Reliability Targets' }] : []),
                ...(!isCompetitorMonitor ? [{ value: 'deploys', label: 'Deploys' }] : []),
                ...(isContentMonitor ? [{ value: 'snapshots', label: 'Snapshots' }] : []),
                ...(isAnomalyMonitor ? [{ value: 'anomalies', label: 'Smart Alerts' }] : []),
                ...(multiLocationEnabled && hasRegionData ? [{ value: 'regions', label: 'Regions' }] : []),
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text text-brand-muted"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="performance" className="mt-0">
              <PerformanceTab
                results={results}
                isLoading={resultsQ.isLoading}
                isError={resultsQ.isError}
                onRetry={() => resultsQ.refetch()}
                range={range}
                onRangeChange={(r) => { setRange(r); setRecentLimit(25); }}
                recentLimit={recentLimit}
                onLoadMore={() => setRecentLimit((n) => Math.min(n + 25, results.length))}
                isAnomalyMonitor={!!isAnomalyMonitor}
                hasRegionData={hasRegionData}
                chartAnomalies={chartAnomalies}
                bucketFmt={bucketFmt}
              />
            </TabsContent>

            <TabsContent value="incidents" className="mt-0">
              <IncidentsTab
                incidents={incidents}
                isLoading={incidentsQ.isLoading}
                isError={incidentsQ.isError}
                onRetry={() => incidentsQ.refetch()}
                sessionUserId={sessionUserId}
              />
            </TabsContent>

            <TabsContent value="slo" className="mt-0">
              <SloTab monitorId={id} plan={plan} />
            </TabsContent>

            <TabsContent value="deploys" className="mt-0">
              <DeploysTab monitorId={id} plan={plan} />
            </TabsContent>

            {isContentMonitor && (
              <TabsContent value="snapshots" className="mt-0">
                <SnapshotsTab monitorId={id} />
              </TabsContent>
            )}

            {isAnomalyMonitor && (
              <TabsContent value="anomalies" className="mt-0">
                <AnomaliesTab monitorId={id} />
              </TabsContent>
            )}

            {multiLocationEnabled && hasRegionData && (
              <TabsContent value="regions" className="mt-0">
                <RegionsTab results={results} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
          {monitor && (
            <SidebarCard title="Details">
              <dl className="space-y-2.5">
                {[
                  { label: 'Type', value: monitor.type.toUpperCase() },
                  { label: 'Interval', value: `${monitor.intervalSeconds}s` },
                  { label: 'Timeout', value: `${monitor.timeoutMs}ms` },
                  { label: 'Created', value: format(new Date(monitor.createdAt), 'MMM d, yyyy') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <dt className="text-xs text-brand-muted">{label}</dt>
                    <dd className="font-mono text-xs text-brand-dim">{value}</dd>
                  </div>
                ))}
              </dl>
            </SidebarCard>
          )}

          {isContentMonitor && monitor && (() => {
            const smartSetup = (monitor.config as Record<string, unknown> | null)?.smartSetup as {
              selectorChosen?: string;
              selectorCandidates?: string[];
              generatedAt?: string;
              aiCategory?: string;
            } | undefined;
            if (!smartSetup) return null;
            return (
              <SidebarCard title="AI Setup">
                <dl className="space-y-2.5">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-xs text-brand-muted">AI Selector</dt>
                    <dd className="font-mono text-xs text-brand-dim break-all">
                      {smartSetup.selectorChosen ? (
                        <code>{smartSetup.selectorChosen}</code>
                      ) : (
                        'Full page'
                      )}
                    </dd>
                  </div>
                  {smartSetup.selectorCandidates && smartSetup.selectorCandidates.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs text-brand-muted">Candidates</dt>
                      <dd className="font-mono text-xs text-brand-dim break-all">
                        {smartSetup.selectorCandidates.slice(0, 3).map((s, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            <code>{s}</code>
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {smartSetup.generatedAt && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-xs text-brand-muted">Generated</dt>
                      <dd className="font-mono text-xs text-brand-dim">
                        {format(new Date(smartSetup.generatedAt), 'MMM d, yyyy')}
                      </dd>
                    </div>
                  )}
                </dl>
              </SidebarCard>
            );
          })()}

          {monitor && (monitor.type === 'http' || monitor.type === 'keyword') && (
            <SidebarCard title="Smart Alerts">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-brand-dim">Detect response time spikes</p>
                  <p className="mt-0.5 text-[11px] text-brand-muted leading-snug">
                    {plan === 'free'
                      ? 'Upgrade to Growth to enable Smart Alerts.'
                      : 'Alert when response time is a statistical outlier (z > 3).'}
                  </p>
                </div>
                <Switch
                  checked={monitor.anomalyDetectionEnabled}
                  disabled={updateMonitor.isPending || plan === 'free'}
                  onCheckedChange={(checked) => updateMonitor.mutate({ anomalyDetectionEnabled: checked })}
                />
              </div>
            </SidebarCard>
          )}

          <SidebarCard title="Alert channels">
            {channels.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-brand-muted">No channels configured.</p>
                <Link
                  href="/alert-channels"
                  className="text-xs text-brand-dim transition-colors hover:text-brand-text"
                >
                  Manage channels →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
                    <span className="truncate text-xs text-brand-dim">{ch.name}</span>
                    <span className="ml-auto rounded border border-brand-line bg-brand-bg3 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-brand-muted">
                      {ch.type}
                    </span>
                  </div>
                ))}
                <Link
                  href="/alert-channels"
                  className="block text-xs text-brand-dim transition-colors hover:text-brand-text"
                >
                  Manage channels →
                </Link>
              </div>
            )}
          </SidebarCard>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete monitor</DialogTitle>
            <DialogDescription>
              This will permanently delete this monitor and all its check results. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMonitor.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { format, formatDistanceToNow, formatDistance, differenceInMinutes } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ExternalLink, Pencil, Trash2, Bell, Clock, ArrowLeft, AlertCircle, Globe } from 'lucide-react';
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
import { useMonitor, useDeleteMonitor } from '@/lib/hooks/use-monitors';
import { useCheckResults, type TimeRange, type CheckResultRow } from '@/lib/hooks/use-check-results';
import { useMonitorIncidents, useResolveIncident } from '@/lib/hooks/use-incidents';
import { useSession } from '@/lib/hooks/use-session';
import { AckButton } from '@/components/dashboard/ack-button';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';

const RANGES: TimeRange[] = ['24h', '7d', '30d', '90d'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeStats(results: CheckResultRow[]) {
  const times = results.map((r) => r.responseTimeMs).filter((v): v is number => v != null);
  if (times.length === 0) return { min: null, avg: null, max: null, p95: null };
  const sorted = [...times].sort((a, b) => a - b);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
  return { min: sorted[0], avg, max: sorted[sorted.length - 1], p95 };
}

function computeUptime(results: CheckResultRow[]) {
  if (results.length === 0) return null;
  const up = results.filter((r) => r.success).length;
  return Math.round((up / results.length) * 10000) / 100;
}

function durationStr(startedAt: string | Date, resolvedAt: string | Date | null) {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const mins = differenceInMinutes(end, new Date(startedAt));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

// ─── Uptime card ─────────────────────────────────────────────────────────────

function UptimeRangeCard({ monitorId, range }: { monitorId: string; range: TimeRange }) {
  const { data, isLoading } = useCheckResults(monitorId, range, 500);
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
    pct == null ? 'text-brand-muted' : pct >= 99 ? 'text-brand-green' : pct >= 90 ? 'text-brand-amber' : 'text-brand-red';

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">{range}</p>
      <p className={cn('mt-2 text-2xl font-bold', color)}>
        {pct != null ? `${pct}%` : '—'}
      </p>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-brand-text">{value}</span>
    </div>
  );
}

// ─── Status code coloring ─────────────────────────────────────────────────────

function statusCodeColor(code: number | null) {
  if (code == null) return 'text-brand-muted';
  if (code < 300) return 'text-brand-green';
  if (code < 400) return 'text-brand-amber';
  return 'text-brand-red';
}

// ─── Sidebar card ─────────────────────────────────────────────────────────────

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

// ─── Custom tooltip for chart ─────────────────────────────────────────────────

import type { TooltipProps } from 'recharts';

interface ChartPayload {
  value?: unknown;
}

function ChartTooltip(props: TooltipProps) {
  const { active, payload, label } = props as { active?: boolean; payload?: ChartPayload[]; label?: string };
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-brand-line bg-brand-bg3 px-3 py-2 text-xs shadow-lg">
      <p className="text-brand-muted">{label}</p>
      <p className="font-mono font-semibold text-brand-green">{String(payload[0]?.value ?? 0)}ms</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface IncidentApiRow {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  resolutionType: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

export default function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>('24h');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const sessionQ = useSession();
  const monitorQ = useMonitor(id);
  const resultsQ = useCheckResults(id, range, 500);
  const incidentsQ = useMonitorIncidents(id);
  const channelsQ = useAlertChannels();
  const deleteMonitor = useDeleteMonitor(id);

  const monitor = monitorQ.data;
  const results = resultsQ.data ?? [];
  const incidents = (incidentsQ.data ?? []) as unknown as IncidentApiRow[];
  const channels = channelsQ.data ?? [];
  const sessionUserId = sessionQ.data?.userId;

  const multiLocationEnabled = process.env['NEXT_PUBLIC_FEATURE_MULTI_LOCATION'] === 'true';
  const hasRegionData = results.some((r) => r.region != null);

  const chartData = [...results]
    .reverse()
    .map((r) => ({
      time: format(new Date(r.checkedAt), 'HH:mm'),
      ms: r.responseTimeMs ?? 0,
    }));

  const stats = computeStats(results);

  function handleDelete() {
    deleteMonitor.mutate(undefined, {
      onSuccess: () => router.push('/monitors'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Back link */}
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

      {/* Uptime cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RANGES.map((r) => (
          <UptimeRangeCard key={r} monitorId={id} range={r} />
        ))}
      </div>

      {/* 2-column layout */}
      <div className="flex gap-5 items-start flex-col lg:flex-row">
        {/* Left: chart + checks */}
        <div className="min-w-0 flex-1 space-y-5">
          <Tabs defaultValue="performance">
            {(multiLocationEnabled && hasRegionData) && (
              <TabsList className="mb-4 bg-brand-bg3 border border-brand-line">
                <TabsTrigger
                  value="performance"
                  className="text-xs data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text text-brand-muted"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="regions"
                  className="text-xs data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text text-brand-muted"
                >
                  Regions
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="performance" className="mt-0 space-y-5">
          {/* Response time chart */}
          <div className="rounded-lg border border-brand-line bg-brand-surface">
            <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Response time
              </h2>
              <div className="flex gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      'rounded px-2 py-1 text-xs font-medium transition-colors',
                      range === r
                        ? 'bg-brand-bg3 text-brand-text'
                        : 'text-brand-muted hover:text-brand-dim'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 pt-4">
              <QueryState
                isLoading={resultsQ.isLoading}
                isError={resultsQ.isError}
                error={resultsQ.error}
                onRetry={() => resultsQ.refetch()}
              >
                {chartData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-brand-muted">No data for this period</p>
                ) : (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E57A" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#00E57A" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#222230"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: '#63636F' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#63636F' }}
                            tickLine={false}
                            axisLine={false}
                            unit="ms"
                            width={48}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="ms"
                            stroke="#00E57A"
                            strokeWidth={1.5}
                            fill="url(#rtGrad)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats row */}
                    <div className="mt-4 flex gap-6 border-t border-brand-line pt-4">
                      <StatPill label="Min" value={stats.min != null ? `${stats.min}ms` : '—'} />
                      <StatPill label="Avg" value={stats.avg != null ? `${stats.avg}ms` : '—'} />
                      <StatPill label="Max" value={stats.max != null ? `${stats.max}ms` : '—'} />
                      <StatPill label="p95" value={stats.p95 != null ? `${stats.p95}ms` : '—'} />
                    </div>
                  </>
                )}
              </QueryState>
            </div>
          </div>

          {/* Recent checks */}
          <div className="rounded-lg border border-brand-line bg-brand-surface">
            <div className="border-b border-brand-line px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Recent checks
              </h2>
            </div>
            <QueryState
              isLoading={resultsQ.isLoading}
              isError={resultsQ.isError}
              error={resultsQ.error}
              onRetry={() => resultsQ.refetch()}
              skeletonRows={5}
            >
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-brand-muted">No check results yet.</p>
              ) : (
                <div>
                  {/* Header */}
                  <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
                    {['Time', 'Code', 'Response', 'Result'].map((h) => (
                      <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                        {h}
                      </span>
                    ))}
                  </div>
                  {results.slice(0, 50).map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-4 border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30"
                    >
                      <span className="font-mono text-xs text-brand-dim">
                        {format(new Date(r.checkedAt), 'MMM d, HH:mm:ss')}
                      </span>
                      <span className={cn('font-mono text-sm font-semibold', statusCodeColor(r.statusCode))}>
                        {r.statusCode ?? '—'}
                      </span>
                      <span className="font-mono text-sm text-brand-dim">
                        {r.responseTimeMs != null ? `${r.responseTimeMs}ms` : '—'}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wider',
                          r.success ? 'text-brand-green' : 'text-brand-red'
                        )}
                      >
                        {r.success ? 'OK' : 'Fail'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </QueryState>
          </div>
            </TabsContent>

            {multiLocationEnabled && hasRegionData && (
              <TabsContent value="regions" className="mt-0">
                <RegionsTab results={results} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
          {/* Monitor details */}
          {monitor && (
            <SidebarCard title="Details">
              <dl className="space-y-2.5">
                {[
                  { label: 'Type', value: monitor.type.toUpperCase() },
                  { label: 'Interval', value: `${monitor.intervalSeconds}s` },
                  { label: 'Timeout', value: `${monitor.timeoutMs}ms` },
                  {
                    label: 'Created',
                    value: format(new Date(monitor.createdAt), 'MMM d, yyyy'),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <dt className="text-xs text-brand-muted">{label}</dt>
                    <dd className="font-mono text-xs text-brand-dim">{value}</dd>
                  </div>
                ))}
              </dl>
            </SidebarCard>
          )}

          {/* Incidents */}
          <SidebarCard title="Recent incidents">
            <QueryState
              isLoading={incidentsQ.isLoading}
              isError={incidentsQ.isError}
              error={incidentsQ.error}
              onRetry={() => incidentsQ.refetch()}
              skeletonRows={3}
            >
              {incidents.length === 0 ? (
                <p className="text-xs text-brand-muted">No incidents recorded.</p>
              ) : (
                <div className="space-y-2">
                  {incidents.slice(0, 5).map((inc) => (
                    <IncidentSidebarRow key={inc.id} incident={inc} sessionUserId={sessionUserId} />
                  ))}
                  {incidents.length > 5 && (
                    <Link
                      href="/incidents"
                      className="block text-center text-xs text-brand-dim transition-colors hover:text-brand-text"
                    >
                      View all incidents →
                    </Link>
                  )}
                </div>
              )}
            </QueryState>
          </SidebarCard>

          {/* Alert channels */}
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

      {/* Delete dialog */}
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

// ─── Incident sidebar row ─────────────────────────────────────────────────────

function IncidentSidebarRow({
  incident,
  sessionUserId,
}: {
  incident: IncidentApiRow;
  sessionUserId?: string;
}) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;

  return (
    <div className="flex items-start gap-2">
      <AlertCircle
        className={cn('mt-0.5 h-3 w-3 shrink-0', isOpen ? 'text-brand-red' : 'text-brand-muted')}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-brand-dim">
          {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
          <span className="ml-1 text-brand-muted">
            · {durationStr(incident.startedAt, incident.resolvedAt)}
          </span>
        </p>
        {isOpen && (
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <AckButton
              incidentId={incident.id}
              resolvedAt={incident.resolvedAt}
              acknowledgedAt={incident.acknowledgedAt}
              acknowledgedBy={incident.acknowledgedBy}
              sessionUserId={sessionUserId}
            />
            <button
              onClick={() => resolve.mutate()}
              disabled={resolve.isPending}
              className="text-[10px] text-brand-dim underline transition-colors hover:text-brand-text disabled:opacity-50"
            >
              Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Regions tab ──────────────────────────────────────────────────────────────

function RegionsTab({ results }: { results: CheckResultRow[] }) {
  const regionMap = new Map<string, CheckResultRow[]>();
  for (const r of results) {
    const key = r.region ?? 'unknown';
    const existing = regionMap.get(key) ?? [];
    existing.push(r);
    regionMap.set(key, existing);
  }

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Region status
        </h2>
      </div>
      {regionMap.size === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-brand-muted">No region data available.</p>
      ) : (
        <div>
          <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
            {['Region', 'Status', 'Last response', 'Uptime'].map((h) => (
              <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                {h}
              </span>
            ))}
          </div>
          {Array.from(regionMap.entries()).map(([region, regionResults]) => {
            const latest = regionResults[0];
            const uptime = computeUptime(regionResults);
            const uptimeColor =
              uptime == null
                ? 'text-brand-muted'
                : uptime >= 99
                ? 'text-brand-green'
                : uptime >= 90
                ? 'text-brand-amber'
                : 'text-brand-red';

            return (
              <div
                key={region}
                className="grid grid-cols-4 border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30"
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-brand-dim">
                  <Globe className="h-3 w-3 text-brand-muted" />
                  {region}
                </span>
                <span>
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      latest?.success ? 'bg-brand-green' : 'bg-brand-red'
                    )}
                  />
                </span>
                <span className="font-mono text-sm text-brand-dim">
                  {latest?.responseTimeMs != null ? `${latest.responseTimeMs}ms` : '—'}
                </span>
                <span className={cn('font-mono text-sm font-semibold', uptimeColor)}>
                  {uptime != null ? `${uptime}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

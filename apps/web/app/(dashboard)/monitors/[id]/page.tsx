'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ExternalLink,
  Pencil,
  Trash2,
  Bell,
  ArrowLeft,
  Globe,
  Rocket,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QueryState } from '@/components/dashboard/query-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { useMonitor, useDeleteMonitor } from '@/lib/hooks/use-monitors';
import { useBreadcrumbOverride } from '@/lib/breadcrumb-context';
import { useCheckResults, type TimeRange, type CheckResultRow } from '@/lib/hooks/use-check-results';
import { useMonitorIncidents, useResolveIncident } from '@/lib/hooks/use-incidents';
import { useSession } from '@/lib/hooks/use-session';
import { AckButton } from '@/components/dashboard/ack-button';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import { useSlo, useUpdateSlo } from '@/lib/hooks/use-slo';
import { useDeploys, useStartDeploy, useEndDeploy } from '@/lib/hooks/use-deploys';
import { useSnapshots, useSnapshotDiff } from '@/lib/hooks/use-snapshots';
import type { SloData } from '@/lib/repositories/slo';

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

// ─── Incidents tab ────────────────────────────────────────────────────────────

interface IncidentApiRow {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  resolutionType: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

function IncidentTabRow({
  incident,
  sessionUserId,
}: {
  incident: IncidentApiRow;
  sessionUserId?: string;
}) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;

  return (
    <div className="grid grid-cols-4 items-center border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30">
      <span className="font-mono text-xs text-brand-dim">
        {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
      </span>
      <span className="font-mono text-xs text-brand-dim">
        {durationStr(incident.startedAt, incident.resolvedAt)}
      </span>
      <span>
        {isOpen ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-red">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            Open
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Resolved
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        {isOpen && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

function IncidentsTab({
  incidents,
  isLoading,
  isError,
  onRetry,
  sessionUserId,
}: {
  incidents: IncidentApiRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  sessionUserId?: string;
}) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Incidents</h2>
      </div>
      <QueryState isLoading={isLoading} isError={isError} error={null} onRetry={onRetry} skeletonRows={5}>
        {incidents.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">No incidents recorded.</p>
        ) : (
          <div>
            <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
              {['Started', 'Duration', 'Status', 'Actions'].map((h) => (
                <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  {h}
                </span>
              ))}
            </div>
            {incidents.map((inc) => (
              <IncidentTabRow key={inc.id} incident={inc} sessionUserId={sessionUserId} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

// ─── SLO tab ──────────────────────────────────────────────────────────────────

function SloGauge({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'text-brand-green' : pct >= 40 ? 'text-brand-amber' : 'text-brand-red';
  const strokeColor = pct >= 80 ? '#00E57A' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#222230" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
      </svg>
      <span className={cn('font-mono text-lg font-bold -mt-14 mb-8', color)}>{pct.toFixed(1)}%</span>
      <span className="text-[10px] uppercase tracking-wider text-brand-muted">Budget left</span>
    </div>
  );
}

function SloTab({ monitorId, plan }: { monitorId: string; plan: string }) {
  const { data, isLoading, isError, refetch } = useSlo(monitorId);
  const updateSlo = useUpdateSlo(monitorId);
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState('');
  const [windowDays, setWindowDays] = useState('30');
  const [formError, setFormError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (plan === 'free') {
    return (
      <div className="p-4">
        <UpgradePrompt currentPlan="free" limitReached="SLO tracking" />
      </div>
    );
  }

  function startEdit(sloData: SloData) {
    setTarget(sloData.config.sloTarget != null ? String(sloData.config.sloTarget * 100) : '');
    setWindowDays(String(sloData.config.sloWindowDays ?? 30));
    setFormError('');
    setEditing(true);
  }

  function handleSave() {
    const targetNum = parseFloat(target);
    if (isNaN(targetNum) || targetNum <= 0 || targetNum > 100) {
      setFormError('Target must be between 0 and 100');
      return;
    }
    updateSlo.mutate(
      { sloTarget: targetNum / 100, sloWindowDays: parseInt(windowDays, 10) || 30 },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => setFormError(err.message),
      }
    );
  }

  function handleClear() {
    updateSlo.mutate(
      { sloTarget: null, sloWindowDays: null },
      {
        onSuccess: () => {
          setEditing(false);
          setConfirmRemove(false);
        },
        onError: (err) => setFormError(err.message),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-brand-bg3" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-brand-line bg-brand-surface p-6 text-center">
        <p className="text-sm text-brand-red">Failed to load SLO data.</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {data && (
        <div className="space-y-5">
          {!data.config.sloTarget ? (
            <div className="rounded-lg border border-brand-line bg-brand-surface p-6 text-center">
              <p className="text-sm text-brand-muted">No SLO target configured for this monitor.</p>
              <Button size="sm" className="mt-3" onClick={() => { setTarget('99.9'); setWindowDays('30'); setFormError(''); setEditing(true); }}>
                Set SLO target
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Budget gauge */}
              <div className="rounded-lg border border-brand-line bg-brand-surface p-5 flex flex-col items-center gap-2">
                {data.metrics && (
                  <SloGauge pct={100 - data.metrics.errorBudgetConsumedPercent} />
                )}
                <p className="text-xs text-brand-muted text-center">Error budget remaining</p>
              </div>

              {/* Metrics */}
              <div className="sm:col-span-2 rounded-lg border border-brand-line bg-brand-surface p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {data.metrics && [
                    { label: 'Current uptime', value: `${data.metrics.uptimePercent.toFixed(3)}%` },
                    { label: 'SLO target', value: `${(data.config.sloTarget * 100).toFixed(2)}%` },
                    {
                      label: 'Budget total',
                      value: `${Math.round(data.metrics.errorBudgetTotalMinutes)}m`,
                    },
                    {
                      label: 'Budget remaining',
                      value: `${Math.round(data.metrics.errorBudgetRemainingMinutes)}m`,
                    },
                    { label: 'Burn rate', value: `${data.metrics.burnRate.toFixed(2)}x` },
                    { label: 'Window', value: `${data.config.sloWindowDays ?? 30}d` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-brand-muted">{label}</span>
                      <span className="font-mono text-sm font-semibold text-brand-text">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-brand-line">
                  <Button variant="outline" size="sm" onClick={() => startEdit(data)}>
                    Edit SLO target
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRemove(true)}
                    className="text-brand-red hover:text-brand-red"
                  >
                    Remove SLO
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Inline edit form */}
          {editing && (
            <div className="rounded-lg border border-brand-line bg-brand-surface p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Configure SLO</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-brand-dim">Target uptime (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="99.9"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-brand-dim">Window (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={windowDays}
                    onChange={(e) => setWindowDays(e.target.value)}
                    placeholder="30"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              {formError && <p className="text-xs text-brand-red">{formError}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={updateSlo.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove SLO?</DialogTitle>
            <DialogDescription>
              This clears the SLO target and window for this monitor. Burn-rate alerts
              tied to this SLO will stop firing. You can set a new SLO at any time.
            </DialogDescription>
          </DialogHeader>
          {formError && <p className="text-xs text-brand-red">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(false)} disabled={updateSlo.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={updateSlo.isPending}
            >
              {updateSlo.isPending ? 'Removing…' : 'Remove SLO'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Deploys tab ──────────────────────────────────────────────────────────────

function DeploysTab({ monitorId, plan }: { monitorId: string; plan: string }) {
  const { data: deploys, isLoading, isError, refetch } = useDeploys(monitorId);
  const startDeploy = useStartDeploy(monitorId);
  const endDeploy = useEndDeploy(monitorId);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [commitSha, setCommitSha] = useState('');
  const [formError, setFormError] = useState('');

  if (plan === 'free') {
    return (
      <div className="p-4">
        <UpgradePrompt currentPlan="free" limitReached="deploy-aware monitoring" />
      </div>
    );
  }

  const now = new Date();
  const activeDeploy = deploys?.find(
    (d) => new Date(d.startedAt) <= now && (!d.endedAt || new Date(d.endedAt) >= now)
  );

  function handleStart() {
    setFormError('');
    startDeploy.mutate(
      { description: label || undefined, commitSha: commitSha || undefined, suppressAlerts: true },
      {
        onSuccess: () => { setShowForm(false); setLabel(''); setCommitSha(''); },
        onError: (err) => setFormError(err.message),
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* Active deploy banner */}
      {activeDeploy && (
        <div className="flex items-center justify-between rounded-lg border border-brand-amber/40 bg-brand-amber/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-brand-amber" />
            <div>
              <p className="text-sm font-medium text-brand-text">Deploy in progress</p>
              <p className="text-xs text-brand-muted">
                Started {formatDistanceToNow(new Date(activeDeploy.startedAt), { addSuffix: true })}
                {activeDeploy.description && ` · ${activeDeploy.description}`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => endDeploy.mutate()}
            disabled={endDeploy.isPending}
          >
            End deploy
          </Button>
        </div>
      )}

      {/* Mark deploy button / form */}
      {!activeDeploy && !showForm && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Rocket className="mr-1.5 h-3.5 w-3.5" />
            Mark deploy
          </Button>
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-brand-line bg-brand-surface p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">New deploy</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-dim">Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="v2.3.1, hotfix"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-dim">Commit SHA (optional)</Label>
              <Input
                value={commitSha}
                onChange={(e) => setCommitSha(e.target.value)}
                placeholder="abc1234"
                className="h-8 font-mono text-sm"
              />
            </div>
          </div>
          {formError && <p className="text-xs text-brand-red">{formError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleStart} disabled={startDeploy.isPending}>
              Start deploy
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Deploy history */}
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Deploy history</h2>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-brand-bg3" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-sm text-brand-red">Failed to load deploys.</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
          {!deploys || deploys.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-brand-muted">No deploys recorded yet.</p>
          ) : (
            <div>
              <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
                {['Started', 'Label / SHA', 'Duration', 'Status'].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                    {h}
                  </span>
                ))}
              </div>
              {deploys.map((d) => {
                const isActive = !d.endedAt || new Date(d.endedAt) >= now;
                const dur = d.endedAt
                  ? durationStr(d.startedAt, d.endedAt)
                  : formatDistanceToNow(new Date(d.startedAt));
                return (
                  <div
                    key={d.id}
                    className="grid grid-cols-4 items-center border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30"
                  >
                    <span className="font-mono text-xs text-brand-dim">
                      {format(new Date(d.startedAt), 'MMM d, HH:mm')}
                    </span>
                    <span className="truncate font-mono text-xs text-brand-dim">
                      {d.description ?? d.commitSha ?? <span className="text-brand-muted">—</span>}
                    </span>
                    <span className="font-mono text-xs text-brand-dim">{dur}</span>
                    <span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-amber">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-amber" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                          Done
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Snapshots tab ────────────────────────────────────────────────────────────

function SnapshotsTab({ monitorId }: { monitorId: string }) {
  const { data, isLoading, isError, refetch } = useSnapshots(monitorId);
  const snapshots = data?.snapshots ?? [];
  const [selectedIdx, setSelectedIdx] = useState(0);

  const fromId = snapshots[selectedIdx + 1]?.id ?? null;
  const toId = snapshots[selectedIdx]?.id ?? null;
  const diffQ = useSnapshotDiff(monitorId, fromId, toId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-brand-bg3" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-brand-line bg-brand-surface p-6 text-center">
        <p className="text-sm text-brand-red">Failed to load snapshots.</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-brand-line bg-brand-surface p-6 text-center">
        <p className="text-sm text-brand-muted">No snapshots captured yet. The content worker captures a snapshot on each detected change.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 flex-col md:flex-row">
      {/* Snapshot list */}
      <div className="w-full md:w-64 md:shrink-0 rounded-lg border border-brand-line bg-brand-surface overflow-hidden">
        <div className="border-b border-brand-line px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Snapshots</h2>
          <span className="text-[10px] text-brand-muted">{snapshots.length} / {data?.planLimit}</span>
        </div>
        <div className="divide-y divide-brand-line">
          {snapshots.map((snap, idx) => (
            <button
              key={snap.id}
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                'w-full px-4 py-2.5 text-left transition-colors hover:bg-brand-bg3/60',
                selectedIdx === idx && 'bg-brand-bg3'
              )}
            >
              <p className="font-mono text-xs text-brand-dim">
                {format(new Date(snap.capturedAt), 'MMM d, HH:mm:ss')}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">
                {(snap.bytes / 1024).toFixed(1)} KB
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Diff viewer */}
      <div className="min-w-0 flex-1 rounded-lg border border-brand-line bg-brand-surface overflow-x-auto">
        <div className="border-b border-brand-line px-4 py-3 flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            {fromId ? 'Changes from previous snapshot' : 'Latest snapshot (no previous to compare)'}
          </h2>
          {diffQ.data && (
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-semibold text-brand-green">+{diffQ.data.added}</span>
              <span className="text-[10px] font-semibold text-brand-red">-{diffQ.data.removed}</span>
              {diffQ.data.truncated && (
                <span className="text-[10px] text-brand-amber">truncated</span>
              )}
            </span>
          )}
        </div>

        {!fromId ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">Only one snapshot available — no diff to show.</p>
        ) : diffQ.isLoading ? (
          <div className="px-4 py-8 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          </div>
        ) : diffQ.isError ? (
          <p className="px-4 py-8 text-center text-sm text-brand-red">Failed to load diff.</p>
        ) : diffQ.data ? (
          <div className="overflow-auto max-h-[480px]">
            <pre className="text-[11px] font-mono">
              {diffQ.data.lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'px-4 py-0.5 leading-relaxed whitespace-pre-wrap break-all',
                    line.op === 'add' && 'bg-brand-green/10 text-brand-green',
                    line.op === 'remove' && 'bg-brand-red/10 text-brand-red',
                    line.op === 'equal' && 'text-brand-dim'
                  )}
                >
                  <span className="select-none mr-2 text-brand-muted">
                    {line.op === 'add' ? '+' : line.op === 'remove' ? '-' : ' '}
                  </span>
                  {line.text}
                </div>
              ))}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>('24h');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recentLimit, setRecentLimit] = useState(25);

  const sessionQ = useSession();
  const monitorQ = useMonitor(id);
  const resultsQ = useCheckResults(id, range, 500);
  const incidentsQ = useMonitorIncidents(id);
  const channelsQ = useAlertChannels();
  const deleteMonitor = useDeleteMonitor(id);

  const monitor = monitorQ.data;
  useBreadcrumbOverride(id, monitor?.name);
  const results = resultsQ.data ?? [];
  const incidents = (incidentsQ.data ?? []) as unknown as IncidentApiRow[];
  const channels = channelsQ.data ?? [];
  const sessionUserId = sessionQ.data?.userId;
  const plan = sessionQ.data?.plan ?? 'free';

  const multiLocationEnabled = process.env['NEXT_PUBLIC_FEATURE_MULTI_LOCATION'] === 'true';
  const hasRegionData = results.some((r) => r.region != null);
  const isContentMonitor = monitor?.type === 'content';

  // Group by checkedAt so multi-region rounds collapse to one point (avg across regions).
  const chartData = (() => {
    const byTs = new Map<string, number[]>();
    [...results].reverse().forEach((r) => {
      if (r.responseTimeMs == null) return;
      const bucket = byTs.get(r.checkedAt) ?? [];
      bucket.push(r.responseTimeMs);
      byTs.set(r.checkedAt, bucket);
    });
    return [...byTs.entries()].map(([ts, msList]) => ({
      time: format(new Date(ts), 'HH:mm'),
      ms: Math.round(msList.reduce((a, b) => a + b, 0) / msList.length),
    }));
  })();

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
        {/* Left: tabs */}
        <div className="min-w-0 flex-1 space-y-5">
          <Tabs defaultValue="performance">
            <TabsList className="mb-4 bg-brand-bg3 border border-brand-line flex-wrap h-auto gap-0.5 p-1">
              {[
                { value: 'performance', label: 'Performance' },
                { value: 'incidents', label: 'Incidents' },
                { value: 'slo', label: 'SLO' },
                { value: 'deploys', label: 'Deploys' },
                ...(isContentMonitor ? [{ value: 'snapshots', label: 'Snapshots' }] : []),
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

            {/* Performance tab */}
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
                        onClick={() => { setRange(r); setRecentLimit(25); }}
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
                              <CartesianGrid strokeDasharray="3 3" stroke="#222230" vertical={false} />
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
                      <div className={cn('border-b border-brand-line px-4 py-2', hasRegionData ? 'grid grid-cols-5' : 'grid grid-cols-4')}>
                        {['Time', ...(hasRegionData ? ['Region'] : []), 'Code', 'Response', 'Result'].map((h) => (
                          <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                            {h}
                          </span>
                        ))}
                      </div>
                      {results.slice(0, recentLimit).map((r) => (
                        <div
                          key={r.id}
                          className={cn('border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30', hasRegionData ? 'grid grid-cols-5' : 'grid grid-cols-4')}
                        >
                          <span className="font-mono text-xs text-brand-dim">
                            {format(new Date(r.checkedAt), 'MMM d, HH:mm:ss')}
                          </span>
                          {hasRegionData && (
                            <span className="font-mono text-xs text-brand-muted">
                              {r.region ?? '—'}
                            </span>
                          )}
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
                      {results.length > recentLimit && (
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                          <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                            Showing {recentLimit} of {results.length}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRecentLimit((n) => Math.min(n + 25, results.length))}
                          >
                            Load more
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </QueryState>
              </div>
            </TabsContent>

            {/* Incidents tab */}
            <TabsContent value="incidents" className="mt-0">
              <IncidentsTab
                incidents={incidents}
                isLoading={incidentsQ.isLoading}
                isError={incidentsQ.isError}
                onRetry={() => incidentsQ.refetch()}
                sessionUserId={sessionUserId}
              />
            </TabsContent>

            {/* SLO tab */}
            <TabsContent value="slo" className="mt-0">
              <SloTab monitorId={id} plan={plan} />
            </TabsContent>

            {/* Deploys tab */}
            <TabsContent value="deploys" className="mt-0">
              <DeploysTab monitorId={id} plan={plan} />
            </TabsContent>

            {/* Snapshots tab — content monitors only */}
            {isContentMonitor && (
              <TabsContent value="snapshots" className="mt-0">
                <SnapshotsTab monitorId={id} />
              </TabsContent>
            )}

            {/* Regions tab — feature flagged */}
            {multiLocationEnabled && hasRegionData && (
              <TabsContent value="regions" className="mt-0">
                <RegionsTab results={results} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
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

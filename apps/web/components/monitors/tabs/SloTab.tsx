'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { useSlo, useUpdateSlo } from '@/lib/hooks/use-slo';
import type { SloData } from '@/lib/repositories/slo';

function SloGauge({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'text-brand-green-ink' : pct >= 40 ? 'text-brand-amber' : 'text-brand-red';
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

export function SloTab({ monitorId, plan }: { monitorId: string; plan: string }) {
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
        <UpgradePrompt currentPlan="free" limitReached="reliability targets" />
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
        <p className="text-sm text-brand-red">Failed to load reliability data.</p>
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
              <p className="text-sm text-brand-muted">No reliability target configured for this monitor.</p>
              <Button size="sm" className="mt-3" onClick={() => { setTarget('99.9'); setWindowDays('30'); setFormError(''); setEditing(true); }}>
                Set reliability target
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-brand-line bg-brand-surface p-5 flex flex-col items-center gap-2">
                {data.metrics && (
                  <SloGauge pct={100 - data.metrics.errorBudgetConsumedPercent} />
                )}
                <p className="text-xs text-brand-muted text-center">Error budget remaining</p>
              </div>

              <div className="sm:col-span-2 rounded-lg border border-brand-line bg-brand-surface p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {data.metrics && [
                    { label: 'Current uptime', value: `${data.metrics.uptimePercent.toFixed(3)}%` },
                    { label: 'Reliability target', value: `${(data.config.sloTarget * 100).toFixed(2)}%` },
                    { label: 'Budget total', value: `${Math.round(data.metrics.errorBudgetTotalMinutes)}m` },
                    { label: 'Budget remaining', value: `${Math.round(data.metrics.errorBudgetRemainingMinutes)}m` },
                    { label: 'Budget rate', value: `${data.metrics.burnRate.toFixed(2)}x` },
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
                    Edit reliability target
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRemove(true)}
                    className="text-brand-red hover:text-brand-red"
                  >
                    Remove target
                  </Button>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="rounded-lg border border-brand-line bg-brand-surface p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Configure reliability target</h3>
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
            <DialogTitle>Remove reliability target?</DialogTitle>
            <DialogDescription>
              This clears the reliability target and window for this monitor. Burn alerts
              tied to this target will stop firing. You can set a new target at any time.
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
              {updateSlo.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

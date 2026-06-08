'use client';

import { useState } from 'react';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { useDeploys, useStartDeploy, useEndDeploy } from '@/lib/hooks/use-deploys';

function durationStr(startedAt: string | Date, resolvedAt: string | Date | null) {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const mins = differenceInMinutes(end, new Date(startedAt));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function DeploysTab({ monitorId, plan }: { monitorId: string; plan: string }) {
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

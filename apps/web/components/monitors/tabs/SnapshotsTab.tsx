'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSnapshots, useSnapshotDiff, useNotifySnapshot } from '@/lib/hooks/use-snapshots';

export function SnapshotsTab({ monitorId }: { monitorId: string }) {
  const { data, isLoading, isError, refetch } = useSnapshots(monitorId);
  const snapshots = data?.snapshots ?? [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pendingSnapshotIds, setPendingSnapshotIds] = useState<ReadonlySet<string>>(new Set());
  const notifyMutation = useNotifySnapshot(monitorId);

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
      <div className="w-full md:w-64 md:shrink-0 rounded-lg border border-brand-line bg-brand-surface overflow-hidden">
        <div className="border-b border-brand-line px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Snapshots</h2>
          <span className="text-[10px] text-brand-muted">{snapshots.length} / {data?.planLimit}</span>
        </div>
        <div className="divide-y divide-brand-line">
          {snapshots.map((snap, idx) => (
            <div
              key={snap.id}
              className={cn(
                'w-full px-4 py-2.5 transition-colors hover:bg-brand-bg3/60 cursor-pointer',
                selectedIdx === idx && 'bg-brand-bg3'
              )}
              onClick={() => setSelectedIdx(idx)}
            >
              <div className="flex items-center gap-1.5">
                <p className="font-mono text-xs text-brand-dim">
                  {format(new Date(snap.capturedAt), 'MMM d, HH:mm:ss')}
                </p>
                {snap.classification === 'noise' && (
                  <span className="rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-brand-bg3 text-brand-muted border border-brand-line">
                    noise
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[10px] text-brand-muted">
                  {(snap.bytes / 1024).toFixed(1)} KB
                </p>
                {snap.classification === 'noise' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingSnapshotIds((prev) => new Set([...prev, snap.id]));
                      notifyMutation.mutate(snap.id, {
                        onSettled: () =>
                          setPendingSnapshotIds((prev) => {
                            const next = new Set(prev);
                            next.delete(snap.id);
                            return next;
                          }),
                      });
                    }}
                    disabled={pendingSnapshotIds.has(snap.id)}
                    className="text-[10px] text-brand-blue hover:underline disabled:opacity-50"
                  >
                    {pendingSnapshotIds.has(snap.id) ? 'Sending…' : 'Notify anyway'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 rounded-lg border border-brand-line bg-brand-surface overflow-x-auto">
        <div className="border-b border-brand-line px-4 py-3 flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            {fromId ? 'Changes from previous snapshot' : 'Latest snapshot (no previous to compare)'}
          </h2>
          {diffQ.data && (
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-semibold text-brand-green-ink">+{diffQ.data.added}</span>
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
                    line.op === 'add' && 'bg-brand-green/10 text-brand-green-ink',
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

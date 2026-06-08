'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAnomalies } from '@/lib/hooks/use-anomalies';

export function AnomaliesTab({ monitorId }: { monitorId: string }) {
  const { data: anomalies = [], isLoading, isError, refetch } = useAnomalies(monitorId);

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
        <p className="text-sm text-brand-red">Failed to load Smart Alerts data.</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Smart Alerts</h2>
      </div>
      {anomalies.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-brand-muted">
          No Smart Alerts triggered in the last 90 days.
        </p>
      ) : (
        <div>
          <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
            {['Time', 'Response (ms)', 'Baseline mean (ms)', 'z-score'].map((h) => (
              <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                {h}
              </span>
            ))}
          </div>
          {anomalies.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-4 items-center border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30"
            >
              <span className="font-mono text-xs text-brand-dim">
                {format(new Date(a.checkedAt), 'MMM d, HH:mm')}
              </span>
              <span className="font-mono text-sm font-semibold text-brand-red">{a.responseTimeMs}</span>
              <span className="font-mono text-xs text-brand-dim">{Math.round(a.meanMs)}</span>
              <span className="font-mono text-xs text-brand-amber">{a.zScore.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

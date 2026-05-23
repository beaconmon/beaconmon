'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useSlo } from '@/lib/hooks/use-slo';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { PlanTier } from '@beaconmon/types';

interface ReliabilityPanelProps {
  primaryMonitor: MonitorRow | undefined;
  plan: PlanTier;
}

export function ReliabilityPanel({ primaryMonitor, plan }: ReliabilityPanelProps) {
  const isGated = plan === 'free' || plan === 'starter';
  const sloQ = useSlo(primaryMonitor?.id ?? '');
  const slo = sloQ.data;

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Reliability
        </p>
        <TrendingUp className="h-3.5 w-3.5 text-brand-muted" />
      </div>

      {isGated ? (
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-brand-dim">Reliability targets are available on Growth and above.</p>
          <Link
            href="/settings/billing"
            className="mt-3 inline-block rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-brand-green-fg"
          >
            Upgrade plan
          </Link>
        </div>
      ) : !primaryMonitor ? (
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-brand-muted">Add monitors to track reliability.</p>
        </div>
      ) : !slo?.config.sloTarget ? (
        <div className="px-4 py-5 text-center space-y-2">
          <p className="text-sm text-brand-dim">No reliability target set.</p>
          <Link
            href={`/monitors/${primaryMonitor.id}/edit`}
            className="text-xs text-brand-green-ink hover:underline"
          >
            Set a target →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-brand-dim">Target</span>
            <span className="font-mono text-sm font-semibold text-brand-text">
              {slo.config.sloTarget}%
            </span>
          </div>
          {slo.metrics && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-brand-dim">Actual</span>
                <span
                  className={`font-mono text-sm font-semibold ${
                    slo.metrics.uptimePercent >= slo.config.sloTarget
                      ? 'text-brand-green-ink'
                      : 'text-brand-red'
                  }`}
                >
                  {slo.metrics.uptimePercent.toFixed(3)}%
                </span>
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs text-brand-muted">Error budget</span>
                  <span className="font-mono text-xs text-brand-dim">
                    {Math.max(0, slo.metrics.errorBudgetRemainingMinutes).toFixed(0)}m left
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-bg3">
                  <div
                    className="h-full rounded-full bg-brand-green transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, 100 - slo.metrics.errorBudgetConsumedPercent))}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
          <Link
            href={`/monitors/${primaryMonitor.id}/edit`}
            className="block text-right text-xs text-brand-green-ink hover:underline"
          >
            Edit target →
          </Link>
        </div>
      )}
    </div>
  );
}

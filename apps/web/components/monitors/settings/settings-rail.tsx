'use client';

import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { MonitorRow } from '@/lib/repositories/monitors';

interface SettingsRailProps {
  monitor: MonitorRow;
}

export function SettingsRail({ monitor }: SettingsRailProps) {
  const { data: notifData } = useNotifications();
  const recentItems = (notifData?.items ?? [])
    .filter((item) => item.monitorName === monitor.name)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Live status */}
      <div
        className="overflow-hidden rounded-lg"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        <div className="border-b border-brand-line px-4 py-2.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
            Live status
          </p>
        </div>
        <div className="space-y-2 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-dim">Status</span>
            <StatusBadge status={monitor.currentStatus} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-dim">Last check</span>
            <span className="font-mono text-xs text-brand-muted">
              {monitor.lastCheckedAt
                ? formatDistanceToNow(new Date(monitor.lastCheckedAt), { addSuffix: true })
                : 'Never'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-dim">Interval</span>
            <span className="font-mono text-xs text-brand-muted">
              {monitor.intervalSeconds < 60
                ? `${monitor.intervalSeconds}s`
                : `${monitor.intervalSeconds / 60}m`}
            </span>
          </div>
        </div>
      </div>

      {/* Pro tip */}
      <div
        className="overflow-hidden rounded-lg px-4 py-4"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Pro tip</p>
        <p className="mt-2 text-sm italic text-brand-dim">
          Set a reliability target to get error-budget burn alerts before your SLO is at risk.
        </p>
      </div>

      {/* Recent activity */}
      {recentItems.length > 0 && (
        <div
          className="overflow-hidden rounded-lg"
          style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
        >
          <div className="border-b border-brand-line px-4 py-2.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
              Recent activity
            </p>
          </div>
          <div>
            {recentItems.map((item, i) => (
              <div
                key={item.id}
                className={`px-4 py-2.5 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
              >
                <p className="text-xs font-medium text-brand-text">{item.title}</p>
                <p className="font-mono text-[10px] text-brand-muted">
                  {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

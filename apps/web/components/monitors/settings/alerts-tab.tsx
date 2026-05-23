'use client';

import Link from 'next/link';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';

interface AlertsTabProps {
  anomalyDetectionEnabled: boolean;
  onAnomalyToggle: (enabled: boolean) => void;
}

export function AlertsTab({ anomalyDetectionEnabled, onAnomalyToggle }: AlertsTabProps) {
  const { data: channels = [] } = useAlertChannels();

  return (
    <div className="space-y-8 py-2">
      {/* Anomaly detection */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-text">Anomaly detection</p>
          <p className="text-xs text-brand-muted">
            Automatically detect unusual response time patterns using statistical analysis.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-line bg-brand-bg2 p-4">
          <input
            type="checkbox"
            checked={anomalyDetectionEnabled}
            onChange={(e) => onAnomalyToggle(e.target.checked)}
            className="mt-0.5 accent-brand-green"
          />
          <div>
            <p className="text-sm font-medium text-brand-text">Enable smart alerts</p>
            <p className="text-xs text-brand-muted">
              Alert when response time is statistically unusual. Uses z-score outlier detection on
              recent check results.
            </p>
          </div>
        </label>
      </div>

      {/* Alert channels */}
      {channels.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-text">Alert channels</p>
          <div className="space-y-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-3 rounded-lg border border-brand-line bg-brand-bg2 px-4 py-3"
              >
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-brand-dim"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
                >
                  {ch.type}
                </span>
                <span className="flex-1 text-sm text-brand-text">{ch.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-muted">
            Manage channels in{' '}
            <Link href="/alert-channels" className="text-brand-green-ink hover:underline">
              Alert Channels
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

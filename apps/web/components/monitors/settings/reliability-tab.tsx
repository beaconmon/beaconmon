'use client';

import { useState } from 'react';
import { useSlo, useUpdateSlo } from '@/lib/hooks/use-slo';
import type { PlanTier } from '@beaconmon/types';

const PRESETS = [99, 99.5, 99.9, 99.95, 99.99];
const WINDOWS = [7, 30, 90] as const;

function downtimeLabel(targetPct: number): string {
  const downtimeMs = (1 - targetPct / 100) * 30 * 24 * 60 * 60 * 1000;
  const totalSec = Math.round(downtimeMs / 1000);
  if (totalSec < 60) return `${totalSec}s/month`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s/month`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m/month`;
}

interface ReliabilityTabProps {
  monitorId: string;
  plan: PlanTier;
}

export function ReliabilityTab({ monitorId, plan }: ReliabilityTabProps) {
  const isGated = plan === 'free' || plan === 'starter';
  const sloQ = useSlo(monitorId);
  const updateSlo = useUpdateSlo(monitorId);
  const slo = sloQ.data;

  const [target, setTarget] = useState<number>(slo?.config.sloTarget ?? 99.9);
  const [window, setWindow] = useState<number>(slo?.config.sloWindowDays ?? 30);
  const [fastBurn, setFastBurn] = useState(slo?.config.sloBurnRateFastThreshold != null);
  const [slowBurn, setSlowBurn] = useState(slo?.config.sloBurnRateSlowThreshold != null);
  const [saved, setSaved] = useState(false);

  if (isGated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-brand-dim">Reliability targets are available on Growth and Scale plans.</p>
      </div>
    );
  }

  async function handleSave() {
    updateSlo.mutate(
      {
        sloTarget: target,
        sloWindowDays: window,
        sloBurnRateFastThreshold: fastBurn ? 14.4 : null,
        sloBurnRateSlowThreshold: slowBurn ? 1 : null,
      },
      {
        onSuccess: () => setSaved(true),
      }
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Target slider */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-text">Uptime target</p>
          <p className="text-xs text-brand-muted">
            Set the percentage of time your service must be available.
          </p>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setTarget(p); setSaved(false); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                target === p
                  ? 'bg-brand-green text-brand-green-fg'
                  : 'border border-brand-line bg-brand-bg2 text-brand-dim hover:border-brand-green/40 hover:text-brand-text'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={99}
            max={99.99}
            step={0.01}
            value={target}
            onChange={(e) => { setTarget(parseFloat(e.target.value)); setSaved(false); }}
            className="w-full accent-brand-green"
          />
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-brand-text">{target}%</span>
            <span className="font-mono text-sm text-brand-muted">
              ≈ {downtimeLabel(target)} allowed downtime
            </span>
          </div>
        </div>
      </div>

      {/* Measurement window */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-text">Measurement window</p>
        <div
          className="inline-flex rounded-full p-0.5"
          style={{ background: 'var(--brand-bg3)', boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
        >
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => { setWindow(w); setSaved(false); }}
              className={`rounded-full px-4 py-1.5 font-mono text-sm font-medium transition-all ${
                window === w
                  ? 'bg-brand-bg text-brand-text shadow-sm'
                  : 'text-brand-muted hover:text-brand-dim'
              }`}
            >
              {w}d
            </button>
          ))}
        </div>
      </div>

      {/* Burn rate alerts */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-text">Smart alert triggers</p>
        <div className="space-y-2">
          {[
            { key: 'fast', label: 'Fast burn alert', desc: 'Alert when error budget burns 14.4x normal rate (will exhaust in 1h)', checked: fastBurn, onChange: (v: boolean) => { setFastBurn(v); setSaved(false); } },
            { key: 'slow', label: 'Slow burn alert', desc: 'Alert when error budget burns 1x normal rate (on track to exhaust by window end)', checked: slowBurn, onChange: (v: boolean) => { setSlowBurn(v); setSaved(false); } },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-line bg-brand-bg2 p-3"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="mt-0.5 accent-brand-green"
              />
              <div>
                <p className="text-sm font-medium text-brand-text">{item.label}</p>
                <p className="text-xs text-brand-muted">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Current metrics */}
      {slo?.metrics && (
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Current metrics</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Uptime', value: `${slo.metrics.uptimePercent.toFixed(3)}%` },
              { label: 'Budget left', value: `${Math.max(0, slo.metrics.errorBudgetRemainingMinutes).toFixed(0)}m` },
              { label: 'Consumed', value: `${slo.metrics.errorBudgetConsumedPercent.toFixed(1)}%` },
              { label: 'Burn rate', value: `${slo.metrics.burnRate.toFixed(2)}x` },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[10px] text-brand-muted">{m.label}</p>
                <p className="font-mono text-sm font-semibold text-brand-text">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => void handleSave()}
          disabled={updateSlo.isPending}
          className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-brand-green-fg transition-opacity disabled:opacity-50"
        >
          {updateSlo.isPending ? 'Saving…' : 'Save reliability settings'}
        </button>
        {saved && <span className="text-sm text-brand-green-ink">Saved</span>}
        {updateSlo.isError && (
          <span className="text-sm text-brand-red">{updateSlo.error?.message}</span>
        )}
      </div>
    </div>
  );
}

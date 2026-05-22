'use client';

import { Globe, Shield, RefreshCw, FileSearch, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PlanTier } from '@beaconmon/types';
import { reliabilityLabel } from '@/lib/onboarding-templates';
import type { PlatformType } from '@/lib/onboarding-templates';

export interface BundleItem {
  id: string;
  label: string;
  type: 'http' | 'ssl' | 'domain' | 'content';
  path: string | null;
  url: string;
  intervalSeconds: number;
  enabled: boolean;
  source?: 'ai' | 'template';
  selectorChosen?: string | null;
}

interface Step2BundleProps {
  platform: PlatformType;
  bundle: BundleItem[];
  onBundleChange: (bundle: BundleItem[]) => void;
  plan: PlanTier;
  loading?: boolean;
  degraded?: boolean;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

const TYPE_ICONS: Record<BundleItem['type'], React.ReactNode> = {
  http:    <RefreshCw className="h-3.5 w-3.5" />,
  content: <FileSearch className="h-3.5 w-3.5" />,
  ssl:     <Shield className="h-3.5 w-3.5" />,
  domain:  <Globe className="h-3.5 w-3.5" />,
};

const TYPE_LABEL: Record<BundleItem['type'], string> = {
  http:    'Uptime',
  content: 'Content',
  ssl:     'SSL',
  domain:  'Domain',
};

function formatInterval(s: number): string {
  if (s < 60)  return `${s}s`;
  if (s < 3600) return `${s / 60}m`;
  return `${s / 3600}h`;
}

function formatCheckBudget(items: BundleItem[]): string {
  const enabled = items.filter((i) => i.enabled);
  const perDay = enabled.reduce((sum, m) => sum + 86400 / m.intervalSeconds, 0);
  const rounded = Math.round(perDay);
  return rounded >= 1000 ? `~${Math.round(rounded / 1000)}k/day` : `${rounded}/day`;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-bg2 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-text">{value}</p>
    </div>
  );
}

function SkeletonRow({ last }: { last?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !last && 'border-b border-brand-line')}>
      <div className="h-6 w-6 shrink-0 animate-pulse rounded bg-brand-bg3" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-32 animate-pulse rounded bg-brand-bg3" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-brand-bg2" />
      </div>
      <div className="h-4 w-12 shrink-0 animate-pulse rounded-full bg-brand-bg3" />
      <div className="h-4 w-6 shrink-0 animate-pulse rounded bg-brand-bg2" />
      <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-brand-bg3" />
    </div>
  );
}

export function Step2Bundle({
  platform,
  bundle,
  onBundleChange,
  loading = false,
  degraded = false,
  onBack,
  onSkip,
  onContinue,
}: Step2BundleProps) {
  const [degradedDismissed, setDegradedDismissed] = useState(false);
  const enabledCount = bundle.filter((b) => b.enabled).length;

  function toggle(id: string) {
    onBundleChange(
      bundle.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-brand-text">Smart Setup</h2>
        <p className="text-sm text-brand-dim">
          {loading
            ? 'AI is analyzing your store…'
            : 'We prepared a monitoring bundle based on your platform. Toggle off anything you don’t need.'}
        </p>
      </div>

      {/* Degradation notice */}
      {degraded && !loading && !degradedDismissed && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-300/30 bg-amber-50/5 px-4 py-3">
          <p className="text-sm text-amber-400">
            AI analysis unavailable. Showing standard templates.
          </p>
          <button
            onClick={() => setDegradedDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 text-amber-400/60 hover:text-amber-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Monitors prepared" value={String(enabledCount)} />
          <StatBox label="Reliability target" value={reliabilityLabel(platform)} />
          <StatBox label="Check budget" value={formatCheckBudget(bundle)} />
          <StatBox label="Setup time" value="0 min, all automatic" />
        </div>
      )}

      {/* Monitor list */}
      <div className="overflow-hidden rounded-lg border border-brand-line">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow last />
          </>
        ) : (
          bundle.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                i > 0 && 'border-t border-brand-line',
                !item.enabled && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-brand-muted',
                  item.enabled ? 'bg-brand-bg3' : 'bg-brand-bg2'
                )}
              >
                {TYPE_ICONS[item.type]}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-text">{item.label}</p>
                {item.path && (
                  <p className="truncate text-xs text-brand-muted">{item.path}</p>
                )}
                {item.type === 'content' && item.source === 'ai' && (
                  <p className="text-[10px] text-brand-muted font-mono mt-0.5">
                    {item.selectorChosen
                      ? `selector: ${item.selectorChosen}`
                      : 'No selector, full page'}
                  </p>
                )}
              </div>

              {item.source === 'ai' && (
                <span className="shrink-0 rounded-full bg-brand-green/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-green-ink">
                  AI
                </span>
              )}
              <span className="shrink-0 rounded-full bg-brand-bg3 px-2 py-0.5 text-[10px] font-medium text-brand-dim">
                {TYPE_LABEL[item.type]}
              </span>
              <span className="shrink-0 text-xs text-brand-muted">
                {formatInterval(item.intervalSeconds)}
              </span>

              <button
                onClick={() => toggle(item.id)}
                aria-label={item.enabled ? 'Disable monitor' : 'Enable monitor'}
                className="shrink-0 text-brand-muted hover:text-brand-text transition-colors"
              >
                {item.enabled ? (
                  <ToggleRight className="h-5 w-5 text-brand-green-ink" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brand-dim hover:text-brand-text"
        >
          Back to platform
        </Button>

        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-brand-muted hover:text-brand-dim transition-colors"
          >
            Skip, I&apos;ll add manually
          </button>
          <Button
            onClick={onContinue}
            disabled={loading}
            className="bg-brand-green text-brand-green-fg hover:bg-brand-green/90 disabled:opacity-50"
          >
            Looks good, next
          </Button>
        </div>
      </div>
    </div>
  );
}

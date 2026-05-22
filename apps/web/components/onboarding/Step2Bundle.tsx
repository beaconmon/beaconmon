'use client';

import { Globe, Shield, RefreshCw, FileSearch, ToggleLeft, ToggleRight } from 'lucide-react';
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
}

interface Step2BundleProps {
  platform: PlatformType;
  bundle: BundleItem[];
  onBundleChange: (bundle: BundleItem[]) => void;
  plan: PlanTier;
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

export function Step2Bundle({
  platform,
  bundle,
  onBundleChange,
  onBack,
  onSkip,
  onContinue,
}: Step2BundleProps) {
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
          We prepared a monitoring bundle based on your platform. Toggle off anything you don&apos;t
          need.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Monitors prepared" value={String(enabledCount)} />
        <StatBox label="Reliability target" value={reliabilityLabel(platform)} />
        <StatBox label="Check budget" value={formatCheckBudget(bundle)} />
        <StatBox label="Setup time" value="0 min, all automatic" />
      </div>

      {/* Monitor list */}
      <div className="overflow-hidden rounded-lg border border-brand-line">
        {bundle.map((item, i) => (
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
            </div>

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
        ))}
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
            className="bg-brand-green text-brand-green-fg hover:bg-brand-green/90"
          >
            Looks good, next
          </Button>
        </div>
      </div>
    </div>
  );
}

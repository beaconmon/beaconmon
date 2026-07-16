'use client';

import {
  Globe, Lock, DollarSign, Zap, LayoutGrid, FileText,
  X, ChevronRight, Plus, Check, Loader2, AlertCircle,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  description?: string;
}

interface BundleStepProps {
  storeUrl: string;
  platform: PlatformType;
  bundle: BundleItem[];
  onBundleChange: (bundle: BundleItem[]) => void;
  plan: PlanTier;
  loading?: boolean;
  degraded?: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  error: string | null;
}

const TYPE_LABEL: Record<BundleItem['type'], string> = {
  http:    'Uptime check',
  content: 'Change detection',
  ssl:     'SSL certificate',
  domain:  'Domain expiry',
};

function getItemIcon(item: BundleItem): React.ReactNode {
  if (item.type === 'ssl')    return <Lock className="h-4 w-4" />;
  if (item.type === 'domain') return <Globe className="h-4 w-4" />;
  if (item.type === 'http')   return <Zap className="h-4 w-4" />;
  const lower = item.label.toLowerCase();
  if (lower.includes('bestseller') || lower.includes('product') || lower.includes('cart')) {
    return <DollarSign className="h-4 w-4" />;
  }
  if (lower.includes('collection') || lower.includes('arrivals') || lower.includes('shop')) {
    return <LayoutGrid className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
}

function displayPath(item: BundleItem): string {
  if (item.path) return item.path;
  try { return new URL(item.url).hostname; } catch { return item.url; }
}

function extractHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function formatInterval(s: number): string {
  if (s >= 86400) return 'Daily';
  if (s < 60)     return `${s}s`;
  if (s < 3600)   return `${s / 60} min`;
  return `${s / 3600}h`;
}

function formatCheckBudget(items: BundleItem[]): string {
  const enabled = items.filter((i) => i.enabled);
  const perDay  = enabled
    .filter((m) => m.intervalSeconds > 0)
    .reduce((sum, m) => sum + 86400 / m.intervalSeconds, 0);
  const rounded = Math.round(perDay);
  return rounded >= 1000 ? `~${Math.round(rounded / 1000)}k/day` : `${rounded}/day`;
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          'relative inline-flex h-6 w-11 rounded-full transition-colors duration-200',
          enabled ? 'bg-brand-green' : 'bg-brand-bg3'
        )}
      >
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-200',
            enabled ? 'left-5' : 'left-0.5'
          )}
        />
      </span>
    </button>
  );
}

interface StatColProps {
  label: string;
  value: string;
  sub: string;
  border?: boolean;
}

function StatCol({ label, value, sub, border }: StatColProps) {
  return (
    <div className={cn('flex-1 px-5 py-4', border && 'border-l border-brand-line')}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-text">{value}</p>
      <p className="mt-0.5 text-xs text-brand-dim">{sub}</p>
    </div>
  );
}

function SkeletonRow({ last }: { last?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-4', !last && 'border-b border-brand-line')}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-brand-bg3" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-brand-bg3" />
          <div className="h-2.5 w-28 animate-pulse rounded bg-brand-bg2" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
        <div className="h-5 w-16 shrink-0 animate-pulse rounded-md bg-brand-bg3" />
        <div className="h-4 w-10 shrink-0 animate-pulse rounded bg-brand-bg2" />
        <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-brand-bg3" />
      </div>
    </div>
  );
}

export function BundleStep({
  storeUrl,
  platform,
  bundle,
  onBundleChange,
  plan,
  loading = false,
  degraded = false,
  onBack,
  onSkip,
  onSubmit,
  submitting,
  error,
}: BundleStepProps) {
  const [degradedDismissed, setDegradedDismissed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addType, setAddType] = useState<BundleItem['type']>('http');
  const [addError, setAddError] = useState('');
  const addUrlRef = useRef<HTMLInputElement>(null);

  const enabledCount  = bundle.filter((b) => b.enabled).length;
  const pageCount     = bundle.filter((b) => b.enabled && b.path !== null).length;
  const hostname      = extractHostname(storeUrl);
  const reliability   = reliabilityLabel(platform);
  const checkBudget   = formatCheckBudget(bundle);
  const planLabel     = plan === 'free' ? 'Free' : plan.charAt(0).toUpperCase() + plan.slice(1);
  const allEnabled    = bundle.length > 0 && bundle.every((b) => b.enabled);

  function toggle(id: string) {
    onBundleChange(bundle.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  }

  function openAddForm() {
    setAddUrl('');
    setAddType('http');
    setAddError('');
    setShowAddForm(true);
    setTimeout(() => addUrlRef.current?.focus(), 0);
  }

  function cancelAddForm() {
    setShowAddForm(false);
    setAddUrl('');
    setAddError('');
  }

  function commitAddForm() {
    const raw = addUrl.trim();
    if (!raw) {
      setAddError('Enter a URL.');
      addUrlRef.current?.focus();
      return;
    }
    let normalized = raw;
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    try {
      new URL(normalized);
    } catch {
      setAddError('Not a valid URL.');
      addUrlRef.current?.focus();
      return;
    }
    let path: string | null = null;
    try {
      const p = new URL(normalized).pathname;
      path = p && p !== '/' ? p : null;
    } catch { /* keep null */ }
    const label = path ? path.replace(/^\//, '').replace(/\//g, ' / ') : new URL(normalized).hostname;
    const newItem: BundleItem = {
      id: `custom-${Date.now()}`,
      label,
      type: addType,
      path,
      url: normalized,
      intervalSeconds: 300,
      enabled: true,
      source: 'template',
    };
    onBundleChange([...bundle, newItem]);
    setShowAddForm(false);
    setAddUrl('');
    setAddError('');
  }

  return (
    <div className="space-y-6">
      {/* Editorial header */}
      <div className="space-y-3 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand-green-ink">
          Smart Setup
        </p>
        <h1 className="text-4xl font-semibold italic leading-tight text-brand-text">
          {loading ? 'Setting up your monitoring...' : 'Protect your own store too.'}
        </h1>
        {!loading && (
          <p className="mx-auto max-w-md text-sm text-brand-dim">
            We crawled{' '}
            <span className="font-medium text-brand-text">{hostname}</span>{' '}
            and built a starter bundle. Drop anything you don&apos;t want. You can always add more later.
          </p>
        )}
      </div>

      {/* Degradation notice */}
      {degraded && !loading && !degradedDismissed && (
        <div
          className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5"
          style={{ background: 'rgba(180,83,9,0.08)', boxShadow: 'inset 0 0 0 1px rgba(180,83,9,0.25)' }}
        >
          <p className="text-sm text-amber-600 dark:text-amber-400">
            AI analysis unavailable. Showing standard templates.
          </p>
          <button
            onClick={() => setDegradedDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 text-amber-500/60 transition-colors hover:text-amber-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats strip */}
      {!loading && (
        <div className="flex overflow-hidden rounded-lg border border-brand-line bg-brand-bg2">
          <StatCol
            label="Monitors prepared"
            value={String(enabledCount)}
            sub={`across ${pageCount} page type${pageCount !== 1 ? 's' : ''}`}
          />
          <StatCol
            label="Reliability target"
            value={reliability.value}
            sub={reliability.sub}
            border
          />
          <StatCol
            label="Check budget"
            value={checkBudget}
            sub={`well within ${planLabel}`}
            border
          />
          <StatCol
            label="Setup time"
            value="0 min"
            sub="all automatic"
            border
          />
        </div>
      )}

      {/* Monitor list */}
      <div className="overflow-hidden rounded-lg border border-brand-line">
        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-brand-bg2 px-4 py-3">
            <span className="text-sm font-medium text-brand-text">
              {enabledCount} monitor{enabledCount !== 1 ? 's' : ''} in your starter bundle
              {allEnabled && (
                <span className="text-brand-muted"> &middot; all enabled</span>
              )}
            </span>
            <button
              className="flex min-h-[44px] shrink-0 items-center gap-1 py-2 text-xs text-brand-muted transition-colors hover:text-brand-dim disabled:opacity-40"
              onClick={openAddForm}
              disabled={showAddForm}
            >
              <Plus className="h-3.5 w-3.5" />
              Add a page
            </button>
          </div>
        )}

        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow last />
          </>
        ) : (
          <>
            {bundle.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  'flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5',
                  i > 0 && 'border-t border-brand-line',
                  !item.enabled && 'opacity-40'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-ink">
                    {getItemIcon(item)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-text">{item.label}</p>
                    <p className="mt-0.5 truncate text-xs text-brand-muted">
                      <span className="font-mono">{displayPath(item)}</span>
                      {item.description && (
                        <span> &middot; {item.description}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                  {item.source === 'ai' && (
                    <span className="shrink-0 rounded-full bg-brand-green/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-green-ink">
                      AI
                    </span>
                  )}

                  <span
                    className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-brand-dim"
                    style={{ boxShadow: 'inset 0 0 0 1px var(--brand-line)' }}
                  >
                    {TYPE_LABEL[item.type]}
                  </span>

                  <span className="w-10 shrink-0 text-right font-mono text-xs text-brand-muted">
                    {formatInterval(item.intervalSeconds)}
                  </span>

                  <Toggle
                    enabled={item.enabled}
                    onToggle={() => toggle(item.id)}
                    label={item.enabled ? 'Disable monitor' : 'Enable monitor'}
                  />
                </div>
              </div>
            ))}

            {showAddForm && (
              <div className="border-t border-brand-line bg-brand-bg2 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={addUrlRef}
                    type="text"
                    value={addUrl}
                    onChange={(e) => { setAddUrl(e.target.value); setAddError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitAddForm();
                      if (e.key === 'Escape') cancelAddForm();
                    }}
                    placeholder="https://example.com/page"
                    className="min-w-0 flex-1 rounded-md border border-brand-line bg-brand-bg px-3 py-1.5 font-mono text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-green focus:outline-none"
                  />
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as BundleItem['type'])}
                    className="shrink-0 rounded-md border border-brand-line bg-brand-bg px-2 py-1.5 text-xs text-brand-dim focus:border-brand-green focus:outline-none"
                  >
                    <option value="http">Uptime check</option>
                    <option value="content">Change detection</option>
                    <option value="ssl">SSL certificate</option>
                    <option value="domain">Domain expiry</option>
                  </select>
                  <button
                    onClick={commitAddForm}
                    aria-label="Confirm add"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-green text-brand-green-fg transition-opacity hover:opacity-90"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={cancelAddForm}
                    aria-label="Cancel"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-muted transition-colors hover:text-brand-dim"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {addError && (
                  <p className="mt-1.5 text-xs text-red-500">{addError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}{' '}
            <button
              onClick={() => void onSubmit()}
              disabled={submitting}
              className="ml-1 font-medium underline"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-1.5 self-start text-brand-dim hover:text-brand-text"
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          Back to Competitors
        </Button>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            onClick={onSkip}
            className="py-1 text-center text-sm text-brand-muted transition-colors hover:text-brand-dim"
          >
            Skip &middot; I&apos;ll add manually
          </button>
          <Button
            onClick={() => void onSubmit()}
            disabled={loading || submitting}
            className="w-full justify-center gap-1.5 bg-brand-green text-brand-green-fg hover:bg-brand-green/90 disabled:opacity-50 sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Set it up
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

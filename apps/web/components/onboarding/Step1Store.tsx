'use client';

import { useState, useRef } from 'react';
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api-fetch';
import type { PlatformType } from '@/lib/onboarding-templates';

interface CheckResult {
  ok: boolean;
  responseMs: number | null;
  platform: PlatformType;
}

interface Step1StoreProps {
  storeUrl: string;
  onStoreUrlChange: (url: string) => void;
  platform: PlatformType | null;
  onPlatformChange: (p: PlatformType) => void;
  onContinue: () => Promise<void>;
  onSkip: () => void;
}

const PLATFORMS: { id: PlatformType; label: string; icon: string }[] = [
  { id: 'shopify',    label: 'Shopify',        icon: '🛍️' },
  { id: 'woocommerce', label: 'WooCommerce',   icon: '🛒' },
  { id: 'other',     label: 'Something else', icon: '🌐' },
];

export function Step1Store({
  storeUrl,
  onStoreUrlChange,
  platform,
  onPlatformChange,
  onContinue,
  onSkip,
}: Step1StoreProps) {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [continuing, setContinuing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function normalizeUrl(raw: string): string {
    const s = raw.trim();
    if (!s) return s;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    return `https://${s}`;
  }

  async function handleCheck() {
    const url = normalizeUrl(storeUrl);
    if (!url) return;
    onStoreUrlChange(url);
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await apiFetch('/api/onboarding/check-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as CheckResult;
      setCheckResult(data);
      onPlatformChange(data.platform);
    } catch {
      setCheckResult({ ok: false, responseMs: null, platform: 'other' });
      onPlatformChange('other');
    } finally {
      setChecking(false);
    }
  }

  async function handleContinue() {
    setContinuing(true);
    try {
      await onContinue();
    } finally {
      setContinuing(false);
    }
  }

  const canContinue = platform !== null && storeUrl.trim() !== '';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-brand-text">Your store</h2>
        <p className="text-sm text-brand-dim">
          Enter your store URL and we will ping it to confirm it is reachable.
        </p>
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            ref={inputRef}
            value={storeUrl}
            onChange={(e) => {
              onStoreUrlChange(e.target.value);
              setCheckResult(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCheck();
            }}
            placeholder="https://yourstore.com"
            className="pl-9 bg-brand-bg2 border-brand-line text-brand-text placeholder:text-brand-muted"
          />
        </div>
        <Button
          onClick={() => void handleCheck()}
          disabled={checking || !storeUrl.trim()}
          variant="outline"
          className="shrink-0 border-brand-line text-brand-dim hover:text-brand-text"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check it'}
        </Button>
      </div>

      {/* Status bar */}
      {checkResult && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
            checkResult.ok
              ? 'border-brand-green/30 bg-brand-green/5 text-brand-green-ink'
              : 'border-amber-300/40 bg-amber-50/10 text-amber-600'
          )}
        >
          {checkResult.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>
            {checkResult.ok
              ? `Reachable in ${checkResult.responseMs}ms`
              : 'Could not reach site'}
            {checkResult.platform !== 'other' && (
              <span className="ml-2 font-medium capitalize">
                {checkResult.platform === 'shopify' ? 'Shopify' : 'WooCommerce'} detected
              </span>
            )}
          </span>
        </div>
      )}

      {/* Platform cards */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">Platform</p>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPlatformChange(p.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-all',
                platform === p.id
                  ? 'border-brand-green bg-brand-green/5 text-brand-green-ink'
                  : 'border-brand-line bg-brand-bg2 text-brand-dim hover:border-brand-green/40 hover:bg-brand-bg3'
              )}
            >
              <span className="text-2xl">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onSkip}
          className="text-sm text-brand-muted hover:text-brand-dim transition-colors"
        >
          I don&apos;t have a store yet
        </button>
        <Button
          onClick={() => void handleContinue()}
          disabled={!canContinue || continuing}
          className="bg-brand-green text-brand-green-fg hover:bg-brand-green/90"
        >
          {continuing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Continue to Smart Setup
        </Button>
      </div>
    </div>
  );
}

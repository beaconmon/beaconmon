'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Loader2, CheckCircle, XCircle, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  onCheckSuccess?: (hostname: string) => void;
}

const PLATFORMS: { id: PlatformType; label: string; description: string }[] = [
  { id: 'shopify', label: 'Shopify', description: 'Most loved · auto-detects products' },
  { id: 'woocommerce', label: 'WooCommerce', description: 'Works with WordPress · detects pages' },
  { id: 'other', label: 'Something else', description: "We'll set up generic ecom monitors" },
];

function PlatformIcon({ id }: { id: PlatformType }) {
  if (id === 'shopify') {
    return <Image src="/shopify.svg" alt="Shopify" width={28} height={28} />;
  }
  if (id === 'woocommerce') {
    return <Image src="/woocommerce.svg" alt="WooCommerce" width={28} height={28} />;
  }
  return <Globe className="h-7 w-7 text-brand-muted" />;
}

export function Step1Store({
  storeUrl,
  onStoreUrlChange,
  platform,
  onPlatformChange,
  onContinue,
  onSkip,
  onCheckSuccess,
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
      if (data.ok && onCheckSuccess) {
        try {
          const hostname = new URL(url).hostname;
          onCheckSuccess(hostname);
        } catch {
          // ignore malformed URL
        }
      }
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

  const urlSuffix = storeUrl.replace(/^https?:\/\//, '');
  const canContinue = platform !== null && storeUrl.trim() !== '';
  const hostname = (() => {
    try { return new URL(storeUrl).hostname; } catch { return urlSuffix; }
  })();

  return (
    <div className="space-y-8">
      {/* Editorial head */}
      <div className="space-y-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-green-ink">
          Welcome to Beaconmon
        </p>
        <h1 className="text-5xl font-semibold leading-tight text-brand-text">
          Let&apos;s get your store on the radar.
        </h1>
        <p className="text-sm text-brand-dim">
          Paste your store URL and pick your platform. We&apos;ll do the rest.
        </p>
      </div>

      {/* URL input */}
      <div className="flex h-14 items-stretch overflow-hidden rounded-lg border border-brand-line bg-brand-bg2 transition-colors focus-within:border-brand-green/60">
        <div className="flex items-center gap-2.5 border-r border-brand-line px-4">
          <Globe className="h-4 w-4 shrink-0 text-brand-green-ink" />
          <span className="select-none font-mono text-xs text-brand-muted">https://</span>
        </div>
        <input
          ref={inputRef}
          value={urlSuffix}
          onChange={(e) => {
            const raw = e.target.value.replace(/^https?:\/\//, '');
            onStoreUrlChange(`https://${raw}`);
            setCheckResult(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleCheck();
          }}
          placeholder="yourstore.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none"
        />
        <button
          onClick={() => void handleCheck()}
          disabled={checking || !urlSuffix.trim()}
          className="my-2 mr-2 flex shrink-0 items-center gap-1.5 rounded-md bg-brand-green px-6 text-sm font-semibold text-brand-green-fg transition-opacity disabled:opacity-50"
        >
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Check it <span aria-hidden>→</span></>
          )}
        </button>
      </div>

      {/* Status bar */}
      {checkResult && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border px-5 py-3 text-sm',
            checkResult.ok
              ? 'border-brand-green/30 bg-brand-green/5'
              : 'border-amber-300/40 bg-amber-50/10 text-amber-600'
          )}
        >
          {checkResult.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-brand-green-ink" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {checkResult.ok ? (
            <span>
              <span className="font-semibold text-brand-text">{hostname}</span>
              <span className="text-brand-dim">
                {' '}responding in {checkResult.responseMs}ms
                {checkResult.platform !== 'other' && (
                  <> · {checkResult.platform === 'shopify' ? 'Shopify' : 'WooCommerce'} detected</>
                )}
              </span>
            </span>
          ) : (
            <span>Could not reach site</span>
          )}
        </div>
      )}

      {/* Platform cards */}
      <div className="space-y-3">
        <p className="text-sm text-brand-dim">
          Confirm your platform{' '}
          <span className="text-brand-muted">· we&apos;ll tailor what we monitor</span>
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPlatformChange(p.id)}
              className={cn(
                'relative flex flex-row items-center gap-3 rounded-lg border p-4 text-left transition-all sm:flex-col sm:items-start',
                platform === p.id
                  ? 'border-brand-green'
                  : 'border-brand-line bg-brand-bg2 hover:border-brand-green/40 hover:bg-brand-bg3'
              )}
              style={
                platform === p.id
                  ? {
                      background: 'rgba(0,229,122,0.05)',
                      boxShadow: '0 0 0 1px var(--brand-green), 0 0 20px rgba(0,229,122,0.12)',
                    }
                  : undefined
              }
            >
              {platform === p.id && (
                <span className="absolute right-3 top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green">
                  <Check className="h-3 w-3 text-brand-green-fg" />
                </span>
              )}
              <span className="shrink-0">
                <PlatformIcon id={p.id} />
              </span>
              <div className="min-w-0 flex-1 pr-6 sm:pr-0">
                <p className="truncate text-sm font-semibold text-brand-text">{p.label}</p>
                <p className="mt-0.5 text-xs text-brand-muted">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onSkip}
          className="py-1 text-center text-sm text-brand-muted transition-colors hover:text-brand-dim"
        >
          I don&apos;t have a store yet
        </button>
        <Button
          onClick={() => void handleContinue()}
          disabled={!canContinue || continuing}
          className="w-full justify-center bg-brand-green text-brand-green-fg hover:bg-brand-green/90 sm:w-auto"
        >
          {continuing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Competitors →
        </Button>
      </div>
    </div>
  );
}

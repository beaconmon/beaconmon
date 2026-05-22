'use client';

import { useState, useRef } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import type { PlanTier } from '@beaconmon/types';
import { PLAN_LIMITS } from '@beaconmon/types';
import { freemiusConfig } from '@/lib/freemius-client';

type FreemiusCheckoutHandler = {
  open: (opts: {
    name?: string;
    plan_id: number;
    billing_cycle?: 'monthly' | 'annual' | 'lifetime';
    user_email?: string;
    readonly_user?: boolean;
  }) => void;
};

type WindowWithFS = typeof window & {
  FS?: {
    Checkout: new (opts: { product_id: string; sandbox?: boolean }) => FreemiusCheckoutHandler;
  };
};

interface Step3CompetitorsProps {
  competitors: string[];
  onCompetitorsChange: (c: string[]) => void;
  plan: PlanTier;
  email: string | null;
  aiSuggestions?: string[];
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  error: string | null;
}

function normalizeDomain(input: string): string {
  let s = input.trim();
  s = s.replace(/^https?:\/\//, '');
  s = (s.split('/')[0] ?? s).toLowerCase();
  return s;
}

export function Step3Competitors({
  competitors,
  onCompetitorsChange,
  plan,
  email,
  aiSuggestions = [],
  onBack,
  onSkip: _onSkip,
  onSubmit,
  submitting,
  error,
}: Step3CompetitorsProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fsRef = useRef<FreemiusCheckoutHandler | null>(null);

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  const isFree = limit === 0;
  const atLimit = limit !== -1 && competitors.length >= limit;

  function handleAdd() {
    const domain = normalizeDomain(inputValue);
    if (!domain || competitors.includes(domain) || atLimit) return;
    onCompetitorsChange([...competitors, domain]);
    setInputValue('');
    inputRef.current?.focus();
  }

  function handleRemove(domain: string) {
    onCompetitorsChange(competitors.filter((c) => c !== domain));
  }

  function handleUpgrade() {
    const { productId, starterPlanId, sandbox } = freemiusConfig;
    const win = window as WindowWithFS;
    if (!productId || !starterPlanId || !win.FS) return;

    if (!fsRef.current) {
      fsRef.current = new win.FS.Checkout({ product_id: productId, ...(sandbox && { sandbox: true }) });
    }

    fsRef.current.open({
      name: 'Starter Monthly',
      plan_id: Number(starterPlanId),
      billing_cycle: 'monthly',
      ...(email && { user_email: email, readonly_user: true }),
    });
  }

  function handleAddChip(domain: string) {
    const normalized = normalizeDomain(domain);
    if (!normalized || competitors.includes(normalized) || atLimit) return;
    onCompetitorsChange([...competitors, normalized]);
  }

  function handleAddAllChips() {
    const toAdd = aiSuggestions
      .map(normalizeDomain)
      .filter((d) => d && !competitors.includes(d));
    if (toAdd.length === 0) return;
    const next = [...competitors];
    for (const d of toAdd) {
      if (limit === -1 || next.length < limit) {
        next.push(d);
      }
    }
    onCompetitorsChange(next);
  }

  const planLabel = plan === 'free' ? 'free' : plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-brand-text">Competitors</h2>
        <p className="text-sm text-brand-dim">
          Add competitor domains to watch for price, content, and availability changes.
        </p>
      </div>

      {isFree ? (
        <>
          <Script src="https://checkout.freemius.com/js/v1/" strategy="lazyOnload" />
          <div className="rounded-lg border border-amber-300/30 bg-amber-50/5 p-5 space-y-3">
            <p className="text-sm font-medium text-brand-text">
              Competitor tracking starts at Starter ($29/mo)
            </p>
            <p className="text-sm text-brand-dim">
              Monitor up to 5 competitor pages on the Starter plan and up to 25 on Growth.
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleUpgrade}
                className="bg-brand-green text-brand-green-fg hover:bg-brand-green/90"
              >
                Upgrade
              </Button>
              <button
                onClick={() => void onSubmit()}
                disabled={submitting}
                className="text-sm text-brand-muted hover:text-brand-dim transition-colors"
              >
                Finish setup without competitors
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* AI suggestion chips */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">AI suggestions</p>
                <button
                  onClick={handleAddAllChips}
                  disabled={atLimit}
                  className="text-xs text-brand-green-ink hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  + Add all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((domain) => {
                  const normalized = normalizeDomain(domain);
                  const added = competitors.includes(normalized);
                  return (
                    <button
                      key={domain}
                      onClick={() => handleAddChip(domain)}
                      disabled={added || atLimit}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        added
                          ? 'border-brand-green/40 bg-brand-green/10 text-brand-green-ink cursor-default'
                          : 'border-brand-line bg-brand-bg2 text-brand-dim hover:border-brand-green/40 hover:text-brand-text disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                    >
                      {!added && <span className="text-brand-green-ink">+</span>}
                      {normalized}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* URL input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="competitor.com"
              disabled={atLimit}
              className="bg-brand-bg2 border-brand-line text-brand-text placeholder:text-brand-muted"
            />
            <Button
              variant="outline"
              onClick={handleAdd}
              disabled={!inputValue.trim() || atLimit}
              className="shrink-0 border-brand-line text-brand-dim hover:text-brand-text"
            >
              Add to watchlist
            </Button>
          </div>

          {atLimit && (
            <p className="text-xs text-amber-500">
              You&apos;ve reached the {limit} competitor limit on the {planLabel} plan.
            </p>
          )}

          {/* Watchlist */}
          {competitors.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-brand-line">
              {competitors.map((domain, i) => (
                <div
                  key={domain}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i > 0 && 'border-t border-brand-line'
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-bg3 text-xs font-bold text-brand-text">
                    {domain[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-text">{domain}</p>
                    <p className="text-xs text-brand-muted">homepage only</p>
                  </div>
                  <button
                    onClick={() => handleRemove(domain)}
                    aria-label={`Remove ${domain}`}
                    className="text-brand-muted hover:text-brand-text transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Error */}
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
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brand-dim hover:text-brand-text"
        >
          Back to Smart Setup
        </Button>

        {!isFree && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => void onSubmit()}
              disabled={submitting}
              className="text-sm text-brand-muted hover:text-brand-dim transition-colors disabled:opacity-50"
            >
              Skip, I&apos;ll add later
            </button>
            <Button
              onClick={() => void onSubmit()}
              disabled={submitting}
              className="bg-brand-green text-brand-green-fg hover:bg-brand-green/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Take me to my dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Step footer */}
      {!isFree && (
        <p className="text-center text-xs text-brand-muted">
          Step 3 of 3. You can add up to{' '}
          {limit === -1 ? 'unlimited' : limit} competitor monitors on the {planLabel} plan.
        </p>
      )}
    </div>
  );
}

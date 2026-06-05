'use client';

import { useRef } from 'react';
import { Loader2, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Script from 'next/script';
import type { PlanTier } from '@beaconmon/types';
import { PLAN_LIMITS } from '@beaconmon/types';
import { freemiusConfig } from '@/lib/freemius-client';
import { CompetitorDomainInput } from '@/components/competitors/competitor-domain-input';

type FreemiusCheckoutHandler = {
  open: (opts: {
    name?: string;
    plan_id: number;
    billing_cycle?: 'monthly' | 'annual' | 'lifetime';
    user_email?: string;
    readonly_user?: boolean;
    user_dictionary?: Record<string, unknown>;
  }) => void;
};

type WindowWithFS = typeof window & {
  FS?: {
    Checkout: new (opts: { product_id: string; sandbox?: boolean }) => FreemiusCheckoutHandler;
  };
};

export interface CatalogPreviewResult {
  domain: string;
  productCount: number;
  recentChanges30d: number;
  error?: string;
}

interface Step3CompetitorsProps {
  competitors: string[];
  onCompetitorsChange: (c: string[]) => void;
  plan: PlanTier;
  teamId?: string;
  email: string | null;
  aiSuggestions?: string[];
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  error: string | null;
  submitted?: boolean;
  catalogPreviewLoading?: boolean;
  catalogPreview?: CatalogPreviewResult[] | null;
  onDone?: () => void;
}

function computeHoursPerWeek(totalRecentChanges30d: number): number {
  return Math.max(0.5, Math.round((totalRecentChanges30d / 30) * 7 * 0.05 * 2) / 2);
}

function formatHours(h: number): string {
  if (h < 1) return '30 minutes';
  if (h === 1) return '1 hour';
  return `${h} hours`;
}

export function Step3Competitors({
  competitors,
  onCompetitorsChange,
  plan,
  teamId,
  email,
  aiSuggestions = [],
  onBack,
  onSkip: _onSkip,
  onSubmit,
  submitting,
  error,
  submitted = false,
  catalogPreviewLoading = false,
  catalogPreview = null,
  onDone,
}: Step3CompetitorsProps) {
  const fsRef = useRef<FreemiusCheckoutHandler | null>(null);

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  const isFree = limit === 0;

  if (submitted) {
    const validResults = (catalogPreview ?? []).filter((r) => !r.error);
    const totalProducts = validResults.reduce((sum, r) => sum + r.productCount, 0);
    const totalChanges = validResults.reduce((sum, r) => sum + r.recentChanges30d, 0);
    const hoursPerWeek = computeHoursPerWeek(totalChanges);
    const showRoi = validResults.length > 0 && totalProducts > 0;

    return (
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15">
            <CheckCircle2 className="h-8 w-8 text-brand-green-ink" />
          </div>
          <h1 className="text-3xl font-semibold italic leading-tight text-brand-text">
            All set. Monitoring starts now.
          </h1>
          <p className="text-sm text-brand-dim">
            Your first checks run within the next 5 minutes.
          </p>
        </div>

        {catalogPreviewLoading && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-brand-line bg-brand-bg2 p-5">
            <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />
            <span className="text-sm text-brand-muted">Counting competitor products...</span>
          </div>
        )}

        {!catalogPreviewLoading && showRoi && (
          <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 p-5">
            <p className="text-sm font-medium text-brand-text">
              Tracking {validResults.length} competitor{validResults.length !== 1 ? 's' : ''} with{' '}
              {totalProducts.toLocaleString()} products. About {formatHours(hoursPerWeek)} of manual
              checking saved per week.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            onClick={onDone}
            className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
            style={{
              background: 'var(--brand-green, #00e57a)',
              boxShadow: '0 0 24px rgba(0,229,122,0.35)',
            }}
          >
            Go to dashboard
            <span className="ml-0.5">&rarr;</span>
          </button>
        </div>
      </div>
    );
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
      ...(teamId && { user_dictionary: { teamId } }),
    });
  }

  return (
    <div className="space-y-8">
      {/* Editorial head */}
      <div className="space-y-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-green-ink">
          Almost there
        </p>
        <h1 className="text-3xl font-semibold italic leading-tight text-brand-text">
          Who should we keep an eye on?
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-brand-dim">
          Add the brands you check every Monday morning. We&apos;ll watch their pricing, hero copy,
          and promo banners so you don&apos;t have to.
        </p>
      </div>

      {isFree ? (
        <>
          <Script src="https://checkout.freemius.com/js/v1/" strategy="lazyOnload" />
          <div className="space-y-3 rounded-lg border border-amber-300/50 bg-amber-50/40 p-5 dark:border-amber-300/30 dark:bg-amber-50/5">
            <p className="text-sm font-medium text-brand-text">
              Competitor tracking starts at Starter ($29/mo)
            </p>
            <p className="text-sm text-brand-dim">
              Monitor up to 5 competitor pages on the Starter plan and up to 25 on Growth.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpgrade}
                className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-brand-green-fg transition-opacity hover:opacity-90"
              >
                Upgrade
              </button>
              <button
                onClick={() => void onSubmit()}
                disabled={submitting}
                className="text-sm text-brand-muted transition-colors hover:text-brand-dim"
              >
                Finish setup without competitors
              </button>
            </div>
          </div>
        </>
      ) : (
        <CompetitorDomainInput
          value={competitors}
          onChange={onCompetitorsChange}
          plan={plan}
          aiSuggestions={aiSuggestions}
        />
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
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-brand-dim transition-colors hover:text-brand-text"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Smart Setup
        </button>

        {!isFree && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => void onSubmit()}
              disabled={submitting}
              className="text-sm text-brand-muted transition-colors hover:text-brand-dim disabled:opacity-50"
            >
              Skip &middot; I&apos;ll add later
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => void onSubmit()}
                disabled={submitting}
                className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'var(--brand-green, #00e57a)',
                  boxShadow: '0 0 24px rgba(0,229,122,0.35)',
                }}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Take me to my dashboard
                <span className="ml-0.5">&rarr;</span>
              </button>
              {competitors.length > 0 && (
                <p className="text-[11px] text-brand-muted">
                  Syncing catalog now, products appear within 30s.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

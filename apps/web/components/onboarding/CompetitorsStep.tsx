'use client';

import { useRef } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
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

interface CompetitorsStepProps {
  competitors: string[];
  onCompetitorsChange: (c: string[]) => void;
  plan: PlanTier;
  teamId?: string;
  email: string | null;
  aiSuggestions?: string[];
  onBack: () => void;
  onContinue: () => Promise<void>;
  continuing: boolean;
}

export function CompetitorsStep({
  competitors,
  onCompetitorsChange,
  plan,
  teamId,
  email,
  aiSuggestions = [],
  onBack,
  onContinue,
  continuing,
}: CompetitorsStepProps) {
  const fsRef = useRef<FreemiusCheckoutHandler | null>(null);

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  const isFree = !(limit > 0 || limit === -1);

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
      <div className="space-y-3 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-green-ink">
          Almost there
        </p>
        <h1 className="text-3xl font-semibold italic leading-tight text-brand-text">
          Tell us who you compete with.
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
                onClick={() => void onContinue()}
                disabled={continuing}
                className="text-sm text-brand-muted transition-colors hover:text-brand-dim disabled:opacity-50"
              >
                Continue without competitors
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

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-brand-dim transition-colors hover:text-brand-text"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to your store
        </button>

        {!isFree && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => void onContinue()}
              disabled={continuing}
              className="text-sm text-brand-muted transition-colors hover:text-brand-dim disabled:opacity-50"
            >
              Skip &middot; I&apos;ll add later
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => void onContinue()}
                disabled={continuing}
                className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'var(--brand-green, #00e57a)',
                  boxShadow: '0 0 24px rgba(0,229,122,0.35)',
                }}
              >
                {continuing && <Loader2 className="h-4 w-4 animate-spin" />}
                Next: Protect your store
                <span className="ml-0.5">&rarr;</span>
              </button>
              {competitors.length > 0 && (
                <p className="text-[11px] text-brand-muted">
                  Monitoring starts after final setup.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

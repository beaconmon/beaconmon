'use client';

import { PLAN_LIMITS } from '@beaconmon/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/hooks/use-session';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import { useStatusPages } from '@/lib/hooks/use-status-pages';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { analytics } from '@/lib/analytics';

type FreemiusCheckoutHandler = {
  open: (opts: {
    name?: string;
    plan_id: number;
    billing_cycle?: 'monthly' | 'annual' | 'lifetime';
    user_email?: string;
    readonly_user?: boolean;
    success?: (response: unknown) => void;
  }) => void;
  close?: () => void;
};

declare global {
  interface Window {
    FS?: {
      Checkout: new (opts: {
        product_id: string;
        public_key?: string;
        sandbox?: boolean;
      }) => FreemiusCheckoutHandler;
    };
  }
}

const PLAN_DISPLAY: Record<string, { label: string; color: string }> = {
  free:    { label: 'Free',    color: 'bg-brand-bg3 text-brand-dim border-brand-line' },
  starter: { label: 'Starter', color: 'bg-sky-950/60 text-sky-300 border-sky-800/50' },
  growth:  { label: 'Growth',  color: 'bg-blue-950/60 text-blue-300 border-blue-800/50' },
  scale:   { label: 'Scale',   color: 'bg-purple-950/60 text-purple-300 border-purple-800/50' },
};

const ANNUAL_PRICES: Record<string, { amount: string; monthly: string }> = {
  starter: { amount: '$276/yr', monthly: '$23/mo' },
  growth:  { amount: '$756/yr', monthly: '$63/mo' },
  scale:   { amount: '$1,908/yr', monthly: '$159/mo' },
};

const MONTHLY_PRICES: Record<string, string> = {
  starter: '$29/mo',
  growth:  '$79/mo',
  scale:   '$199/mo',
};

function BillingPeriodToggle({
  selectedPeriod,
  onPeriodChange,
}: {
  selectedPeriod: 'monthly' | 'annual';
  onPeriodChange: (period: 'monthly' | 'annual') => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-brand-line p-1 w-fit">
      <button
        onClick={() => onPeriodChange('monthly')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedPeriod === 'monthly' ? 'bg-brand-bg3 text-brand-text font-medium' : 'text-brand-muted hover:text-brand-dim'}`}
      >
        Monthly
      </button>
      <button
        onClick={() => onPeriodChange('annual')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${selectedPeriod === 'annual' ? 'bg-brand-bg3 text-brand-text font-medium' : 'text-brand-muted hover:text-brand-dim'}`}
      >
        Annual
        <span className="text-[10px] font-semibold text-brand-green-ink bg-brand-green/10 px-1.5 py-0.5 rounded">−20%</span>
      </button>
    </div>
  );
}

function UsageStat({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = !unlimited && pct >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={nearLimit ? 'text-amber-600 font-medium' : 'text-foreground'}>
          {unlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const sessionQ = useSession();
  const monitorsQ = useMonitors();
  const channelsQ = useAlertChannels();
  const statusPagesQ = useStatusPages();
  const handlerRef = useRef<FreemiusCheckoutHandler | null>(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const [hasFreemiusCustomer, setHasFreemiusCustomer] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [fsReady, setFsReady] = useState(false);

  useEffect(() => {
    if (!sessionQ.data?.teamId) return;
    fetch('/api/billing/subscription')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load subscription'))))
      .then((data: { currentPeriodEnd?: string; trialEndsAt?: string; hasFreemiusCustomer?: boolean; billingPeriod?: 'monthly' | 'annual' } | null) => {
        if (!data) return;
        setSubscriptionError(false);
        if (data.currentPeriodEnd) {
          setRenewalDate(`Renews on ${format(new Date(data.currentPeriodEnd), 'MMM d, yyyy')}`);
        } else if (data.trialEndsAt) {
          setRenewalDate(`Trial ends on ${format(new Date(data.trialEndsAt), 'MMM d, yyyy')}`);
        }
        setHasFreemiusCustomer(Boolean(data.hasFreemiusCustomer));
        setSelectedPeriod(data.billingPeriod ?? 'monthly');
      })
      .catch(() => {
        setSubscriptionError(true);
      });
  }, [sessionQ.data?.teamId]);

  useEffect(() => {
    return () => {
      handlerRef.current?.close?.();
    };
  }, []);

  function ensureHandler(): FreemiusCheckoutHandler | null {
    if (handlerRef.current) return handlerRef.current;
    const productId = process.env['NEXT_PUBLIC_FREEMIUS_PRODUCT_ID'];
    if (!productId || !window.FS) return null;
    const sandbox = process.env['NEXT_PUBLIC_FREEMIUS_SANDBOX'] === 'true';
    handlerRef.current = new window.FS.Checkout({ product_id: productId, ...(sandbox && { sandbox: true }) });
    return handlerRef.current;
  }

  function handleUpgrade(plan: 'starter' | 'growth' | 'scale') {
    const email = sessionQ.data?.email;
    const handler = ensureHandler();
    if (!email || !handler) {
      alert('Checkout is still loading. Please try again in a moment.');
      return;
    }

    const planIdMap: Record<string, string | undefined> = {
      starter: process.env['NEXT_PUBLIC_FREEMIUS_STARTER_PLAN_ID'],
      growth:  process.env['NEXT_PUBLIC_FREEMIUS_GROWTH_PLAN_ID'],
      scale:   process.env['NEXT_PUBLIC_FREEMIUS_SCALE_PLAN_ID'],
    };
    const planId = planIdMap[plan];

    if (!planId) {
      alert('Checkout configuration is missing. Please contact support.');
      return;
    }

    const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
    analytics.checkoutOpened({ plan, billing_period: selectedPeriod });
    handler.open({
      name: `${planLabel} ${selectedPeriod === 'annual' ? 'Annual' : 'Monthly'}`,
      plan_id: Number(planId),
      billing_cycle: selectedPeriod === 'annual' ? 'annual' : 'monthly',
      user_email: email,
      readonly_user: true,
    });
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      if (!res.ok) {
        alert('Unable to open subscription management. Please try again.');
        return;
      }
      const { url } = await res.json() as { url: string };
      window.open(url, '_blank');
    } catch {
      alert('Unable to open subscription management. Please try again.');
    }
  }

  if (sessionQ.isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const plan = sessionQ.data?.plan ?? 'free';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['free'];
  const planDisplay = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY['free']!;

  const monitorCount = monitorsQ.data?.length ?? 0;
  const channelCount = channelsQ.data?.length ?? 0;
  const statusPageCount = statusPagesQ.data?.length ?? 0;

  return (
    <>
      <Script src="https://checkout.freemius.com/js/v1/" strategy="lazyOnload" onLoad={() => setFsReady(true)} />

      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-3">
              Current plan
              <Badge variant="outline" className={planDisplay.color}>
                {planDisplay.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionError && (
              <p className="text-sm text-red-500">Failed to load subscription details. Please refresh the page.</p>
            )}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Check interval: every {limits.checkIntervalSeconds}s minimum</p>
              <p>History retention: {limits.historyDays} days</p>
              {renewalDate && <p>{renewalDate}</p>}
            </div>

            <BillingPeriodToggle selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

            {plan === 'scale' && hasFreemiusCustomer ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To change your billing interval or payment method, open your Freemius portal.
                </p>
                <Button variant="outline" onClick={handleManageSubscription}>
                  Manage subscription
                </Button>
              </div>
            ) : plan === 'growth' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Scale for unlimited monitors, 30-second checks, and 365-day history.
                  {selectedPeriod === 'annual' && ` ${ANNUAL_PRICES['scale']?.amount} (${ANNUAL_PRICES['scale']?.monthly})`}
                  {selectedPeriod === 'monthly' && ` ${MONTHLY_PRICES['scale']}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button disabled={!fsReady} onClick={() => handleUpgrade('scale')}>
                    Upgrade to Scale — {selectedPeriod === 'annual' ? ANNUAL_PRICES['scale']?.amount : MONTHLY_PRICES['scale']}
                  </Button>
                  {hasFreemiusCustomer && (
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Manage subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : plan === 'starter' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Growth for 100 monitors, 1-minute checks, and 90-day history.
                  {selectedPeriod === 'annual' && ` ${ANNUAL_PRICES['growth']?.amount} (${ANNUAL_PRICES['growth']?.monthly})`}
                  {selectedPeriod === 'monthly' && ` ${MONTHLY_PRICES['growth']}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button disabled={!fsReady} onClick={() => handleUpgrade('growth')}>
                    Upgrade to Growth — {selectedPeriod === 'annual' ? ANNUAL_PRICES['growth']?.amount : MONTHLY_PRICES['growth']}
                  </Button>
                  <Button variant="outline" disabled={!fsReady} onClick={() => handleUpgrade('scale')}>
                    Scale — {selectedPeriod === 'annual' ? ANNUAL_PRICES['scale']?.amount : MONTHLY_PRICES['scale']}
                  </Button>
                  {hasFreemiusCustomer && (
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Manage subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Starter for 25 monitors, 1-minute checks, and 30-day history.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button disabled={!fsReady} onClick={() => handleUpgrade('starter')}>
                    Upgrade to Starter — {selectedPeriod === 'annual' ? ANNUAL_PRICES['starter']?.amount : MONTHLY_PRICES['starter']}
                  </Button>
                  <Button variant="outline" disabled={!fsReady} onClick={() => handleUpgrade('growth')}>
                    Growth — {selectedPeriod === 'annual' ? ANNUAL_PRICES['growth']?.amount : MONTHLY_PRICES['growth']}
                  </Button>
                  <Button variant="outline" disabled={!fsReady} onClick={() => handleUpgrade('scale')}>
                    Scale — {selectedPeriod === 'annual' ? ANNUAL_PRICES['scale']?.amount : MONTHLY_PRICES['scale']}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageStat label="Monitors" used={monitorCount} limit={limits.monitors} />
            <UsageStat label="Alert channels" used={channelCount} limit={limits.alertChannels} />
            <UsageStat label="Status pages" used={statusPageCount} limit={limits.statusPages} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

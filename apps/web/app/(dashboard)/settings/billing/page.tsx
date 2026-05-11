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

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: { items: { priceId: string }[]; customData: Record<string, string> }) => void;
      };
    };
  }
}

const PLAN_DISPLAY: Record<string, { label: string; color: string }> = {
  free:     { label: 'Free',     color: 'bg-brand-bg3 text-brand-dim border-brand-line' },
  pro:      { label: 'Pro',      color: 'bg-blue-950/60 text-blue-300 border-blue-800/50' },
  business: { label: 'Business', color: 'bg-purple-950/60 text-purple-300 border-purple-800/50' },
};

const ANNUAL_PRICES: Record<string, { amount: string; monthly: string }> = {
  pro:      { amount: '$180/yr', monthly: '$15/mo' },
  business: { amount: '$564/yr', monthly: '$47/mo' },
};

const MONTHLY_PRICES: Record<string, string> = {
  pro:      '$19/mo',
  business: '$59/mo',
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
        <span className="text-[10px] font-semibold text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded">−20%</span>
      </button>
    </div>
  );
}

function SwitchConfirmDialog({
  planKey,
  selectedPeriod,
  switchError,
  switching,
  onConfirm,
  onCancel,
}: {
  planKey: 'pro' | 'business';
  selectedPeriod: 'monthly' | 'annual';
  switchError: string | null;
  switching: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-bg2 p-4 space-y-3">
      <p className="text-sm text-brand-dim">
        {selectedPeriod === 'annual'
          ? `Switch to annual billing? You'll be charged ${ANNUAL_PRICES[planKey]?.amount} today, prorated for the remainder of your current period.`
          : `Switch to monthly billing? Changes take effect at the start of your next billing period.`}
      </p>
      {switchError && (
        <p className="text-sm text-red-500">{switchError}</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={onConfirm} disabled={switching}>
          {switching ? 'Switching…' : 'Confirm'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
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
  const paddleReady = useRef(false);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const [hasPaddleCustomer, setHasPaddleCustomer] = useState(false);
  const [currentBillingPeriod, setCurrentBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionQ.data?.teamId) return;
    fetch('/api/billing/subscription')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load subscription'))))
      .then((data: { currentPeriodEnd?: string; trialEndsAt?: string; hasPaddleCustomer?: boolean; billingPeriod?: 'monthly' | 'annual' }) => {
        setSubscriptionError(false);
        if (data.currentPeriodEnd) {
          setRenewalDate(`Renews on ${format(new Date(data.currentPeriodEnd), 'MMM d, yyyy')}`);
        } else if (data.trialEndsAt) {
          setRenewalDate(`Trial ends on ${format(new Date(data.trialEndsAt), 'MMM d, yyyy')}`);
        }
        setHasPaddleCustomer(Boolean(data.hasPaddleCustomer));
        const period = data.billingPeriod ?? 'monthly';
        setCurrentBillingPeriod(period);
        setSelectedPeriod(period);
      })
      .catch(() => {
        setSubscriptionError(true);
      });
  }, [sessionQ.data?.teamId]);

  function handleUpgrade(plan: 'pro' | 'business') {
    const teamId = sessionQ.data?.teamId;
    if (!teamId || !window.Paddle) return;

    const priceId = selectedPeriod === 'annual'
      ? (plan === 'pro'
          ? process.env['NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID']
          : process.env['NEXT_PUBLIC_PADDLE_BUSINESS_ANNUAL_PRICE_ID'])
      : (plan === 'pro'
          ? process.env['NEXT_PUBLIC_PADDLE_PRO_PRICE_ID']
          : process.env['NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID']);

    if (!priceId) return;

    analytics.checkoutOpened({ plan, billing_period: selectedPeriod });
    window.Paddle.Checkout.open({
      items: [{ priceId }],
      customData: { teamId },
    });
  }

  async function handleSwitchInterval() {
    setSwitching(true);
    setSwitchError(null);
    try {
      const res = await fetch('/api/billing/switch-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setSwitchError(data.error ?? 'Failed to switch billing interval. Please try again.');
        return;
      }
      analytics.billingIntervalSwitched({ plan, from: currentBillingPeriod, to: selectedPeriod });
      setCurrentBillingPeriod(selectedPeriod);
      setConfirmSwitch(false);
    } catch {
      setSwitchError('Network error. Please try again.');
    } finally {
      setSwitching(false);
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

  const isPaid = plan === 'pro' || plan === 'business';
  const periodChanged = isPaid && hasPaddleCustomer && selectedPeriod !== currentBillingPeriod;

  const handlePeriodChange = (period: 'monthly' | 'annual') => {
    setSelectedPeriod(period);
    setConfirmSwitch(false);
    setSwitchError(null);
  };


  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={() => {
          if (window.Paddle && !paddleReady.current) {
            const token = process.env['NEXT_PUBLIC_PADDLE_CLIENT_TOKEN'];
            if (token) {
              window.Paddle.Initialize({ token });
              paddleReady.current = true;
            }
          }
        }}
      />

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

            <BillingPeriodToggle selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

            {plan === 'business' && hasPaddleCustomer ? (
              <div className="space-y-3">
                {periodChanged && !confirmSwitch && (
                  <Button variant="outline" size="sm" onClick={() => setConfirmSwitch(true)}>
                    Switch to {selectedPeriod} billing
                  </Button>
                )}
                {confirmSwitch && <SwitchConfirmDialog planKey="business" selectedPeriod={selectedPeriod} switchError={switchError} switching={switching} onConfirm={handleSwitchInterval} onCancel={() => { setConfirmSwitch(false); setSelectedPeriod(currentBillingPeriod); setSwitchError(null); }} />}
                {!periodChanged && (
                  <form action="/api/billing/portal" method="POST">
                    <Button variant="outline" type="submit">
                      Manage subscription
                    </Button>
                  </form>
                )}
              </div>
            ) : plan === 'pro' ? (
              <div className="space-y-3">
                {periodChanged && !confirmSwitch && (
                  <Button variant="outline" size="sm" onClick={() => setConfirmSwitch(true)}>
                    Switch to {selectedPeriod} billing
                  </Button>
                )}
                {confirmSwitch && <SwitchConfirmDialog planKey="pro" selectedPeriod={selectedPeriod} switchError={switchError} switching={switching} onConfirm={handleSwitchInterval} onCancel={() => { setConfirmSwitch(false); setSelectedPeriod(currentBillingPeriod); setSwitchError(null); }} />}
                <p className="text-sm text-muted-foreground">
                  Upgrade to Business for unlimited monitors, 30-second checks, and 365-day history.
                  {selectedPeriod === 'annual' && ` ${ANNUAL_PRICES['business']?.amount} (${ANNUAL_PRICES['business']?.monthly})`}
                  {selectedPeriod === 'monthly' && ` ${MONTHLY_PRICES['business']}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpgrade('business')}>
                    Upgrade to Business — {selectedPeriod === 'annual' ? ANNUAL_PRICES['business']?.amount : MONTHLY_PRICES['business']}
                  </Button>
                  {hasPaddleCustomer && !periodChanged && (
                    <form action="/api/billing/portal" method="POST">
                      <Button variant="outline" type="submit">
                        Manage subscription
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for 25 monitors, 1-minute checks, and 90-day history.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpgrade('pro')}>
                    Upgrade to Pro — {selectedPeriod === 'annual' ? `${ANNUAL_PRICES['pro']?.amount}` : MONTHLY_PRICES['pro']}
                  </Button>
                  <Button variant="outline" onClick={() => handleUpgrade('business')}>
                    Business — {selectedPeriod === 'annual' ? `${ANNUAL_PRICES['business']?.amount}` : MONTHLY_PRICES['business']}
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

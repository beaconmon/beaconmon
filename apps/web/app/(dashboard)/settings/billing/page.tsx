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

  // Fetch subscription data for renewal date
  useEffect(() => {
    if (!sessionQ.data?.teamId) return;
    fetch('/api/billing/subscription')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { currentPeriodEnd?: string; trialEndsAt?: string } | null) => {
        if (data?.currentPeriodEnd) {
          setRenewalDate(`Renews on ${format(new Date(data.currentPeriodEnd), 'MMM d, yyyy')}`);
        } else if (data?.trialEndsAt) {
          setRenewalDate(`Trial ends on ${format(new Date(data.trialEndsAt), 'MMM d, yyyy')}`);
        }
      })
      .catch(() => null);
  }, [sessionQ.data?.teamId]);

  function handleUpgrade(priceId: string) {
    const teamId = sessionQ.data?.teamId;
    if (!priceId || !teamId || !window.Paddle) return;

    window.Paddle.Checkout.open({
      items: [{ priceId }],
      customData: { teamId },
    });
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

  const proPriceId = process.env['NEXT_PUBLIC_PADDLE_PRO_PRICE_ID'] ?? '';
  const businessPriceId = process.env['NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID'] ?? '';
  const isPaid = plan === 'pro' || plan === 'business';

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
        <h1 className="text-2xl font-semibold text-brand-text">Billing</h1>

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
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Check interval: every {limits.checkIntervalSeconds}s minimum</p>
              <p>History retention: {limits.historyDays} days</p>
              {renewalDate && <p>{renewalDate}</p>}
            </div>

            {plan === 'business' ? (
              <form action="/api/billing/portal" method="POST">
                <Button variant="outline" type="submit">
                  Manage subscription
                </Button>
              </form>
            ) : plan === 'pro' ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Business for unlimited monitors, 30-second checks, and 365-day history.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpgrade(businessPriceId)}>
                    Upgrade to Business — $49/mo
                  </Button>
                  <form action="/api/billing/portal" method="POST">
                    <Button variant="outline" type="submit">
                      Manage subscription
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for 25 monitors, 1-minute checks, and 90-day history.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleUpgrade(proPriceId)}>Upgrade to Pro — $15/mo</Button>
                  <Button variant="outline" onClick={() => handleUpgrade(businessPriceId)}>
                    Business — $49/mo
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

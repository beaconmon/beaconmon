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

const PLAN_DISPLAY: Record<string, { label: string; color: string }> = {
  free:     { label: 'Free',     color: 'bg-gray-100 text-gray-700 border-gray-200' },
  pro:      { label: 'Pro',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  business: { label: 'Business', color: 'bg-purple-100 text-purple-700 border-purple-200' },
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

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Billing</h1>

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
          </div>

          {isPaid ? (
            <form action="/api/billing/portal" method="POST">
              <Button variant="outline" type="submit">
                Manage subscription
              </Button>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for 25 monitors, 1-minute checks, and 90-day history.
              </p>
              <Button asChild>
                <a href="/api/billing/checkout?plan=pro">Upgrade to Pro — $15/mo</a>
              </Button>
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
  );
}

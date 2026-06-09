import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  EBtn,
  BtnRow,
  EmailFooter,
  DetailBox,
} from '@beaconmon/emails';

export interface LimitHitProps {
  limitType: 'competitor' | 'monitor';
  currentCount: number;
  planLimit: number;
  planTier: string;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function LimitHit({
  limitType,
  currentCount,
  planLimit,
  planTier,
  appUrl,
  unsubscribeUrl,
}: LimitHitProps) {
  const label = limitType === 'competitor' ? 'competitor' : 'monitor';
  const plural = `${label}s`;
  const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1);
  const limitLabel = planLimit === 1 ? label : plural;
  const isGrowth = planTier.toLowerCase() === 'growth';
  const upgradeTarget = isGrowth ? 'Scale' : 'Growth';
  const preview = `You've reached your ${label} limit. Upgrade to ${upgradeTarget} to add more.`;

  const growthRows = [
    { k: 'Growth plan', v: '100 uptime monitors, 1-min intervals', mono: false },
    { k: 'Competitors', v: '25 competitor monitors', mono: false },
    { k: 'Locations', v: '5 monitoring locations', mono: false },
    { k: 'History', v: '90 days', mono: false },
  ];
  const scaleRows = [
    { k: 'Scale plan', v: 'Unlimited competitor monitors', mono: false },
    { k: 'Uptime', v: 'Unlimited uptime monitors', mono: false },
    { k: 'History', v: '1 year', mono: false },
    { k: 'Support', v: 'Priority support', mono: false },
  ];

  return (
    <EmailLayout preview={preview} context="Account">
      <AlertBanner sev="warning" label={`${label.charAt(0).toUpperCase() + label.slice(1)} limit reached`} />

      <H1>You&apos;ve reached your {label} limit</H1>

      <Para>
        You tried to add a {label}, but your {planName} plan allows a maximum of {planLimit}{' '}
        {limitLabel}. You already have {currentCount}.
      </Para>

      {isGrowth ? (
        <Para>
          Upgrade to Scale for unlimited competitor and uptime monitoring, 5-minute check
          intervals, and 1-year history.
        </Para>
      ) : (
        <Para>
          Upgrade to Growth to monitor up to 25 competitors and 100 websites, or to Scale for
          unlimited monitoring.
        </Para>
      )}

      <BtnRow>
        <EBtn href={`${appUrl}/settings/billing`} variant="primary">
          Upgrade to {upgradeTarget}
        </EBtn>
      </BtnRow>

      <DetailBox rows={isGrowth ? scaleRows : growthRows} />

      <EmailFooter
        reason="You received this because you have a Beaconmon account."
        manageLabel="Manage billing"
        manageUrl={`${appUrl}/settings/billing`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

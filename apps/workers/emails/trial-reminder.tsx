import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  Strong,
  StatStrip,
  DetailBox,
  EBtn,
  BtnRow,
  EmailFooter,
} from '@beaconmon/emails';

export interface TrialReminderProps {
  daysLeft: number;
  appUrl: string;
  unsubscribeUrl?: string;
  // Optional proof stats — when provided, render the 3-up stat strip.
  competitorEventCount?: number;
  incidentCount?: number;
}

export function TrialReminder({
  daysLeft,
  appUrl,
  unsubscribeUrl,
  competitorEventCount,
  incidentCount,
}: TrialReminderProps) {
  const isLastDay = daysLeft <= 1;
  const trialDays = 14;
  const elapsedDays = Math.min(trialDays, Math.max(1, trialDays - daysLeft));

  const hasProofStats =
    competitorEventCount !== undefined &&
    incidentCount !== undefined &&
    (competitorEventCount > 0 || incidentCount > 0);

  const preview = isLastDay
    ? 'Your Beaconmon trial ends tomorrow — upgrade to keep your monitors running.'
    : hasProofStats
    ? `${daysLeft} days left — Beaconmon caught ${competitorEventCount ?? 0} change${(competitorEventCount ?? 0) === 1 ? '' : 's'} during your trial.`
    : `${daysLeft} days left in your Beaconmon trial.`;

  const bannerLabel = isLastDay
    ? 'Your trial ends tomorrow'
    : `${daysLeft} days left in your trial`;

  return (
    <EmailLayout preview={preview} context="Account">
      <AlertBanner sev="warning" label={bannerLabel} />

      <H1>
        {hasProofStats
          ? "Here's what Beaconmon caught during your trial"
          : isLastDay
          ? 'Your trial ends tomorrow'
          : `${daysLeft} days left in your trial`}
      </H1>

      <Para>
        {hasProofStats ? (
          <>
            In {elapsedDays} days we surfaced{' '}
            <Strong>
              {competitorEventCount} competitor change{competitorEventCount === 1 ? '' : 's'}
            </Strong>
            {(incidentCount ?? 0) > 0 && (
              <>
                {' and caught '}
                <Strong>
                  {incidentCount} downtime incident{incidentCount === 1 ? '' : 's'}
                </Strong>
              </>
            )}
            . That coverage pauses when your trial ends
            {isLastDay ? ' tomorrow' : ` in ${daysLeft} days`}.
          </>
        ) : (
          <>
            Your 14-day Beaconmon trial {isLastDay ? 'ends tomorrow' : `expires in ${daysLeft} days`}.
            After it ends, your monitors will be paused and you will stop receiving alerts.
          </>
        )}
      </Para>

      {hasProofStats && (
        <StatStrip
          stats={[
            {
              n: String(competitorEventCount),
              label: `competitor change${competitorEventCount === 1 ? '' : 's'}`,
            },
            {
              n: String(incidentCount),
              label: `incident${incidentCount === 1 ? '' : 's'} caught`,
            },
            { n: '100%', label: 'uptime tracked' },
          ]}
        />
      )}

      <BtnRow>
        <EBtn href={`${appUrl}/settings/billing`} variant="primary">
          {hasProofStats ? 'Upgrade to keep watching' : 'Upgrade now'}
        </EBtn>
      </BtnRow>

      <DetailBox
        rows={[
          { k: 'Starter', v: '$23/mo · 25 monitors', mono: false },
          { k: 'Growth', v: '$59/mo · 100 monitors, 5 locations', mono: false },
          { k: 'Scale', v: 'Unlimited · 30-sec checks, 1-yr history', mono: false },
        ]}
      />

      <EmailFooter
        reason="You receive this because you started a 14-day Beaconmon trial."
        manageLabel="Billing"
        manageUrl={`${appUrl}/settings/billing`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

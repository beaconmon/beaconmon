import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  Strong,
  StatStrip,
  EBtn,
  BtnRow,
  EmailFooter,
  DetailBox,
} from '@beaconmon/emails';

export interface Day12UrgencyProps {
  competitorEventCount: number;
  incidentCount: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

function buildDetectionSummary(competitorEventCount: number, incidentCount: number): string {
  const parts: string[] = [];
  if (competitorEventCount > 0) {
    parts.push(
      `${competitorEventCount} competitor change${competitorEventCount !== 1 ? 's' : ''}`
    );
  }
  if (incidentCount > 0) {
    parts.push(`${incidentCount} downtime incident${incidentCount !== 1 ? 's' : ''}`);
  }
  return parts.join(' and ');
}

export function Day12Urgency({
  competitorEventCount,
  incidentCount,
  appUrl,
  unsubscribeUrl,
}: Day12UrgencyProps) {
  const totalDetections = competitorEventCount + incidentCount;
  const hasDetections = totalDetections > 0;
  const detectionSummary = buildDetectionSummary(competitorEventCount, incidentCount);

  const preview = hasDetections
    ? `Your trial ends in 2 days — Beaconmon detected ${totalDetections} event${totalDetections !== 1 ? 's' : ''} during your trial.`
    : 'Your trial ends in 2 days — see what Growth keeps watching for you.';

  return (
    <EmailLayout preview={preview} context="Account">
      <AlertBanner sev="warning" label="2 days left in your trial" />

      <H1>
        {hasDetections ? "Here's what we found for you" : 'Your trial ends in 2 days'}
      </H1>

      {hasDetections ? (
        <>
          <Para>
            In your first 12 days, Beaconmon detected <Strong>{detectionSummary}</Strong>. That
            intelligence pauses when your trial ends.
          </Para>

          <StatStrip
            stats={[
              ...(competitorEventCount > 0
                ? [
                    {
                      n: String(competitorEventCount),
                      label: `competitor change${competitorEventCount !== 1 ? 's' : ''}`,
                    },
                  ]
                : []),
              ...(incidentCount > 0
                ? [
                    {
                      n: String(incidentCount),
                      label: `downtime incident${incidentCount !== 1 ? 's' : ''}`,
                    },
                  ]
                : []),
              { n: '100%', label: 'uptime tracked' },
            ]}
          />

          <Para>
            Upgrade to Growth to keep your monitors running and continue receiving alerts after
            your trial ends.
          </Para>
        </>
      ) : (
        <>
          <Para>
            Your monitors have been quiet so far. That can mean one of two things: your competitors
            have not made major moves, or there is nothing to watch yet.
          </Para>
          <Para>
            On Growth, Beaconmon watches for price changes, promotions, out-of-stock events, and
            content updates across your competitor sites, around the clock. When something
            changes, you hear about it first.
          </Para>
        </>
      )}

      <BtnRow>
        <EBtn href={`${appUrl}/settings/billing`} variant="primary">
          Upgrade to Growth
        </EBtn>
      </BtnRow>

      <DetailBox
        rows={[
          { k: 'Growth plan', v: '100 monitors, 1-min intervals', mono: false },
          { k: 'Locations', v: '5 monitoring locations', mono: false },
          { k: 'History', v: '90 days', mono: false },
          { k: 'Includes', v: 'Competitor intelligence and content change detection', mono: false },
        ]}
      />

      <EmailFooter
        reason="You received this email because you signed up for a Beaconmon trial."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings/billing`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

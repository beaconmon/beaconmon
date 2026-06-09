import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  Strong,
  MonoVal,
  DurationBox,
  DetailBox,
  EBtn,
  BtnRow,
  EmailFooter,
  formatDurationMs,
  formatBriefDateTimeUTC,
} from '@beaconmon/emails';

export interface RecoveryAlertProps {
  monitorName: string;
  monitorUrl: string;
  incidentId: string;
  durationMs: number;
  incidentStartedAt?: Date;
  recoveredAt?: Date;
  incidentUrl?: string;
  unsubscribeUrl?: string;
}

export function RecoveryAlert({
  monitorName,
  monitorUrl,
  incidentId,
  durationMs,
  incidentStartedAt,
  recoveredAt,
  incidentUrl,
  unsubscribeUrl,
}: RecoveryAlertProps) {
  const downtime = formatDurationMs(durationMs);
  const preview = `${monitorName} recovered — down ${downtime}. Incident #${incidentId}.`;

  return (
    <EmailLayout preview={preview} context="Uptime Alert">
      <AlertBanner
        sev="positive"
        label="Monitor recovered"
        tag={{ kind: 'recovered', text: 'Recovered' }}
      />

      <H1>{monitorName} is back online</H1>

      <Para>
        <Strong>{monitorName}</Strong> is responding normally again. Total downtime for incident{' '}
        <MonoVal>#{incidentId}</MonoVal>:
      </Para>

      <DurationBox duration={downtime} label="Total downtime · auto-recovered" />

      <DetailBox
        rows={[
          { k: 'Monitor', v: monitorName, mono: false },
          { k: 'URL', v: monitorUrl, break: true },
          ...(incidentStartedAt
            ? [{ k: 'Down at', v: formatBriefDateTimeUTC(incidentStartedAt) }]
            : []),
          ...(recoveredAt
            ? [{ k: 'Recovered at', v: formatBriefDateTimeUTC(recoveredAt) }]
            : []),
          { k: 'Incident', v: `#${incidentId}` },
        ]}
      />

      {incidentUrl && (
        <BtnRow>
          <EBtn href={incidentUrl} variant="primary">
            View incident timeline
          </EBtn>
        </BtnRow>
      )}

      <EmailFooter
        reason="You receive this because you were alerted to the original incident on this monitor."
        manageLabel="Escalation policy"
        manageUrl={incidentUrl}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

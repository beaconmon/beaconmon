import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  Strong,
  DetailBox,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  formatBriefDateTimeUTC,
} from '@beaconmon/emails';

export interface DowntimeAlertProps {
  monitorName: string;
  monitorUrl: string;
  incidentStartedAt: Date;
  incidentId: string;
  incidentUrl?: string;
  acknowledgeUrl?: string;
  unsubscribeUrl?: string;
}

export function DowntimeAlert({
  monitorName,
  monitorUrl,
  incidentStartedAt,
  incidentId,
  incidentUrl,
  acknowledgeUrl,
  unsubscribeUrl,
}: DowntimeAlertProps) {
  const preview = `${monitorName} is down — incident detected at ${formatBriefDateTimeUTC(incidentStartedAt)}.`;

  return (
    <EmailLayout preview={preview} context="Uptime Alert">
      <AlertBanner
        sev="critical"
        label="Monitor is down"
        tag={{ kind: 'down', text: 'Down' }}
      />

      <H1>{monitorName} is not responding</H1>

      <Para>
        Beaconmon could not reach <Strong>{monitorName}</Strong> on its last checks. Customers may
        be unable to reach this URL right now.
      </Para>

      <DetailBox
        rows={[
          { k: 'Monitor', v: monitorName, mono: false },
          { k: 'URL', v: monitorUrl, break: true },
          { k: 'Status', v: 'Unreachable', color: EP.critInk },
          { k: 'Failing since', v: formatBriefDateTimeUTC(incidentStartedAt) },
          { k: 'Incident', v: `#${incidentId}` },
        ]}
      />

      {(incidentUrl || acknowledgeUrl) && (
        <BtnRow>
          {incidentUrl && (
            <EBtn href={incidentUrl} variant="primary">
              View incident #{incidentId}
            </EBtn>
          )}
          {acknowledgeUrl && (
            <EBtn href={acknowledgeUrl} variant="outline">
              Acknowledge
            </EBtn>
          )}
        </BtnRow>
      )}

      <EmailFooter
        reason="You receive this because you are on the alert policy for this monitor. We will email again the moment it recovers."
        manageLabel="Escalation policy"
        manageUrl={incidentUrl}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

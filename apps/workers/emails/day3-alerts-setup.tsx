import * as React from 'react';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  StepRow,
  EBtn,
  BtnRow,
  EmailFooter,
} from '@beaconmon/emails';
import { Section } from '@react-email/components';

export interface Day3AlertsSetupProps {
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day3AlertsSetup({ appUrl, unsubscribeUrl }: Day3AlertsSetupProps) {
  const preview = 'Get notified the moment something changes.';

  return (
    <EmailLayout preview={preview} context="Day 3">
      <Eyebrow>Day 3</Eyebrow>
      <H1>Set up alerts for your monitors</H1>

      <Para>
        Beaconmon is detecting changes and watching your uptime. Now make sure you hear about them
        the moment they happen.
      </Para>

      <Para>
        Connecting Slack means alerts land in your channel in seconds. Email works too, but Slack
        is faster when every minute counts. Setup takes less than a minute.
      </Para>

      <Section style={{ marginBottom: '20px' }}>
        <StepRow n={1} title="Go to Settings, Alerts" body="Open the Alerts section in your account settings." />
        <StepRow n={2} title="Click Add channel" body="Choose Slack or email and follow the prompts to authorize." />
        <StepRow n={3} title="Attach it to monitors" body="Pick which monitors should fire to this new channel." last />
      </Section>

      <BtnRow>
        <EBtn href={`${appUrl}/settings/alerts`} variant="primary">
          Configure alerts
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason="You received this email because you signed up for Beaconmon."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

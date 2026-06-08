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
  EP,
  MONO,
} from '@beaconmon/emails';
import { Section, Text } from '@react-email/components';

export interface WelcomeProps {
  competitorDomains: string[];
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Welcome({ competitorDomains, appUrl, unsubscribeUrl }: WelcomeProps) {
  const preview = "You're live on Beaconmon. First check in ~10 minutes — here's what to expect.";

  return (
    <EmailLayout preview={preview} context="Welcome">
      <Eyebrow color={EP.brandDeep}>You&apos;re live</Eyebrow>
      <H1>Your competitor intelligence is now running</H1>
      <Para>Your monitors are active. Here is exactly what happens next, and when.</Para>

      {competitorDomains.length > 0 && (
        <Section
          style={{
            backgroundColor: EP.surface,
            border: `1px solid ${EP.line}`,
            borderRadius: '9px',
            padding: '14px 16px',
            marginBottom: '24px',
          }}
        >
          <Text
            style={{
              margin: '0 0 10px',
              fontFamily: MONO,
              fontSize: '10.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: EP.muted,
            }}
          >
            Tracking {competitorDomains.length} competitor{competitorDomains.length === 1 ? '' : 's'}
          </Text>
          {competitorDomains.map((d) => (
            <Text
              key={d}
              style={{
                margin: '0 0 4px',
                fontFamily: MONO,
                fontSize: '12.5px',
                color: EP.body,
              }}
            >
              ✓ {d}
            </Text>
          ))}
        </Section>
      )}

      <Section style={{ marginBottom: '24px' }}>
        <StepRow
          n={1}
          title="First check in ~10 minutes"
          body="We baseline every competitor page, then watch for price, promo, stock, and content changes."
        />
        <StepRow
          n={2}
          title="Instant alerts on big moves"
          body="Price drops, sales, and stockouts hit your inbox the moment we detect them."
        />
        <StepRow
          n={3}
          title="A briefing every morning"
          body="One digest at 08:00 with everything that changed overnight, ranked by impact."
          last
        />
      </Section>

      <BtnRow>
        <EBtn href={`${appUrl}/wire`} variant="primary">
          Open your feed
        </EBtn>
        <EBtn href={`${appUrl}/wire?tab=competitors`} variant="outline">
          Add competitors
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason="You receive this because you completed Beaconmon setup."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

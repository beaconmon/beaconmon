import * as React from 'react';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  Strong,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
  hostnameFrom,
} from '@beaconmon/emails';
import { Section, Text } from '@react-email/components';

export interface FirstCompetitorChangeProps {
  pageUrl: string;
  diffSummary: string | null;
  competitorEventId: string;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function FirstCompetitorChange({
  pageUrl,
  diffSummary,
  appUrl,
  unsubscribeUrl,
}: FirstCompetitorChangeProps) {
  const hostname = hostnameFrom(pageUrl);
  const preview = 'Your competitor intelligence just picked up its first signal.';

  return (
    <EmailLayout preview={preview} context="First signal">
      <Eyebrow color={EP.brandDeep}>First signal</Eyebrow>
      <H1>We found your first competitor change</H1>

      <Para>
        Beaconmon detected a change on <Strong>{hostname}</Strong>. Your competitor intelligence
        feed is live, and it is already paying attention.
      </Para>

      {diffSummary && (
        <Section
          style={{
            backgroundColor: EP.surface,
            border: `1px solid ${EP.line}`,
            borderRadius: '9px',
            padding: '14px 16px',
            marginBottom: '20px',
          }}
        >
          <Text
            style={{
              margin: '0 0 6px',
              fontFamily: MONO,
              fontSize: '10.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: EP.muted,
            }}
          >
            What changed
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.55,
              color: EP.body,
            }}
          >
            {diffSummary}
          </Text>
        </Section>
      )}

      <Para>
        From here, every price update, promotion, or content change on your tracked competitors
        will surface in your intelligence feed.
      </Para>

      <BtnRow>
        <EBtn href={`${appUrl}/wire`} variant="primary">
          View the change
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

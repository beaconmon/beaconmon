import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
} from '@beaconmon/emails';

export interface ToolReportConfirmationProps {
  domain: string;
  reportDueAt: Date;
  snapshotUrl: string;
}

function formatReportDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function ToolReportConfirmation({ domain, reportDueAt, snapshotUrl }: ToolReportConfirmationProps) {
  const preview = `We're watching ${domain}. Your intelligence report arrives on ${formatReportDate(reportDueAt)}.`;

  return (
    <EmailLayout preview={preview} context="Competitor Report">
      <Eyebrow color={EP.brandDeep}>Report confirmed</Eyebrow>
      <H1>We&apos;re watching {domain}</H1>
      <Para>
        Beaconmon has started monitoring this competitor. We&apos;ll send your 7-day intelligence report on{' '}
        <strong>{formatReportDate(reportDueAt)}</strong> with every price change, promo launch, product addition, and
        content update we detected.
      </Para>

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
            margin: '0 0 6px',
            fontFamily: MONO,
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: EP.muted,
          }}
        >
          Now monitoring
        </Text>
        <Text
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: '13px',
            color: EP.body,
          }}
        >
          {domain}
        </Text>
      </Section>

      <Para>While you wait, you can see a current snapshot of the store right now.</Para>

      <BtnRow>
        <EBtn href={snapshotUrl} variant="primary">
          View current snapshot
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason={`You receive this because you requested a free 7-day competitor intelligence report on ${domain}.`}
        manageLabel="Beaconmon tools"
        manageUrl="https://beaconmon.com/tools"
      />
    </EmailLayout>
  );
}

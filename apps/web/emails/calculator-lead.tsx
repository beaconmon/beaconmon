import * as React from 'react';
import { Section, Text } from '@react-email/components';
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
} from '@beaconmon/emails';

export interface CalculatorLeadEmailProps {
  toolLabel: string;
  resultLabel: string;
  result: string;
  tip: string;
  ctaUrl: string;
}

export function CalculatorLeadEmail({
  toolLabel,
  resultLabel,
  result,
  tip,
  ctaUrl,
}: CalculatorLeadEmailProps) {
  const preview = `Your ${toolLabel} result: ${result}. Plus a quick tip.`;

  return (
    <EmailLayout preview={preview} context="Calculator result">
      <Eyebrow>{toolLabel}</Eyebrow>
      <H1>Your result is ready</H1>
      <Para>
        Here is the number you calculated, plus one practical tip to help you act on it.
      </Para>

      <Section
        style={{
          textAlign: 'center',
          backgroundColor: EP.posSoft,
          border: `1px solid ${EP.pos}33`,
          borderRadius: '10px',
          padding: '22px 17px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            margin: '0 0 6px',
            fontFamily: MONO,
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: EP.muted,
          }}
        >
          {resultLabel}
        </Text>
        <Text
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: '33px',
            fontWeight: 700,
            color: EP.posInk,
            letterSpacing: '-0.025em',
          }}
        >
          {result}
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: EP.surface,
          border: `1px solid ${EP.line}`,
          borderRadius: '10px',
          padding: '16px 17px',
          marginBottom: '28px',
        }}
      >
        <Text
          style={{
            margin: '0 0 6px',
            fontFamily: MONO,
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: EP.brandDeep,
          }}
        >
          One-time tip
        </Text>
        <Text style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.58, color: EP.body }}>
          {tip}
        </Text>
      </Section>

      <Para>
        Beaconmon monitors your competitors and your own store around the clock so you can
        react to changes before they cost you sales.{' '}
        <Strong>Start free, no credit card required.</Strong>
      </Para>

      <BtnRow>
        <EBtn href={ctaUrl} variant="green">
          Start monitoring free
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason="You received this because you used a free Beaconmon calculator. This is a one-time email."
        manageLabel="Unsubscribe"
      />
    </EmailLayout>
  );
}

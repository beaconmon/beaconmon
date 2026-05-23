import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface TrialReminderProps {
  daysLeft: number;
  appUrl: string;
}

export function TrialReminder({ daysLeft, appUrl }: TrialReminderProps) {
  const isLastDay = daysLeft <= 1;
  const preview = isLastDay
    ? 'Your Beaconmon trial ends tomorrow — upgrade to keep your monitors running'
    : `${daysLeft} days left in your Beaconmon trial`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>
            {isLastDay ? 'Your trial ends tomorrow' : `${daysLeft} days left in your trial`}
          </Heading>

          <Text style={paragraph}>
            Your 14-day Beaconmon trial {isLastDay ? 'ends tomorrow' : `expires in ${daysLeft} days`}.
            After it ends, your monitors will be paused and you will stop receiving alerts.
          </Text>

          <Text style={paragraph}>
            Upgrade to a paid plan to keep everything running without interruption.
          </Text>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/settings/billing`} style={ctaButton}>
              Upgrade now
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={planList}>
            <Text style={planHeading}>Plans starting at $23/mo</Text>
            <Text style={planItem}>Starter: 25 monitors, 1-min intervals, 30-day history</Text>
            <Text style={planItem}>Growth: 100 monitors, 1-min intervals, 5 locations</Text>
            <Text style={planItem}>Scale: Unlimited monitors, 30-sec intervals, 1-year history</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you signed up for a Beaconmon trial.{' '}
            <Link href={`${appUrl}/settings/billing`} style={footerLink}>
              Manage your account
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 32px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const heading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 14px',
};

const ctaSection: React.CSSProperties = {
  margin: '24px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#00e57a',
  borderRadius: '6px',
  color: '#0a1a0f',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '14px',
  padding: '12px 24px',
  textDecoration: 'none',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const planList: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px',
};

const planHeading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const planItem: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 4px',
};

const footer: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
};

const footerLink: React.CSSProperties = {
  color: '#64748b',
};

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

export interface Day3AlertsSetupProps {
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day3AlertsSetup({ appUrl, unsubscribeUrl }: Day3AlertsSetupProps) {
  return (
    <Html>
      <Head />
      <Preview>Get notified the moment something changes</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logoText}>Beaconmon</Text>
          <Heading style={heading}>Set up alerts for your monitors</Heading>

          <Text style={paragraph}>
            Beaconmon is detecting changes and watching your uptime. Now make sure you hear about them
            the moment they happen.
          </Text>

          <Text style={paragraph}>
            Connecting Slack means alerts land in your channel in seconds. Email works too, but Slack
            is faster when every minute counts. Setup takes less than a minute.
          </Text>

          <Section style={stepBox}>
            <Text style={stepText}>
              1. Go to Settings &rarr; Alerts
            </Text>
            <Text style={stepText}>
              2. Click &ldquo;Add channel&rdquo; and choose Slack or email
            </Text>
            <Text style={stepText}>
              3. Pick which monitors to attach it to
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/settings/alerts`} style={ctaButton}>
              Connect Slack or configure alerts
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you signed up for Beaconmon.{' '}
            <Link href={`${appUrl}/settings`} style={footerLink}>
              Manage your account
            </Link>
            {unsubscribeUrl && (
              <>
                {' · '}
                <Link href={unsubscribeUrl} style={footerLink}>
                  Unsubscribe
                </Link>
              </>
            )}
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

const logoText: React.CSSProperties = {
  color: '#22c55e',
  fontWeight: '700',
  fontSize: '16px',
  margin: '0 0 24px',
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

const stepBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0 0 24px',
};

const stepText: React.CSSProperties = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0',
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

const footer: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
};

const footerLink: React.CSSProperties = {
  color: '#64748b',
};

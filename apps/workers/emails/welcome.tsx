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

export interface WelcomeProps {
  competitorDomains: string[];
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Welcome({ competitorDomains, appUrl, unsubscribeUrl }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>You're set up on Beaconmon. Competitor checks start in ~10 minutes.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>You're all set on Beaconmon</Heading>

          <Text style={paragraph}>
            Your monitors are live. Here's what happens next.
          </Text>

          {competitorDomains.length > 0 && (
            <Section style={competitorBox}>
              <Text style={competitorHeading}>Competitors you're tracking</Text>
              {competitorDomains.map((domain) => (
                <Text key={domain} style={competitorItem}>
                  {domain}
                </Text>
              ))}
            </Section>
          )}

          <Text style={paragraph}>
            Your first competitor check runs in ~10 minutes. You'll get notified when prices,
            promotions, or page content changes.
          </Text>

          <Text style={paragraph}>
            Every morning you'll receive an intelligence digest summarizing what changed overnight
            across all your competitors.
          </Text>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/wire`} style={ctaButton}>
              Open your feed
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this because you completed Beaconmon setup.{' '}
            <Link href={`${appUrl}/settings`} style={footerLink}>
              Manage account
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

const competitorBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 20px',
};

const competitorHeading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const competitorItem: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0 0 4px',
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

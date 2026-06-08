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

export interface FirstCompetitorChangeProps {
  pageUrl: string;
  diffSummary: string | null;
  competitorEventId: string;
  appUrl: string;
  unsubscribeUrl?: string;
}

function hostnameFrom(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function FirstCompetitorChange({
  pageUrl,
  diffSummary,
  appUrl,
  unsubscribeUrl,
}: FirstCompetitorChangeProps) {
  const hostname = hostnameFrom(pageUrl);

  return (
    <Html>
      <Head />
      <Preview>Your competitor intelligence just picked up its first signal.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logoText}>Beaconmon</Text>
          <Heading style={heading}>We found your first competitor change!</Heading>

          <Text style={paragraph}>
            Beaconmon detected a change on <strong>{hostname}</strong>. Your competitor
            intelligence feed is live, and it is already paying attention.
          </Text>

          {diffSummary && (
            <Section style={diffBox}>
              <Text style={diffLabel}>What changed</Text>
              <Text style={diffText}>{diffSummary}</Text>
            </Section>
          )}

          <Text style={paragraph}>
            From here, every price update, promotion, or content change on your tracked competitors
            will surface in your intelligence feed.
          </Text>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/wire`} style={ctaButton}>
              View the change
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

const diffBox: React.CSSProperties = {
  borderLeft: '3px solid #00e57a',
  paddingLeft: '12px',
  margin: '0 0 20px',
};

const diffLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 4px',
};

const diffText: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  lineHeight: '1.6',
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

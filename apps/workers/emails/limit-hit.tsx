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

export interface LimitHitProps {
  limitType: 'competitor' | 'monitor';
  currentCount: number;
  planLimit: number;
  planTier: string;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function LimitHit({ limitType, currentCount, planLimit, planTier, appUrl, unsubscribeUrl }: LimitHitProps) {
  const label = limitType === 'competitor' ? 'competitor' : 'monitor';
  const plural = `${label}s`;
  const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1);
  const limitLabel = planLimit === 1 ? label : plural;
  const preview = `You've reached your ${label} limit. Upgrade to Growth to add more.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>You've reached your {label} limit</Heading>

          <Text style={paragraph}>
            You tried to add a {label}, but your {planName} plan allows a maximum of {planLimit} {limitLabel}.
            You already have {currentCount}.
          </Text>

          <Text style={paragraph}>
            Upgrade to Growth to monitor up to 25 competitors and 100 websites, or to Scale for
            unlimited monitoring.
          </Text>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/settings/billing`} style={ctaButton}>
              Upgrade to Growth
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={planList}>
            <Text style={planHeading}>Growth plan highlights</Text>
            <Text style={planItem}>25 competitor monitors</Text>
            <Text style={planItem}>100 uptime monitors, 1-minute intervals</Text>
            <Text style={planItem}>5 monitoring locations</Text>
            <Text style={planItem}>90-day history</Text>
            <Text style={planItem}>Unlimited alert channels</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this because you have a Beaconmon account.{' '}
            <Link href={`${appUrl}/settings/billing`} style={footerLink}>
              Manage billing
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

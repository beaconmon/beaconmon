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

export interface PausedMonitorItem {
  id: string;
  name: string;
  isCompetitor: boolean;
}

export interface Day14PausedProps {
  pausedMonitors: PausedMonitorItem[];
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day14Paused({ pausedMonitors, appUrl, unsubscribeUrl }: Day14PausedProps) {
  const competitorMonitors = pausedMonitors.filter((m) => m.isCompetitor);
  const ownMonitors = pausedMonitors.filter((m) => !m.isCompetitor);
  const total = pausedMonitors.length;

  return (
    <Html>
      <Head />
      <Preview>
        {`${total} monitor${total !== 1 ? 's' : ''} paused after your trial ended. Upgrade to restore them within 30 days.`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={alertBanner}>
            <Text style={alertText}>Trial ended</Text>
          </Section>

          <Heading style={heading}>
            {total} monitor{total !== 1 ? 's were' : ' was'} paused
          </Heading>

          <Text style={paragraph}>
            Your Beaconmon trial ended and {total === 1 ? 'one monitor exceeded' : `${total} monitors exceeded`} the free plan limit.{' '}
            They have been paused, not deleted. You have 30 days to upgrade and restore them.
          </Text>

          {competitorMonitors.length > 0 && (
            <Section style={monitorGroup}>
              <Text style={groupLabel}>Competitor monitors ({competitorMonitors.length})</Text>
              {competitorMonitors.map((m) => (
                <Text key={m.id} style={monitorItem}>
                  {m.name}
                </Text>
              ))}
            </Section>
          )}

          {ownMonitors.length > 0 && (
            <Section style={monitorGroup}>
              <Text style={groupLabel}>Your monitors ({ownMonitors.length})</Text>
              {ownMonitors.map((m) => (
                <Text key={m.id} style={monitorItem}>
                  {m.name}
                </Text>
              ))}
            </Section>
          )}

          <Section style={recoveryBox}>
            <Text style={recoveryHeading}>30-day recovery window</Text>
            <Text style={recoveryText}>
              Upgrade to Growth before your 30-day window closes and all paused monitors will be
              automatically restored. After 30 days they cannot be restored this way.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href={`${appUrl}/settings/billing`} style={ctaButton}>
              Upgrade to Growth
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={planHighlight}>
            <Text style={planHeading}>Growth plan</Text>
            <Text style={planItem}>100 monitors, 1-minute check intervals</Text>
            <Text style={planItem}>25 competitor monitors</Text>
            <Text style={planItem}>5 monitoring locations</Text>
            <Text style={planItem}>90-day history</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because your Beaconmon trial expired.{' '}
            <Link href={`${appUrl}/settings/billing`} style={footerLink}>
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

const alertBanner: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
  padding: '10px 16px',
  marginBottom: '24px',
};

const alertText: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '13px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
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
  margin: '0 0 20px',
};

const monitorGroup: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '12px',
};

const groupLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 8px',
};

const monitorItem: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  margin: '0 0 4px',
};

const recoveryBox: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const recoveryHeading: React.CSSProperties = {
  color: '#92400e',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 6px',
};

const recoveryText: React.CSSProperties = {
  color: '#78350f',
  fontSize: '13px',
  lineHeight: '1.5',
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

const planHighlight: React.CSSProperties = {
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

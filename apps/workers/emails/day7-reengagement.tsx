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

export interface Day7ReengagementProps {
  branch: 'no-competitors' | 'has-competitors';
  competitorCount: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day7Reengagement({
  branch,
  competitorCount,
  appUrl,
  unsubscribeUrl,
}: Day7ReengagementProps) {
  const isNoCompetitors = branch === 'no-competitors';

  const preview = isNoCompetitors
    ? 'Day 7: Add your first competitor and start tracking their prices and promos'
    : `You have ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} being monitored. See what changed this week.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logoText}>Beaconmon</Text>

          {isNoCompetitors ? (
            <>
              <Heading style={heading}>Add your first competitor</Heading>

              <Text style={paragraph}>
                You are 7 days in. Stores that add a competitor in their first week catch pricing
                moves and promo launches before their own customers notice.
              </Text>

              <Text style={paragraph}>
                It takes under a minute. Paste a competitor domain and Beaconmon starts tracking
                their prices, stock levels, and page changes automatically.
              </Text>

              <Section style={ctaSection}>
                <Link href={`${appUrl}/competitors/add`} style={ctaButton}>
                  Add your first competitor
                </Link>
              </Section>

              <Hr style={hr} />

              <Section style={tipBox}>
                <Text style={tipHeading}>Quick-start tips</Text>
                <Text style={tipItem}>Track a Shopify store: paste any domain and we detect it automatically</Text>
                <Text style={tipItem}>Get notified on price drops, stock changes, and homepage updates</Text>
                <Text style={tipItem}>Weekly digest summarizes everything so you stay informed without checking in</Text>
              </Section>
            </>
          ) : (
            <>
              <Heading style={heading}>Your competitors are moving. Are you watching?</Heading>

              <Text style={paragraph}>
                You have {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} being
                monitored. Beaconmon is capturing price changes, stock updates, and content
                changes in real time.
              </Text>

              <Text style={paragraph}>
                Open your Intelligence Dashboard to see what changed this week across all your
                tracked competitors.
              </Text>

              <Section style={ctaSection}>
                <Link href={`${appUrl}/intelligence`} style={ctaButton}>
                  View this week's activity
                </Link>
              </Section>

              <Hr style={hr} />

              <Section style={tipBox}>
                <Text style={tipHeading}>Make the most of competitor monitoring</Text>
                <Text style={tipItem}>Add more pages: track pricing, sale banners, and product listing pages separately</Text>
                <Text style={tipItem}>Set up a weekly digest to get a summary every Monday morning</Text>
                <Text style={tipItem}>Connect Slack to get instant alerts on high-significance changes</Text>
              </Section>
            </>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you signed up for Beaconmon.{' '}
            <Link href={`${appUrl}/settings/notifications`} style={footerLink}>
              Manage notifications
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

const tipBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px',
};

const tipHeading: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const tipItem: React.CSSProperties = {
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

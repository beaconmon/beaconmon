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

export interface Day12UrgencyProps {
  competitorEventCount: number;
  incidentCount: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day12Urgency({
  competitorEventCount,
  incidentCount,
  appUrl,
  unsubscribeUrl,
}: Day12UrgencyProps) {
  const totalDetections = competitorEventCount + incidentCount;
  const hasDetections = totalDetections > 0;

  const detectionSummary = buildDetectionSummary(competitorEventCount, incidentCount);

  return (
    <Html>
      <Head />
      <Preview>
        {hasDetections
          ? `Your trial ends in 2 days — Beaconmon detected ${totalDetections} event${totalDetections !== 1 ? 's' : ''} during your trial`
          : 'Your trial ends in 2 days — see what Growth keeps watching for you'}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={countdownBanner}>
            <Text style={countdownText}>2 days left in your trial</Text>
          </Section>

          <Heading style={heading}>
            {hasDetections ? "Here's what we found for you" : "Your trial ends in 2 days"}
          </Heading>

          {hasDetections ? (
            <>
              <Text style={paragraph}>
                In your first 12 days, Beaconmon detected {detectionSummary}. That intelligence
                disappears when your trial ends.
              </Text>

              <Section style={summaryBox}>
                {competitorEventCount > 0 && (
                  <Text style={summaryRow}>
                    <span style={summaryCount}>{competitorEventCount}</span>{' '}
                    competitor change{competitorEventCount !== 1 ? 's' : ''} detected
                  </Text>
                )}
                {incidentCount > 0 && (
                  <Text style={summaryRow}>
                    <span style={summaryCount}>{incidentCount}</span>{' '}
                    downtime incident{incidentCount !== 1 ? 's' : ''} caught
                  </Text>
                )}
              </Section>

              <Text style={paragraph}>
                Upgrade to Growth to keep your monitors running and continue receiving alerts after
                your trial ends.
              </Text>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                Your monitors have been quiet so far. That can mean one of two things: your
                competitors have not made major moves, or there is nothing to watch yet.
              </Text>

              <Text style={paragraph}>
                On Growth, Beaconmon watches for price changes, promotions, out-of-stock events,
                and content updates across your competitor sites, around the clock. When something
                changes, you hear about it first.
              </Text>
            </>
          )}

          <Section style={ctaSection}>
            <Link href={`${appUrl}/settings/billing`} style={ctaButton}>
              Upgrade to Growth
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={planHighlight}>
            <Text style={planHeading}>Growth plan</Text>
            <Text style={planItem}>100 monitors, 1-minute check intervals</Text>
            <Text style={planItem}>5 monitoring locations</Text>
            <Text style={planItem}>Competitor intelligence and content change detection</Text>
            <Text style={planItem}>90-day history</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you signed up for a Beaconmon trial.{' '}
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

function buildDetectionSummary(competitorEventCount: number, incidentCount: number): string {
  const parts: string[] = [];
  if (competitorEventCount > 0) {
    parts.push(
      `${competitorEventCount} competitor change${competitorEventCount !== 1 ? 's' : ''}`
    );
  }
  if (incidentCount > 0) {
    parts.push(`${incidentCount} downtime incident${incidentCount !== 1 ? 's' : ''}`);
  }
  return parts.join(' and ');
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

const countdownBanner: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '6px',
  padding: '10px 16px',
  marginBottom: '24px',
};

const countdownText: React.CSSProperties = {
  color: '#c2410c',
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
  margin: '0 0 14px',
};

const summaryBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  padding: '16px',
  margin: '0 0 16px',
};

const summaryRow: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  margin: '0 0 6px',
};

const summaryCount: React.CSSProperties = {
  color: '#00e57a',
  fontWeight: '700',
  fontSize: '20px',
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

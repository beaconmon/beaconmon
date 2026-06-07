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

export interface TopCompetitorEvent {
  competitorName: string;
  type: string;
  detectedAt: string;
}

export interface Day8DetectionProps {
  competitorEvents: number;
  topEvents: TopCompetitorEvent[];
  incidents: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    price_changed: 'Price change detected',
    promo_detected: 'Promotion detected',
    sale_started: 'Sale started',
    sale_ended: 'Sale ended',
    site_changed: 'Content change detected',
    product_added: 'New product listed',
    product_removed: 'Product removed',
    stock_changed: 'Stock level changed',
    out_of_stock: 'Out of stock',
    back_in_stock: 'Back in stock',
  };
  return labels[type] ?? type;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Day8Detection({
  competitorEvents,
  topEvents,
  incidents,
  appUrl,
  unsubscribeUrl,
}: Day8DetectionProps) {
  const hasCompetitorData = competitorEvents > 0;
  const hasIncidents = incidents > 0;

  let preview: string;
  let headingText: string;
  let bodyText: string;
  let ctaLabel: string;
  let ctaHref: string;

  if (hasCompetitorData) {
    const n = competitorEvents;
    preview = `${n} competitor signal${n === 1 ? '' : 's'} detected in your first week`;
    headingText = 'Your competitors have been busy';
    bodyText = `In the past 7 days, Beaconmon detected ${n} competitor signal${n === 1 ? '' : 's'} for your team.`;
    ctaLabel = 'View all intelligence';
    ctaHref = `${appUrl}/wire`;
  } else if (hasIncidents) {
    const n = incidents;
    preview = `Beaconmon caught ${n} incident${n === 1 ? '' : 's'} while monitoring your sites`;
    headingText = `Beaconmon caught ${n} incident${n === 1 ? '' : 's'} this week`;
    bodyText = `Your monitors flagged ${n} downtime incident${n === 1 ? '' : 's'} in the past 7 days. Beaconmon notified you in real time so you could act fast.`;
    ctaLabel = 'View incidents';
    ctaHref = `${appUrl}/incidents`;
  } else {
    preview = 'Your Beaconmon monitors have been running quietly this week';
    headingText = 'Your monitors are running quietly';
    bodyText =
      'No competitor changes or downtime incidents in the past 7 days. Things look healthy. If you want more signal, try adding a competitor to track.';
    ctaLabel = 'Track a competitor';
    ctaHref = `${appUrl}/wire?tab=competitors`;
  }

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logoText}>Beaconmon</Text>
          <Heading style={heading}>{headingText}</Heading>

          <Text style={paragraph}>{bodyText}</Text>

          {hasCompetitorData && topEvents.length > 0 && (
            <Section style={eventList}>
              {topEvents.map((event, i) => (
                <Section key={i} style={eventItem}>
                  <Text style={eventTypeStyle}>{formatEventType(event.type)}</Text>
                  <Text style={eventMeta}>
                    {event.competitorName} · {formatDate(event.detectedAt)}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          <Section style={ctaSection}>
            <Link href={ctaHref} style={ctaButton}>
              {ctaLabel}
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={growthBox}>
            <Text style={growthHeading}>Unlock more with Growth</Text>
            <Text style={planItem}>100 monitors, 1-min intervals, 5 check locations</Text>
            <Text style={planItem}>Competitor intelligence on up to 25 rivals</Text>
            <Text style={planItem}>Advanced alerting and escalation policies</Text>
            <Section style={{ margin: '16px 0 0' }}>
              <Link href={`${appUrl}/settings/billing`} style={ctaButton}>
                Upgrade to Growth
              </Link>
            </Section>
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

const eventList: React.CSSProperties = {
  margin: '0 0 8px',
};

const eventItem: React.CSSProperties = {
  borderLeft: '3px solid #00e57a',
  marginBottom: '12px',
  paddingLeft: '12px',
};

const eventTypeStyle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const eventMeta: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0',
};

const growthBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px',
};

const growthHeading: React.CSSProperties = {
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

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

export type Day2AhaBranch = 'detected' | 'uptime' | 'quiet';

export interface TopCompetitorEvent {
  competitorName: string;
  type: string;
  detectedAt: string;
}

export interface Day2AhaProps {
  competitorEvents: number;
  topEvents: TopCompetitorEvent[];
  incidents: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function selectDay2Branch({
  competitorEvents,
  incidents,
}: {
  competitorEvents: number;
  incidents: number;
}): Day2AhaBranch {
  if (competitorEvents > 0) return 'detected';
  if (incidents > 0) return 'uptime';
  return 'quiet';
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

export function Day2Aha({
  competitorEvents,
  topEvents,
  incidents,
  appUrl,
  unsubscribeUrl,
}: Day2AhaProps) {
  const branch = selectDay2Branch({ competitorEvents, incidents });

  let preview: string;
  let headingText: string;
  let bodyText: string;
  let ctaLabel: string;
  let ctaHref: string;

  if (branch === 'detected') {
    const n = competitorEvents;
    preview = `${n} competitor signal${n === 1 ? '' : 's'} detected in your first 48 hours`;
    headingText = "Here's what we've already detected";
    bodyText = `In your first 48 hours, Beaconmon caught ${n} competitor signal${n === 1 ? '' : 's'}. Your intelligence feed is live.`;
    ctaLabel = 'View competitor intelligence';
    ctaHref = `${appUrl}/intelligence`;
  } else if (branch === 'uptime') {
    const n = incidents;
    preview = `Beaconmon caught ${n} downtime incident${n === 1 ? '' : 's'} in your first 48 hours`;
    headingText = `Beaconmon is already working for you`;
    bodyText = `Your monitors flagged ${n} downtime incident${n === 1 ? '' : 's'} in your first 48 hours. Beaconmon notified you in real time so you could act fast.`;
    ctaLabel = 'View incidents';
    ctaHref = `${appUrl}/incidents`;
  } else {
    preview = 'Your Beaconmon monitors are running, competitors have been quiet so far';
    headingText = 'Your competitors are quiet, so far';
    bodyText =
      'No competitor changes or downtime incidents in the past 48 hours. That is a good sign, but the real value shows up when competitors move. Want more coverage? Add another competitor to track.';
    ctaLabel = 'Add a competitor';
    ctaHref = `${appUrl}/competitors`;
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

          {branch === 'detected' && topEvents.length > 0 && (
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

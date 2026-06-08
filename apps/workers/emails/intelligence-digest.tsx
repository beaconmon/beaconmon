import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface DigestIncidentItem {
  id: string;
  monitorName: string;
  monitorUrl: string;
  startedAt: Date;
  resolvedAt: Date | null;
}

export interface DigestContentItem {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  capturedAt: Date;
  diffSummary: string | null;
  classification: string | null;
  dashboardUrl: string;
}

export interface DigestExpiryItem {
  monitorName: string;
  monitorUrl: string;
  type: string;
  daysRemaining: number;
}

export interface DigestSmartAlertItem {
  monitorName: string;
  monitorUrl: string;
  responseTimeMs: number;
  checkedAt: Date;
}

export function significanceWeight(significance: string | null): number {
  if (significance === 'high') return 0;
  if (significance === 'low') return 2;
  return 1; // 'medium' or null
}

export function hasAnySignal(sections: {
  incidents?: unknown[];
  ownContent?: unknown[];
  competitors?: unknown[];
  smartAlerts?: unknown[];
  expiry?: unknown[];
}): boolean {
  return (
    (sections.incidents?.length ?? 0) > 0 ||
    (sections.ownContent?.length ?? 0) > 0 ||
    (sections.competitors?.length ?? 0) > 0 ||
    (sections.smartAlerts?.length ?? 0) > 0 ||
    (sections.expiry?.length ?? 0) > 0
  );
}

export function formatEventSummary(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'price_changed':
      return `$${payload.oldPrice} → $${payload.newPrice}`;
    case 'product_added':
      return `New: ${payload.title}`;
    case 'product_removed':
      return `Removed: ${payload.title}`;
    case 'stock_changed':
      return payload.newAvailable ? 'Back in stock' : 'Out of stock';
    case 'out_of_stock':
      return `Out of stock: ${payload.productHandle ?? 'product'}`;
    case 'back_in_stock':
      return `Back in stock: ${payload.productHandle ?? 'product'}`;
    case 'site_changed':
    case 'promo_detected':
      return (payload.diffSummary as string | undefined) ?? 'Content changed';
    default:
      return 'Competitor event';
  }
}

export interface IntelligenceDigestEmailProps {
  frequency: 'daily' | 'weekly';
  windowStart: Date;
  windowEnd: Date;
  dashboardUrl: string;
  sections: {
    incidents?: DigestIncidentItem[];
    ownContent?: DigestContentItem[];
    competitors?: DigestContentItem[];
    smartAlerts?: DigestSmartAlertItem[];
    expiry?: DigestExpiryItem[];
  };
}

export function IntelligenceDigestEmail({
  frequency,
  windowStart,
  windowEnd,
  dashboardUrl,
  sections,
}: IntelligenceDigestEmailProps) {
  const label = frequency === 'daily' ? 'Daily' : 'Weekly';
  const dateRange = `${windowStart.toUTCString().slice(0, 16)} to ${windowEnd.toUTCString().slice(0, 16)} UTC`;

  const totalEvents =
    (sections.incidents?.length ?? 0) +
    (sections.smartAlerts?.length ?? 0) +
    (sections.expiry?.length ?? 0) +
    (sections.competitors?.length ?? 0) +
    (sections.ownContent?.length ?? 0);

  return (
    <Html>
      <Head />
      <Preview>
        {`${label} Intelligence Digest — ${totalEvents} event${totalEvents !== 1 ? 's' : ''} in the last ${frequency === 'daily' ? '24 hours' : '7 days'}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoBanner}>
            <Text style={logoText}>Beaconmon</Text>
          </Section>

          <Heading style={heading}>{label} Intelligence Digest</Heading>

          <Text style={paragraph}>
            {totalEvents} event{totalEvents !== 1 ? 's' : ''} across your monitors ({dateRange}).
          </Text>

          {sections.incidents && sections.incidents.length > 0 && (
            <Section>
              <Text style={sectionTitle}>Incidents</Text>
              {sections.incidents.map((inc) => (
                <Section key={inc.id} style={card}>
                  <Text style={cardTitle}>{inc.monitorName}</Text>
                  <Text style={cardUrl}>{inc.monitorUrl}</Text>
                  <Text style={cardMeta}>
                    Started: {inc.startedAt.toUTCString()}
                    {inc.resolvedAt ? ` | Resolved: ${inc.resolvedAt.toUTCString()}` : ' | Ongoing'}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {sections.smartAlerts && sections.smartAlerts.length > 0 && (
            <Section>
              <Text style={sectionTitle}>Smart Alerts</Text>
              {sections.smartAlerts.map((alert, i) => (
                <Section key={String(i)} style={card}>
                  <Text style={cardTitle}>{alert.monitorName}</Text>
                  <Text style={cardUrl}>{alert.monitorUrl}</Text>
                  <Text style={cardMeta}>
                    Response time: {alert.responseTimeMs}ms | Detected: {alert.checkedAt.toUTCString()}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {sections.expiry && sections.expiry.length > 0 && (
            <Section>
              <Text style={sectionTitle}>SSL and Domain Expiry</Text>
              {sections.expiry.map((exp, i) => (
                <Section key={String(i)} style={card}>
                  <Text style={cardTitle}>{exp.monitorName}</Text>
                  <Text style={cardUrl}>{exp.monitorUrl}</Text>
                  <Text style={cardMeta}>
                    {exp.type.toUpperCase()} expires in {exp.daysRemaining} day{exp.daysRemaining !== 1 ? 's' : ''}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {sections.competitors && sections.competitors.length > 0 && (
            <Section>
              <Text style={sectionTitle}>Competitor Changes</Text>
              {sections.competitors.map((change, i) => {
                const isHighPriority = change.classification != null &&
                  ['out_of_stock', 'back_in_stock', 'sale_started'].includes(change.classification);
                return (
                <Section key={String(i)} style={isHighPriority ? { ...card, borderColor: '#b45309' } : card}>
                  <Text style={cardTitle}>
                    {change.monitorName}
                    {change.classification ? (
                      <span style={isHighPriority ? highPriorityTag : classificationTag}>{change.classification.replace(/_/g, ' ')}</span>
                    ) : null}
                  </Text>
                  <Text style={cardUrl}>{change.monitorUrl}</Text>
                  {change.diffSummary ? <Text style={cardSummary}>{change.diffSummary}</Text> : null}
                  <Text style={cardMeta}>Detected: {change.capturedAt.toUTCString()}</Text>
                  <Button style={viewButton} href={change.dashboardUrl}>
                    View diff
                  </Button>
                </Section>
                );
              })}
            </Section>
          )}

          {sections.ownContent && sections.ownContent.length > 0 && (
            <Section>
              <Text style={sectionTitle}>Own Content Changes</Text>
              {sections.ownContent.map((change, i) => (
                <Section key={String(i)} style={card}>
                  <Text style={cardTitle}>{change.monitorName}</Text>
                  <Text style={cardUrl}>{change.monitorUrl}</Text>
                  {change.diffSummary ? <Text style={cardSummary}>{change.diffSummary}</Text> : null}
                  <Text style={cardMeta}>Detected: {change.capturedAt.toUTCString()}</Text>
                  <Button style={viewButton} href={change.dashboardUrl}>
                    View diff
                  </Button>
                </Section>
              ))}
            </Section>
          )}

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Button style={ctaButton} href={dashboardUrl}>
              Open Intelligence Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            You&apos;re receiving this because you configured an Intelligence Digest in Beaconmon.
            To stop these emails, update your digest settings in the Intelligence section of your dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '560px',
  border: '1px solid #e4e4e7',
};

const logoBanner: React.CSSProperties = {
  marginBottom: '24px',
};

const logoText: React.CSSProperties = {
  color: '#22c55e',
  fontWeight: '700',
  fontSize: '16px',
  margin: '0',
};

const heading: React.CSSProperties = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const sectionTitle: React.CSSProperties = {
  color: '#111827',
  fontSize: '13px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '20px 0 8px',
};

const card: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const cardTitle: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const cardUrl: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 4px',
  wordBreak: 'break-all',
};

const cardSummary: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '6px 0',
};

const cardMeta: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '0 0 8px',
};

const classificationTag: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  color: '#2563eb',
  fontSize: '10px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '2px 6px',
  borderRadius: '3px',
  marginLeft: '8px',
};

const highPriorityTag: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  color: '#b45309',
  fontSize: '10px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '2px 6px',
  borderRadius: '3px',
  marginLeft: '8px',
};

const viewButton: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '4px',
  color: '#374151',
  fontSize: '12px',
  fontWeight: '500',
  padding: '6px 12px',
  textDecoration: 'none',
  display: 'inline-block',
};

const buttonContainer: React.CSSProperties = {
  marginBottom: '20px',
  textAlign: 'center',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
};

const hr: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0 20px',
};

const footer: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
  lineHeight: '1.5',
};

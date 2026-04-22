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

export interface RecoveryAlertProps {
  monitorName: string;
  monitorUrl: string;
  incidentId: string;
  durationMs: number;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function RecoveryAlert({
  monitorName,
  monitorUrl,
  incidentId,
  durationMs,
}: RecoveryAlertProps) {
  const downtime = formatDuration(durationMs);

  return (
    <Html>
      <Head />
      <Preview>{monitorName} has recovered — back online</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={statusBanner}>
            <Text style={statusDot}>●</Text>
            <Text style={statusText}>Monitor Recovered</Text>
          </Section>

          <Heading style={heading}>Recovery Alert</Heading>

          <Text style={paragraph}>
            <strong>{monitorName}</strong> is back online.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong>Monitor:</strong> {monitorName}
            </Text>
            <Text style={detailRow}>
              <strong>URL:</strong>{' '}
              <Link href={monitorUrl} style={link}>
                {monitorUrl}
              </Link>
            </Text>
            <Text style={detailRow}>
              <strong>Total downtime:</strong> {downtime}
            </Text>
            <Text style={detailRow}>
              <strong>Incident ID:</strong> {incidentId}
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You are receiving this because you have alerts enabled for this monitor.
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

const statusBanner: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '24px',
};

const statusDot: React.CSSProperties = {
  color: '#16a34a',
  fontSize: '20px',
  margin: '0 8px 0 0',
  lineHeight: '1',
};

const statusText: React.CSSProperties = {
  color: '#16a34a',
  fontWeight: '600',
  fontSize: '14px',
  margin: '0',
};

const heading: React.CSSProperties = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '20px',
};

const detailRow: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 8px',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'none',
};

const hr: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '20px 0',
};

const footer: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};

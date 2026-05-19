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

export interface CompetitorChange {
  monitorName: string;
  monitorUrl: string;
  changedAt: Date;
  dashboardUrl: string;
  summary?: string;
  classification?: string;
}

export interface CompetitorDigestEmailProps {
  changes: CompetitorChange[];
  dashboardUrl: string;
  windowStart: Date;
  windowEnd: Date;
}

export function CompetitorDigestEmail({
  changes,
  dashboardUrl,
  windowStart,
  windowEnd,
}: CompetitorDigestEmailProps) {
  const dateRange = `${windowStart.toUTCString().slice(0, 16)} – ${windowEnd.toUTCString().slice(0, 16)} UTC`;

  return (
    <Html>
      <Head />
      <Preview>
        {`${changes.length} competitor change${changes.length !== 1 ? 's' : ''} detected in the last 24 hours`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoBanner}>
            <Text style={logoText}>Beaconmon</Text>
          </Section>

          <Heading style={heading}>Competitor Intelligence Digest</Heading>

          <Text style={paragraph}>
            {changes.length} change{changes.length !== 1 ? 's were' : ' was'} detected across your
            tracked competitors in the past 24 hours ({dateRange}).
          </Text>

          {changes.map((change, i) => (
            <Section key={String(i)} style={changeCard}>
              <Text style={changeTitle}>
                {change.monitorName}
                {change.classification ? (
                  <span style={classificationTag}>{change.classification}</span>
                ) : null}
              </Text>
              <Text style={changeUrl}>{change.monitorUrl}</Text>
              {change.summary ? (
                <Text style={changeSummary}>{change.summary}</Text>
              ) : null}
              <Text style={changeMeta}>
                Detected at {change.changedAt.toUTCString()}
              </Text>
              <Button style={viewButton} href={change.dashboardUrl}>
                View diff →
              </Button>
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Open Competitor Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            You&apos;re receiving this because you have competitor monitors in Beaconmon.
            To stop these emails, disable competitor tracking or remove the monitors from your dashboard.
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

const changeCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '12px',
};

const changeTitle: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const changeUrl: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 4px',
  wordBreak: 'break-all',
};

const changeSummary: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '6px 0 6px',
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

const changeMeta: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '0 0 8px',
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

const button: React.CSSProperties = {
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

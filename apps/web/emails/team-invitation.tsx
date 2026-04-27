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

export interface TeamInvitationProps {
  inviterName: string;
  teamName: string;
  role: string;
  inviteUrl: string;
}

export function TeamInvitation({ inviterName, teamName, role, inviteUrl }: TeamInvitationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {teamName} on Beaconmon
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoBanner}>
            <Text style={logoText}>Beaconmon</Text>
          </Section>

          <Heading style={heading}>You&apos;ve been invited</Heading>

          <Text style={paragraph}>
            <strong>{inviterName}</strong> has invited you to join the{' '}
            <strong>{teamName}</strong> workspace on Beaconmon as a{' '}
            <strong>{role}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Accept invitation
            </Button>
          </Section>

          <Text style={urlHint}>
            Or copy this link into your browser:{' '}
            <span style={urlText}>{inviteUrl}</span>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This invitation expires in 7 days. If you did not expect this invitation, you can
            safely ignore this email.
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
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const buttonContainer: React.CSSProperties = {
  marginBottom: '20px',
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

const urlHint: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 20px',
};

const urlText: React.CSSProperties = {
  color: '#2563eb',
  wordBreak: 'break-all',
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

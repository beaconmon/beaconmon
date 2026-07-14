import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EP, SANS, MONO, EMAIL_DARK_STYLE } from './tokens';

// Email design system.
// Literal inline hex (email clients strip CSS vars). Single 600px container.
// Wraps every Beaconmon email so they read like one cohesive briefing.

// ───────── Layout shell ─────────

export interface EmailLayoutProps {
  preview: string;
  context?: string;
  children: React.ReactNode;
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: EP.page,
  fontFamily: SANS,
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: EP.paper,
  margin: '32px auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(11,13,20,0.04)',
};

const brandRule: React.CSSProperties = {
  height: '3px',
  backgroundColor: EP.brand,
  lineHeight: '3px',
  fontSize: '0',
};

const innerStyle: React.CSSProperties = {
  padding: '40px',
};

export function EmailLayout({ preview, context, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{EMAIL_DARK_STYLE}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle} className="em-page">
        <Container style={containerStyle} className="em-paper">
          <div style={brandRule}>&nbsp;</div>
          <Section style={innerStyle}>
            <Masthead context={context} />
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ───────── Masthead ─────────

const mastheadOuter: React.CSSProperties = {
  paddingBottom: '24px',
  marginBottom: '28px',
  borderBottom: `1px solid ${EP.line}`,
};

const mastheadRow: React.CSSProperties = {
  width: '100%',
};

const mastheadLogoCell: React.CSSProperties = {
  textAlign: 'left',
  verticalAlign: 'middle',
};

const mastheadContextCell: React.CSSProperties = {
  textAlign: 'right',
  verticalAlign: 'middle',
  fontFamily: MONO,
  fontSize: '10.5px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.13em',
  color: EP.muted,
};

const wordmark: React.CSSProperties = {
  fontSize: '15.5px',
  fontWeight: 700,
  color: EP.ink,
  letterSpacing: '-0.01em',
  verticalAlign: 'middle',
  marginLeft: '9px',
};

function BeaconMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle' }}
    >
      <rect width="32" height="32" rx="7" fill="#f0f9ff" />
      <path d="M4 22a12 12 0 0 0 24 0" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
      <path d="M8 22a8 8 0 0 0 16 0" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" opacity="0.62" />
      <path d="M12 22a4 4 0 0 0 8 0" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="24.5" x2="16" y2="28" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <circle cx="16" cy="22" r="2.5" fill="#0284c7" />
    </svg>
  );
}

export function Masthead({ context }: { context?: string }) {
  return (
    <Section style={mastheadOuter} className="em-line">
      <table style={mastheadRow} role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td style={mastheadLogoCell}>
              <BeaconMark />
              <span style={wordmark} className="em-ink">Beaconmon</span>
            </td>
            {context && (
              <td style={mastheadContextCell} className="em-muted-c">
                {context}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ───────── Footer ─────────

export interface EmailFooterProps {
  reason: string;
  manageUrl?: string;
  manageLabel?: string;
  unsubscribeUrl?: string;
}

export function EmailFooter({
  reason,
  manageUrl,
  manageLabel = 'Manage preferences',
  unsubscribeUrl,
}: EmailFooterProps) {
  return (
    <Section
      style={{
        borderTop: `1px solid ${EP.line}`,
        marginTop: '10px',
        paddingTop: '24px',
      }}
      className="em-line"
    >
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: '12px' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'middle' }}>
              <BeaconMark size={15} />
            </td>
            <td style={{ verticalAlign: 'middle', paddingLeft: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: EP.ink }} className="em-ink">
                Beaconmon
              </span>
              <span
                style={{ fontSize: '11.5px', color: EP.faint, marginLeft: '7px' }}
                className="em-faint-c"
              >
                · Competitor intelligence for eCommerce
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <Text
        style={{ margin: '0 0 9px', fontSize: '11.5px', lineHeight: 1.58, color: EP.muted }}
        className="em-muted-c"
      >
        {reason}
      </Text>
      <Text
        style={{ margin: 0, fontSize: '11.5px', lineHeight: 1.5, color: EP.muted }}
        className="em-muted-c"
      >
        {manageUrl && (
          <Link
            href={manageUrl}
            style={{ color: EP.brandDeep, fontWeight: 600, textDecoration: 'none' }}
          >
            {manageLabel}
          </Link>
        )}
        {manageUrl && unsubscribeUrl && ' · '}
        {unsubscribeUrl && (
          <Link
            href={unsubscribeUrl}
            style={{ color: EP.brandDeep, fontWeight: 600, textDecoration: 'none' }}
          >
            Unsubscribe
          </Link>
        )}
      </Text>
    </Section>
  );
}

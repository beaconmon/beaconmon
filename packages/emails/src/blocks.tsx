import * as React from 'react';
import { Link, Section, Text } from '@react-email/components';
import { EP, MONO, SANS, SEV, type Severity } from './tokens';
import { type BadgeKind, Badge } from './badge';
import { MonoVal } from './typography';

// ───────── AlertBanner ─────────

export function AlertBanner({
  sev = 'info',
  label,
  tag,
}: {
  sev?: Severity;
  label: string;
  tag?: { kind: BadgeKind; text?: string };
}) {
  const s = SEV[sev];
  return (
    <Section
      style={{
        backgroundColor: s.soft,
        borderRadius: '9px',
        borderLeft: `3px solid ${s.c}`,
        padding: '12px 15px',
        marginBottom: '22px',
      }}
    >
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'middle' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: s.ink,
                  letterSpacing: '-0.005em',
                }}
              >
                {label}
              </span>
            </td>
            {tag && (
              <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                <Badge kind={tag.kind} text={tag.text} />
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ───────── EventCard ─────────

export interface EventCardProps {
  name: string;
  host: string;
  badge?: BadgeKind;
  summary?: string | null;
  delta?: string | null;
  time?: string;
  actionLabel?: string;
  actionUrl?: string;
  sev?: Severity;
}

export function EventCard({
  name,
  host,
  badge,
  summary,
  delta,
  time,
  actionLabel,
  actionUrl,
  sev,
}: EventCardProps) {
  const accent = sev ? SEV[sev].c : null;
  const deltaColor = sev ? SEV[sev].ink : EP.infoInk;
  const initial = name.charAt(0).toUpperCase();
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${EP.line}`,
        borderRadius: '9px',
        padding: '13px 15px',
        marginBottom: '9px',
      }}
    >
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ width: '30px', verticalAlign: 'top' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: EP.paper,
                  border: `1px solid ${EP.line2}`,
                  fontWeight: 700,
                  fontSize: '13px',
                  color: EP.body,
                  textAlign: 'center',
                  lineHeight: '30px',
                }}
              >
                {initial}
              </div>
            </td>
            <td style={{ paddingLeft: '10px', verticalAlign: 'top' }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: EP.ink,
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  margin: '1px 0 0',
                  fontFamily: MONO,
                  fontSize: '11px',
                  color: EP.muted,
                  wordBreak: 'break-all',
                }}
              >
                {host}
              </Text>
            </td>
            {badge && (
              <td style={{ verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Badge kind={badge} />
              </td>
            )}
          </tr>
          {summary && (
            <tr>
              <td colSpan={badge ? 3 : 2} style={{ paddingTop: '8px' }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    color: EP.body,
                    paddingLeft: '40px',
                  }}
                >
                  {summary}
                  {delta && (
                    <>
                      {' '}
                      <MonoVal color={deltaColor}>{delta}</MonoVal>
                    </>
                  )}
                </Text>
              </td>
            </tr>
          )}
          {(time || (actionLabel && actionUrl)) && (
            <tr>
              <td colSpan={badge ? 3 : 2} style={{ paddingTop: '6px', paddingLeft: '40px' }}>
                <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontFamily: MONO,
                          fontSize: '10.5px',
                          color: EP.faint,
                        }}
                      >
                        {time}
                      </td>
                      {actionLabel && actionUrl && (
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            href={actionUrl}
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: EP.brandDeep,
                              textDecoration: 'none',
                            }}
                          >
                            {actionLabel} →
                          </Link>
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Section>
  );
}

// ───────── DigestSection ─────────

export function DigestSection({
  label,
  count,
  tone = 'muted',
  children,
}: {
  label: string;
  count?: number | string;
  tone?: 'muted' | 'crit' | 'pos';
  children: React.ReactNode;
}) {
  const col = tone === 'crit' ? EP.crit : tone === 'pos' ? EP.brandDeep : EP.muted;
  return (
    <Section style={{ marginBottom: '22px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', marginBottom: '11px' }}>
        <tbody>
          <tr>
            <td style={{ width: '14px', verticalAlign: 'middle' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: col,
                }}
              />
            </td>
            <td style={{ paddingLeft: '6px', verticalAlign: 'middle' }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: EP.ink,
                }}
              >
                {label}
              </span>
              {count != null && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontFamily: MONO,
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: EP.muted,
                    backgroundColor: EP.surface2,
                    padding: '1px 7px',
                    borderRadius: '999px',
                  }}
                >
                  {count}
                </span>
              )}
            </td>
            <td
              style={{
                paddingLeft: '8px',
                verticalAlign: 'middle',
              }}
            >
              <div style={{ height: '1px', backgroundColor: EP.line, width: '100%' }} />
            </td>
          </tr>
        </tbody>
      </table>
      {children}
    </Section>
  );
}

// ───────── TopSignal ─────────

export function TopSignal({
  sev = 'warning',
  label = 'Top signal',
  title,
  body,
}: {
  sev?: Severity;
  label?: string;
  title: string;
  body: React.ReactNode;
}) {
  const s = SEV[sev];
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderLeft: `3px solid ${s.c}`,
        borderRadius: '9px',
        padding: '15px 16px',
        marginBottom: '26px',
      }}
    >
      <Text
        style={{
          margin: '0 0 7px',
          fontFamily: MONO,
          fontSize: '10.5px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: s.ink,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: '0 0 4px',
          fontSize: '15px',
          fontWeight: 600,
          color: EP.ink,
        }}
      >
        {title}
      </Text>
      <Text style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.55, color: EP.body }}>
        {body}
      </Text>
    </Section>
  );
}

// ───────── DetailBox ─────────

export interface DetailRow {
  k: string;
  v: React.ReactNode;
  color?: string;
  mono?: boolean;
  break?: boolean;
}

export function DetailBox({ rows }: { rows: DetailRow[] }) {
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderRadius: '9px',
        padding: '6px 16px',
        marginBottom: '22px',
      }}
    >
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: '9px 0',
                  borderTop: i ? `1px solid ${EP.line}` : 'none',
                  fontSize: '12.5px',
                  color: EP.muted,
                  verticalAlign: 'top',
                }}
              >
                {r.k}
              </td>
              <td
                style={{
                  padding: '9px 0',
                  borderTop: i ? `1px solid ${EP.line}` : 'none',
                  fontFamily: r.mono === false ? SANS : MONO,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: r.color ?? EP.ink,
                  textAlign: 'right',
                  wordBreak: r.break ? 'break-all' : 'normal',
                  verticalAlign: 'top',
                }}
              >
                {r.v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

// ───────── Button ─────────

export type BtnVariant = 'primary' | 'green' | 'outline';

const BTN_STYLES: Record<BtnVariant, React.CSSProperties> = {
  primary: { backgroundColor: EP.inkBtn, color: '#FFFFFF' },
  green: { backgroundColor: EP.brand, color: EP.brandInk },
  outline: { backgroundColor: EP.paper, color: EP.ink, border: `1px solid ${EP.line2}` },
};

export function EBtn({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: BtnVariant;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        textAlign: 'center',
        padding: '13px 26px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '-0.005em',
        textDecoration: 'none',
        ...BTN_STYLES[variant],
      }}
    >
      {children}
    </Link>
  );
}

export function BtnRow({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ margin: '4px 0 24px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            {React.Children.map(children, (child, i) => (
              <td key={i} style={{ paddingRight: '10px', verticalAlign: 'middle' }}>
                {child}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ───────── StepRow ─────────

export function StepRow({
  n,
  title,
  body,
  last,
}: {
  n: number | string;
  title: string;
  body: React.ReactNode;
  last?: boolean;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ width: '100%', marginBottom: last ? 0 : '16px' }}
    >
      <tbody>
        <tr>
          <td style={{ width: '26px', verticalAlign: 'top', paddingTop: '1px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '999px',
                backgroundColor: EP.surface2,
                border: `1px solid ${EP.line2}`,
                fontFamily: MONO,
                fontSize: '12px',
                fontWeight: 700,
                color: EP.brandDeep,
                textAlign: 'center',
                lineHeight: '24px',
              }}
            >
              {n}
            </div>
          </td>
          <td style={{ paddingLeft: '13px', verticalAlign: 'top' }}>
            <Text style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: EP.ink }}>
              {title}
            </Text>
            <Text style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.55, color: EP.body }}>
              {body}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ───────── StatStrip (3-up) ─────────

export interface Stat {
  n: string;
  label: string;
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  const w = stats.length > 0 ? `${Math.floor(100 / stats.length)}%` : '100%';
  return (
    <Section style={{ marginBottom: '24px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            {stats.map((s, i) => (
              <td
                key={i}
                style={{
                  width: w,
                  padding: i === stats.length - 1 ? 0 : '0 10px 0 0',
                  verticalAlign: 'top',
                }}
              >
                <div
                  style={{
                    backgroundColor: EP.surface,
                    border: `1px solid ${EP.line}`,
                    borderRadius: '9px',
                    padding: '14px 12px',
                    textAlign: 'center',
                  }}
                >
                  <Text
                    style={{
                      margin: '0 0 3px',
                      fontFamily: MONO,
                      fontSize: '22px',
                      fontWeight: 700,
                      color: EP.ink,
                    }}
                  >
                    {s.n}
                  </Text>
                  <Text style={{ margin: 0, fontSize: '11px', lineHeight: 1.3, color: EP.muted }}>
                    {s.label}
                  </Text>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ───────── DurationBox ─────────

export function DurationBox({ duration, label }: { duration: string; label: string }) {
  return (
    <Section
      style={{
        textAlign: 'center',
        backgroundColor: EP.posSoft,
        border: `1px solid ${EP.pos}33`,
        borderRadius: '10px',
        padding: '20px 16px',
        marginBottom: '22px',
      }}
    >
      <Text
        style={{
          margin: '0 0 4px',
          fontFamily: MONO,
          fontSize: '32px',
          fontWeight: 700,
          color: EP.posInk,
          letterSpacing: '-0.02em',
        }}
      >
        {duration}
      </Text>
      <Text
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: '10.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: EP.muted,
        }}
      >
        {label}
      </Text>
    </Section>
  );
}

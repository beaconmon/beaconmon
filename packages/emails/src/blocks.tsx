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
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '24px',
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
  const deltaSev = sev ?? 'info';
  const deltaColor = SEV[deltaSev].ink;
  const initial = name.charAt(0).toUpperCase();
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '11px',
      }}
      className="em-surface em-line"
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
                className="em-paper em-line2 em-body-c"
              >
                {initial}
              </div>
            </td>
            <td style={{ paddingLeft: '11px', verticalAlign: 'top' }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: EP.ink,
                }}
                className="em-ink"
              >
                {name}
              </Text>
              <Text
                style={{
                  margin: '2px 0 0',
                  fontFamily: MONO,
                  fontSize: '11px',
                  color: EP.muted,
                  wordBreak: 'break-all',
                }}
                className="em-muted-c"
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
              <td colSpan={badge ? 3 : 2} style={{ paddingTop: '10px' }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    color: EP.body,
                    paddingLeft: '41px',
                  }}
                  className="em-body-c"
                >
                  {summary}
                  {delta && (
                    <>
                      {' '}
                      <MonoVal color={deltaColor} sev={deltaSev}>{delta}</MonoVal>
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
                        className="em-faint-c"
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
    <Section style={{ marginBottom: '26px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', marginBottom: '13px' }}>
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
            <td style={{ paddingLeft: '7px', verticalAlign: 'middle' }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: EP.ink,
                }}
                className="em-ink"
              >
                {label}
              </span>
              {count != null && (
                <span
                  style={{
                    marginLeft: '9px',
                    fontFamily: MONO,
                    fontSize: '10px',
                    fontWeight: 700,
                    color: EP.muted,
                    backgroundColor: EP.surface2,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                  className="em-muted-c em-surface2"
                >
                  {count}
                </span>
              )}
            </td>
            <td
              style={{
                paddingLeft: '10px',
                verticalAlign: 'middle',
              }}
            >
              <div
                style={{ height: '1px', backgroundColor: EP.line, width: '100%' }}
                className="em-line-bg"
              />
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
        borderRadius: '10px',
        padding: '16px 17px',
        marginBottom: '28px',
      }}
      className="em-surface em-line"
    >
      <Text
        style={{
          margin: '0 0 8px',
          fontFamily: MONO,
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: s.ink,
        }}
        className={`em-sev-ink-${sev}`}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: '0 0 5px',
          fontSize: '15.5px',
          fontWeight: 600,
          color: EP.ink,
        }}
        className="em-ink"
      >
        {title}
      </Text>
      <Text
        style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.58, color: EP.body }}
        className="em-body-c"
      >
        {body}
      </Text>
    </Section>
  );
}

// ───────── DetailBox ─────────

export interface DetailRow {
  k: string;
  v: React.ReactNode;
  sev?: Severity;
  mono?: boolean;
  break?: boolean;
}

export function DetailBox({ rows }: { rows: DetailRow[] }) {
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderRadius: '10px',
        padding: '8px 17px',
        marginBottom: '24px',
      }}
      className="em-surface em-line"
    >
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: '11px 0',
                  borderTop: i ? `1px solid ${EP.line}` : 'none',
                  fontSize: '12.5px',
                  color: EP.muted,
                  verticalAlign: 'top',
                }}
                className={i ? 'em-line em-muted-c' : 'em-muted-c'}
              >
                {r.k}
              </td>
              <td
                style={{
                  padding: '11px 0',
                  borderTop: i ? `1px solid ${EP.line}` : 'none',
                  fontFamily: r.mono === false ? SANS : MONO,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: r.sev ? SEV[r.sev].ink : EP.ink,
                  textAlign: 'right',
                  wordBreak: r.break ? 'break-all' : 'normal',
                  verticalAlign: 'top',
                }}
                className={[i ? 'em-line' : '', r.sev ? `em-sev-ink-${r.sev}` : 'em-ink']
                  .filter(Boolean)
                  .join(' ')}
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

const BTN_DARK_CLASS: Record<BtnVariant, string | undefined> = {
  primary: 'em-btn-primary',
  green: undefined,
  outline: 'em-paper em-ink em-line2',
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
        padding: '12px 28px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '-0.005em',
        textDecoration: 'none',
        ...BTN_STYLES[variant],
      }}
      className={BTN_DARK_CLASS[variant]}
    >
      {children}
    </Link>
  );
}

export function BtnRow({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ margin: '6px 0 26px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            {React.Children.map(children, (child, i) => (
              <td key={i} style={{ paddingRight: '11px', verticalAlign: 'middle' }}>
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
      style={{ width: '100%', marginBottom: last ? 0 : '18px' }}
    >
      <tbody>
        <tr>
          <td style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '999px',
                backgroundColor: EP.surface2,
                border: `1px solid ${EP.line2}`,
                fontFamily: MONO,
                fontSize: '12.5px',
                fontWeight: 700,
                color: EP.brandDeep,
                textAlign: 'center',
                lineHeight: '26px',
              }}
              className="em-surface2 em-line2"
            >
              {n}
            </div>
          </td>
          <td style={{ paddingLeft: '14px', verticalAlign: 'top' }}>
            <Text
              style={{ margin: '0 0 3px', fontSize: '14.5px', fontWeight: 600, color: EP.ink }}
              className="em-ink"
            >
              {title}
            </Text>
            <Text
              style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.58, color: EP.body }}
              className="em-body-c"
            >
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
    <Section style={{ marginBottom: '26px' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            {stats.map((s, i) => (
              <td
                key={i}
                style={{
                  width: w,
                  padding: i === stats.length - 1 ? 0 : '0 11px 0 0',
                  verticalAlign: 'top',
                }}
              >
                <div
                  style={{
                    backgroundColor: EP.surface,
                    border: `1px solid ${EP.line}`,
                    borderRadius: '10px',
                    padding: '16px 13px',
                    textAlign: 'center',
                  }}
                  className="em-surface em-line"
                >
                  <Text
                    style={{
                      margin: '0 0 4px',
                      fontFamily: MONO,
                      fontSize: '23px',
                      fontWeight: 700,
                      color: EP.ink,
                    }}
                    className="em-ink"
                  >
                    {s.n}
                  </Text>
                  <Text
                    style={{ margin: 0, fontSize: '11px', lineHeight: 1.4, color: EP.muted }}
                    className="em-muted-c"
                  >
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
        padding: '22px 17px',
        marginBottom: '24px',
      }}
    >
      <Text
        style={{
          margin: '0 0 5px',
          fontFamily: MONO,
          fontSize: '33px',
          fontWeight: 700,
          color: EP.posInk,
          letterSpacing: '-0.025em',
        }}
      >
        {duration}
      </Text>
      <Text
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: EP.muted,
        }}
      >
        {label}
      </Text>
    </Section>
  );
}

// ───────── SignalMix ─────────
// At-a-glance triage bar for digests: a proportional strip built from counts
// that are already on the page (never invented), grouped into urgent/watch/fyi
// tiers. Table cells, not SVG — Outlook desktop doesn't render inline SVG.

export interface SignalMixSegment {
  label: string;
  count: number;
  color: string;
}

export function SignalMix({ segments }: { segments: SignalMixSegment[] }) {
  const withShare = segments.filter((s) => s.count > 0);
  const total = withShare.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  return (
    <Section style={{ marginBottom: '24px' }}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <tbody>
          <tr>
            {withShare.map((s, i) => (
              <td
                key={i}
                style={{
                  width: `${Math.max((s.count / total) * 100, 4)}%`,
                  height: '7px',
                  fontSize: '0',
                  lineHeight: '7px',
                  backgroundColor: s.color,
                  borderRadius:
                    i === 0
                      ? '4px 0 0 4px'
                      : i === withShare.length - 1
                      ? '0 4px 4px 0'
                      : '0',
                }}
              >
                &nbsp;
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ width: '100%', marginTop: '10px' }}
      >
        <tbody>
          <tr>
            {withShare.map((s, i) => (
              <td
                key={i}
                style={{
                  paddingRight: i === withShare.length - 1 ? 0 : '16px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    backgroundColor: s.color,
                    marginRight: '6px',
                  }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: EP.muted,
                  }}
                  className="em-muted-c"
                >
                  {s.count} {s.label}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

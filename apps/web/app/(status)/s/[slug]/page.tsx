// Public status page — ISR with 30-second revalidation.
// Data is served from Redis cache, NOT directly from Postgres.
// See architecture rule #8 in CLAUDE.md.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStatusPageData } from '@/lib/cache/status-pages';
import { SubscribeForm } from '@/components/status/subscribe-form';
import { PastIncidentCard } from '@/components/status/past-incident-card';
import type { DailyUptimeStat, StatusPageMonitorData } from '@beaconmon/types';

export const revalidate = 30;

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Colour tokens (always light-mode) ────────────────────────────────────────
const SP = {
  bg: '#FFFFFF',
  bgSubtle: '#FAFAFA',
  bgMuted: '#F3F4F6',
  border: '#E5E7EB',
  borderMuted: '#F1F2F4',
  gray900: '#0F172A',
  gray700: '#334155',
  gray600: '#475569',
  gray500: '#64748B',
  gray400: '#94A3B8',
  gray300: '#CBD5E1',
  green: '#00C26A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  greenText: '#047857',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  amberText: '#B45309',
  red: '#EF4444',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  redText: '#B91C1C',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
}

function uptimeColor(pct: number): string {
  if (pct >= 99.9) return SP.greenText;
  if (pct >= 99) return SP.amberText;
  return SP.redText;
}

function barColor(state: DailyUptimeStat['state']): string {
  if (state === 'up') return SP.green;
  if (state === 'degraded') return SP.amber;
  if (state === 'outage') return SP.red;
  return SP.border; // nodata
}

function barTooltipText(stat: DailyUptimeStat): string {
  if (stat.state === 'nodata') return `${stat.date} — No data`;
  if (stat.state === 'outage') return `${stat.date} — Outage`;
  if (stat.state === 'degraded') return `${stat.date} — Degraded (${stat.uptimePercent.toFixed(2)}% uptime)`;
  return `${stat.date} — ${stat.uptimePercent.toFixed(2)}% uptime`;
}

function pageInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Active incident derivation ───────────────────────────────────────────────
interface ActiveIncidentData {
  title: string;
  isMajor: boolean;
  startedAt: Date;
  affectedNames: string[];
}

function deriveActiveIncident(monitors: StatusPageMonitorData[]): ActiveIncidentData | null {
  const affected = monitors.filter(
    (m) => m.currentStatus === 'down' && m.recentIncidents.some((i) => !i.resolvedAt)
  );
  if (affected.length === 0) return null;

  const affectedNames = affected.map((m) => m.name);
  const earliestStart = affected
    .flatMap((m) => m.recentIncidents.filter((i) => !i.resolvedAt))
    .map((i) => new Date(i.startedAt))
    .sort((a, b) => a.getTime() - b.getTime())[0]!;

  const title =
    affected.length === 1
      ? `Outage — ${affectedNames[0]}`
      : `Major outage — ${affectedNames.join(', ')} are unavailable`;

  return { title, isMajor: true, startedAt: earliestStart, affectedNames };
}

// ─── Past incidents grouping ──────────────────────────────────────────────────
interface PastIncidentEntry {
  id: string;
  monitorName: string;
  startedAt: string;
  resolvedAt: string;
  durationMs: number | null;
}

interface PastDay {
  dateStr: string;
  label: string;
  incidents: PastIncidentEntry[];
}

function buildPastDays(monitors: StatusPageMonitorData[], now: Date): PastDay[] {
  const days: PastDay[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    days.push({ dateStr, label, incidents: [] });
  }

  const dayIndex = new Map(days.map((d) => [d.dateStr, d]));

  for (const monitor of monitors) {
    for (const inc of monitor.recentIncidents) {
      if (!inc.resolvedAt) continue; // active — excluded from past section
      const dayStr = inc.startedAt.slice(0, 10);
      const day = dayIndex.get(dayStr);
      if (!day) continue; // outside 14-day window
      day.incidents.push({
        id: inc.id,
        monitorName: monitor.name,
        startedAt: inc.startedAt,
        resolvedAt: inc.resolvedAt,
        durationMs: inc.durationMs,
      });
    }
  }

  return days;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function StatusPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStatusPageData(slug);
  if (!data) notFound();

  const now = new Date();
  const cachedAt = new Date(data.cachedAt);
  const domain = data.customDomain ?? `${slug}.beaconmon.com`;
  const initials = pageInitials(data.name);
  const lastUpdated = relativeTime(cachedAt, now);
  const lastRefreshUTC = cachedAt.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const activeIncident = deriveActiveIncident(data.monitors);
  const pastDays = buildPastDays(data.monitors, now);

  const bannerConfig = {
    operational: {
      accent: SP.green,
      bg: SP.greenLight,
      border: SP.greenBorder,
      iconBg: SP.green,
      titleColor: SP.greenText,
      title: 'All systems operational',
      sub: `Last updated ${lastUpdated}`,
      showSpinner: false,
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    degraded: {
      accent: SP.amber,
      bg: SP.amberLight,
      border: SP.amberBorder,
      iconBg: SP.amber,
      titleColor: SP.amberText,
      title: `Partial outage · ${data.monitors.filter((m) => m.currentStatus === 'down').length} service(s) experiencing issues`,
      sub: `Last updated ${lastUpdated}`,
      showSpinner: true,
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    outage: {
      accent: SP.red,
      bg: SP.redLight,
      border: SP.redBorder,
      iconBg: SP.red,
      titleColor: SP.redText,
      title: 'Major outage in progress',
      sub: `We are aware and working to resolve this · Last updated ${lastUpdated}`,
      showSpinner: true,
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  } as const;

  const banner = bannerConfig[data.overallStatus];

  const monitorStatusMap = {
    up: { dot: SP.green, label: 'Operational', color: SP.greenText, pulse: true, bold: false },
    down: { dot: SP.red, label: 'Outage', color: SP.redText, pulse: false, bold: true },
    paused: { dot: SP.gray400, label: 'Maintenance', color: SP.gray500, pulse: false, bold: false },
  } as const;

  return (
    <div style={{
      minHeight: '100vh',
      background: SP.bgSubtle,
      color: SP.gray900,
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      colorScheme: 'light',
    }}>
      {/* Inject bar chart + animation CSS */}
      <style>{`
        @keyframes sp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.85); }
        }
        @keyframes sp-subtle-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .sp-bar-cell:hover .sp-tooltip {
          opacity: 1;
          transform: translate(-50%, -6px);
          pointer-events: auto;
        }
        .sp-bar-cell:hover .sp-bar {
          transform: scaleY(1.08);
        }
        .sp-dot-pulse {
          animation: sp-pulse 2.4s ease-in-out infinite;
        }
        .sp-spinner {
          animation: sp-subtle-pulse 1.4s ease-in-out infinite;
        }
        .sp-beacon-pulse {
          animation: sp-pulse 2s ease-out infinite;
        }
        @media (max-width: 640px) {
          .sp-page-header { padding: 14px 16px !important; }
          .sp-page-content { padding: 20px 16px 40px !important; }
          .sp-monitor-row { flex-wrap: wrap; gap: 10px !important; }
          .sp-monitor-name { min-width: 80px !important; max-width: 140px !important; }
          .sp-status-label { min-width: 70px !important; font-size: 12px !important; }
          .sp-subscribe-section { flex-direction: column !important; align-items: stretch !important; }
          .sp-subscribe-form { min-width: unset !important; width: 100% !important; }
          .sp-banner { padding: 16px !important; gap: 12px !important; }
          .sp-banner-icon { width: 36px !important; height: 36px !important; flex-shrink: 0; }
          .sp-banner-title { font-size: 17px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="sp-page-header" style={{
        background: 'white',
        borderBottom: `1px solid ${SP.border}`,
        padding: '18px 32px',
      }}>
        <div style={{
          maxWidth: 880, width: '100%', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo placeholder */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #111827, #374151)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: 0.2,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: SP.gray900, letterSpacing: -0.2, margin: 0 }}>
                {data.name}
              </h1>
              <div style={{
                fontSize: 11, color: SP.gray400, marginTop: 1,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              }}>
                {domain}
              </div>
            </div>
          </div>
          {!data.hideBranding && (
            <Link href="/" style={{
              fontSize: 12, color: SP.gray400, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span>Powered by</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ position: 'relative', width: 13, height: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="sp-beacon-pulse" style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: `1.5px solid ${SP.green}`, opacity: 0.4,
                  }} />
                  <span style={{
                    width: 6.5, height: 6.5, borderRadius: '50%',
                    background: SP.green,
                  }} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: SP.gray500, letterSpacing: -0.2 }}>
                  Beaconmon
                </span>
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <div className="sp-page-content" style={{ maxWidth: 880, margin: '0 auto', padding: '32px 32px 56px' }}>

        {/* Status banner */}
        <div className="sp-banner" style={{
          background: banner.bg,
          border: `1px solid ${banner.border}`,
          borderLeft: `4px solid ${banner.accent}`,
          borderRadius: 10,
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}>
          <div className="sp-banner-icon" style={{
            width: 44, height: 44, borderRadius: '50%',
            background: banner.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 14px ${banner.accent}44`,
          }}>
            {banner.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sp-banner-title" style={{
              fontSize: 20, fontWeight: 600, color: banner.titleColor,
              letterSpacing: -0.3, lineHeight: 1.2,
            }}>
              {banner.title}
            </div>
            <div style={{
              fontSize: 13, color: SP.gray600, marginTop: 5,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {banner.showSpinner && (
                <svg className="sp-spinner" width={12} height={12} viewBox="0 0 24 24"
                  fill="none" stroke={SP.gray500} strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4"/><path d="M12 18v4"/>
                  <path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/>
                  <path d="M2 12h4"/><path d="M18 12h4"/>
                  <path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/>
                </svg>
              )}
              {banner.sub}
            </div>
          </div>
        </div>

        {/* Active incident */}
        {activeIncident && (
          <section style={{ marginTop: 36 }}>
            <h2 style={{
              fontSize: 11, fontWeight: 600, color: SP.gray400,
              letterSpacing: 1.2, textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              Active incident
            </h2>
            <div style={{
              background: SP.redLight,
              border: `1px solid ${SP.redBorder}`,
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: SP.redText,
                  letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
                }}>
                  Major incident
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: SP.gray900,
                  letterSpacing: -0.2, lineHeight: 1.35,
                }}>
                  {activeIncident.title}
                </div>
                <div style={{
                  fontSize: 13, color: SP.gray600, marginTop: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke={SP.gray500} strokeWidth={2}
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Started {relativeTime(activeIncident.startedAt, now)}{' '}
                  <span style={{ color: SP.gray400 }}>
                    ({activeIncident.startedAt.toLocaleString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
                    })} UTC)
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: SP.gray500 }}>Affected:</span>
                {activeIncident.affectedNames.map((name) => (
                  <span key={name} style={{
                    fontSize: 12, fontWeight: 500, color: SP.gray700,
                    background: 'white', padding: '3px 9px', borderRadius: 999,
                    border: `1px solid ${SP.redBorder}`,
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        <section style={{ marginTop: 36 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 12,
          }}>
            <h2 style={{
              fontSize: 11, fontWeight: 600, color: SP.gray400,
              letterSpacing: 1.2, textTransform: 'uppercase', margin: 0,
            }}>
              Services
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: SP.gray500 }}>
              {([['Operational', SP.green], ['Degraded', SP.amber], ['Outage', SP.red]] as const).map(([label, color]) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            background: 'white',
            border: `1px solid ${SP.border}`,
            borderRadius: 10,
            padding: '4px 24px',
          }}>
            {data.monitors.map((monitor, idx) => {
              const ms = monitorStatusMap[monitor.currentStatus];
              const validStats = monitor.dailyStats.filter((s) => s.state !== 'nodata');
              const avgUptime = validStats.length > 0
                ? validStats.reduce((sum, s) => sum + s.uptimePercent, 0) / validStats.length
                : monitor.uptimePercent90d;
              const isLast = idx === data.monitors.length - 1;

              return (
                <div key={monitor.id} className="sp-monitor-row" style={{
                  padding: '18px 4px',
                  borderBottom: isLast ? 'none' : `1px solid ${SP.borderMuted}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  {/* Status dot */}
                  <span
                    className={ms.pulse ? 'sp-dot-pulse' : undefined}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: ms.dot, flexShrink: 0,
                      boxShadow: ms.pulse ? `0 0 6px ${ms.dot}88` : 'none',
                    }}
                  />

                  {/* Name */}
                  <div className="sp-monitor-name" style={{ flex: '0 0 auto', minWidth: 100, maxWidth: 180 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: SP.gray900, letterSpacing: -0.1 }}>
                      {monitor.name}
                    </div>
                  </div>

                  {/* Uptime bar */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {monitor.dailyStats.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 26 }}>
                          {monitor.dailyStats.map((stat, i) => (
                            <span
                              key={i}
                              className="sp-bar-cell"
                              style={{
                                position: 'relative', width: 3, height: 26,
                                display: 'inline-flex', alignItems: 'flex-end',
                              }}
                            >
                              <span
                                className="sp-bar"
                                style={{
                                  width: '100%', height: '100%',
                                  background: barColor(stat.state),
                                  borderRadius: 1.5,
                                  transition: 'transform 120ms ease',
                                  transformOrigin: 'center',
                                }}
                              />
                              <span
                                className="sp-tooltip"
                                style={{
                                  position: 'absolute', bottom: '100%', left: '50%',
                                  transform: 'translate(-50%, 0)',
                                  opacity: 0, pointerEvents: 'none',
                                  transition: 'opacity 120ms ease, transform 120ms ease',
                                  background: SP.gray900, color: 'white',
                                  padding: '6px 10px', borderRadius: 6,
                                  fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                                  fontFamily: 'Inter, sans-serif', zIndex: 5,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                }}
                              >
                                {barTooltipText(stat)}
                                <span style={{
                                  position: 'absolute', top: '100%', left: '50%', marginLeft: -4,
                                  width: 0, height: 0,
                                  borderLeft: '4px solid transparent',
                                  borderRight: '4px solid transparent',
                                  borderTop: `4px solid ${SP.gray900}`,
                                }} />
                              </span>
                            </span>
                          ))}
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', width: '100%',
                          fontSize: 10, color: SP.gray400, letterSpacing: 0.2,
                        }}>
                          <span>{monitor.dailyStats.length} days ago</span>
                          <span style={{
                            fontWeight: 600,
                            color: uptimeColor(avgUptime),
                            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                          }}>
                            {avgUptime.toFixed(2)}% uptime
                          </span>
                          <span>Today</span>
                        </div>
                      </>
                    ) : (
                      <span style={{
                        fontSize: 13, color: uptimeColor(monitor.uptimePercent90d),
                        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                        fontWeight: 600,
                      }}>
                        {monitor.uptimePercent90d.toFixed(2)}% uptime
                      </span>
                    )}
                  </div>

                  {/* Status label */}
                  <div className="sp-status-label" style={{
                    fontSize: 13, color: ms.color,
                    fontWeight: ms.bold ? 600 : 500,
                    minWidth: 90, textAlign: 'right', flexShrink: 0,
                  }}>
                    {ms.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Past incidents */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{
            fontSize: 11, fontWeight: 600, color: SP.gray400,
            letterSpacing: 1.2, textTransform: 'uppercase', margin: '0 0 12px',
          }}>
            Past incidents
          </h2>
          <div style={{ padding: '0 4px' }}>
            {pastDays.map((day, i) => (
              <div key={day.dateStr} style={{
                padding: '18px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${SP.borderMuted}`,
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: SP.gray900,
                  marginBottom: day.incidents.length > 0 ? 0 : 0,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {day.label}
                  {day.incidents.length === 0 && (
                    <span style={{ fontSize: 12, fontWeight: 400, color: SP.gray400 }}>
                      — No incidents reported
                    </span>
                  )}
                </div>
                {day.incidents.map((inc) => (
                  <PastIncidentCard
                    key={inc.id}
                    monitorName={inc.monitorName}
                    cause="Outage"
                    startedAt={inc.startedAt}
                    durationMs={inc.durationMs}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe */}
        <section style={{ marginTop: 44 }}>
          <div className="sp-subscribe-section" style={{
            background: 'white',
            border: `1px solid ${SP.border}`,
            borderRadius: 10,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: SP.bgMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke={SP.gray600} strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: SP.gray900, marginBottom: 2 }}>
                Get notified of incidents
              </div>
              <div style={{ fontSize: 13, color: SP.gray500 }}>
                Create a free account to get notified when the status changes.
              </div>
            </div>
            <div className="sp-subscribe-form" style={{ flexShrink: 0, minWidth: 260 }}>
              <SubscribeForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: 40, textAlign: 'center',
          fontSize: 12, color: SP.gray400,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          {/* Beaconmon logo */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ position: 'relative', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="sp-beacon-pulse" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1.5px solid ${SP.green}`, opacity: 0.4,
              }} />
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: SP.green,
              }} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: SP.gray500, letterSpacing: -0.2 }}>
              Beaconmon
            </span>
          </span>
          {!data.hideBranding && (
            <div>
              Powered by Beaconmon ·{' '}
              <Link href="/" style={{ color: SP.gray500, textDecoration: 'none' }}>beaconmon.com</Link>
            </div>
          )}
          <div style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10, color: SP.gray400,
          }}>
            Last refresh · {lastRefreshUTC}
          </div>
        </footer>
      </div>
    </div>
  );
}

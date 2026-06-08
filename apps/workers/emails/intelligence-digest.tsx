import * as React from 'react';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  Strong,
  MonoVal,
  DigestSection,
  EventCard,
  TopSignal,
  DetailBox,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
  badgeKindFromEventType,
  formatBriefDate,
  formatTimeUTC,
  formatRelativeAgo,
  hostnameFrom,
} from '@beaconmon/emails';

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
  return 1;
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
    case 'sale_started':
      return `Sale: $${payload.currentPrice} (was $${payload.compareAtPrice})`;
    case 'sale_ended':
      return `Sale ended (was $${payload.wasCompareAtPrice})`;
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

// Pick the highest-priority item to highlight as "Top signal".
// Critical incidents first, then high-significance competitor events,
// then any incident, then anything else.
function pickTopSignal(sections: IntelligenceDigestEmailProps['sections']): {
  title: string;
  body: string;
  sev: 'critical' | 'warning' | 'info';
} | null {
  const ongoingIncident = sections.incidents?.find((i) => !i.resolvedAt);
  if (ongoingIncident) {
    return {
      title: `${ongoingIncident.monitorName} is still down`,
      body: `Failing since ${ongoingIncident.startedAt.toUTCString().slice(5, 22)} UTC. Open the incident to triage.`,
      sev: 'critical',
    };
  }

  const highSig = sections.competitors?.find((c) =>
    c.classification === 'out_of_stock' ||
    c.classification === 'sale_started' ||
    c.classification === 'price_changed'
  );
  if (highSig) {
    return {
      title: `${highSig.monitorName}: ${highSig.diffSummary ?? 'competitor change detected'}`,
      body: `Detected ${formatRelativeAgo(highSig.capturedAt)}. Open the diff to see what changed.`,
      sev: 'warning',
    };
  }

  const resolvedIncident = sections.incidents?.[0];
  if (resolvedIncident) {
    return {
      title: `${resolvedIncident.monitorName} had an incident`,
      body: 'Recovered automatically. Open the timeline for details.',
      sev: 'info',
    };
  }

  const expiry = sections.expiry?.[0];
  if (expiry) {
    return {
      title: `${expiry.monitorName} ${expiry.type.toUpperCase()} expires in ${expiry.daysRemaining} days`,
      body: 'Renew before it lapses to avoid customer-visible breakage.',
      sev: 'warning',
    };
  }

  return null;
}

export function IntelligenceDigestEmail({
  frequency,
  windowStart,
  windowEnd,
  dashboardUrl,
  sections,
}: IntelligenceDigestEmailProps) {
  const label = frequency === 'daily' ? 'Daily Briefing' : 'Weekly Briefing';
  const totalEvents =
    (sections.incidents?.length ?? 0) +
    (sections.smartAlerts?.length ?? 0) +
    (sections.expiry?.length ?? 0) +
    (sections.competitors?.length ?? 0) +
    (sections.ownContent?.length ?? 0);

  const competitorCount = sections.competitors?.length ?? 0;
  const distinctCompetitors = new Set(sections.competitors?.map((c) => c.monitorId)).size;

  const preview =
    competitorCount > 0
      ? `${totalEvents} change${totalEvents !== 1 ? 's' : ''} across ${distinctCompetitors} competitor${distinctCompetitors !== 1 ? 's' : ''} overnight.`
      : `${totalEvents} event${totalEvents !== 1 ? 's' : ''} in the last ${frequency === 'daily' ? '24 hours' : '7 days'}.`;

  const top = pickTopSignal(sections);
  const dateContext = `${label} · ${formatBriefDate(windowStart)} · ${formatTimeUTC(windowEnd)}`;

  return (
    <EmailLayout preview={preview} context="Intelligence Digest">
      <Eyebrow>{dateContext}</Eyebrow>
      <H1>
        {totalEvents} {totalEvents === 1 ? 'change' : 'changes'}
        {competitorCount > 0 && distinctCompetitors > 0 && (
          <>
            {' across '}
            {distinctCompetitors} {distinctCompetitors === 1 ? 'competitor' : 'competitors'}
          </>
        )}{' '}
        {frequency === 'daily' ? 'overnight' : 'this week'}
      </H1>
      <Para style={{ margin: '0 0 22px' }}>
        Here is everything that moved across the monitors you track.
      </Para>

      {top && (
        <TopSignal sev={top.sev} title={top.title} body={top.body} />
      )}

      {sections.competitors && sections.competitors.length > 0 && (
        <DigestSection label="Competitor changes" count={sections.competitors.length}>
          {sections.competitors.slice(0, 3).map((change, i) => (
            <EventCard
              key={i}
              name={change.monitorName}
              host={hostnameFrom(change.monitorUrl)}
              badge={badgeKindFromEventType(change.classification)}
              sev={
                change.classification === 'out_of_stock'
                  ? 'critical'
                  : change.classification === 'sale_started' || change.classification === 'price_changed'
                  ? 'warning'
                  : 'info'
              }
              summary={change.diffSummary ?? undefined}
              time={formatRelativeAgo(change.capturedAt)}
              actionLabel="View diff"
              actionUrl={change.dashboardUrl}
            />
          ))}
          {sections.competitors.length > 3 && (
            <Para
              style={{
                margin: '2px 0 0',
                textAlign: 'center',
                fontFamily: MONO,
                fontSize: '11px',
                color: EP.muted,
              }}
            >
              + {sections.competitors.length - 3} more in the Wire
            </Para>
          )}
        </DigestSection>
      )}

      {sections.incidents && sections.incidents.length > 0 && (
        <DigestSection
          label="Uptime & incidents"
          count={sections.incidents.length}
          tone={sections.incidents.some((i) => !i.resolvedAt) ? 'crit' : 'pos'}
        >
          {sections.incidents.map((inc) => (
            <EventCard
              key={inc.id}
              name={inc.monitorName}
              host={hostnameFrom(inc.monitorUrl)}
              badge={inc.resolvedAt ? 'recovered' : 'down'}
              sev={inc.resolvedAt ? 'positive' : 'critical'}
              summary={
                inc.resolvedAt
                  ? 'Down briefly, recovered automatically.'
                  : 'Currently down, investigating.'
              }
              time={formatRelativeAgo(inc.startedAt)}
            />
          ))}
        </DigestSection>
      )}

      {sections.expiry && sections.expiry.length > 0 && (
        <DigestSection label="SSL & domain expiry" count={sections.expiry.length}>
          <DetailBox
            rows={sections.expiry.map((e) => ({
              k: e.monitorName,
              v: `${e.type.toUpperCase()} expires in ${e.daysRemaining} day${e.daysRemaining !== 1 ? 's' : ''}`,
              color: e.daysRemaining <= 7 ? EP.critInk : EP.warnInk,
              mono: false,
            }))}
          />
        </DigestSection>
      )}

      {sections.smartAlerts && sections.smartAlerts.length > 0 && (
        <DigestSection label="Performance alerts" count={sections.smartAlerts.length}>
          {sections.smartAlerts.map((a, i) => (
            <EventCard
              key={i}
              name={a.monitorName}
              host={hostnameFrom(a.monitorUrl)}
              badge="info"
              sev="info"
              summary="Response time elevated,"
              delta={`${a.responseTimeMs}ms`}
              time={formatRelativeAgo(a.checkedAt)}
            />
          ))}
        </DigestSection>
      )}

      {sections.ownContent && sections.ownContent.length > 0 && (
        <DigestSection label="Your content changes" count={sections.ownContent.length}>
          {sections.ownContent.slice(0, 3).map((c, i) => (
            <EventCard
              key={i}
              name={c.monitorName}
              host={hostnameFrom(c.monitorUrl)}
              badge="info"
              sev="info"
              summary={c.diffSummary ?? undefined}
              time={formatRelativeAgo(c.capturedAt)}
              actionLabel="View diff"
              actionUrl={c.dashboardUrl}
            />
          ))}
        </DigestSection>
      )}

      <BtnRow>
        <EBtn href={dashboardUrl} variant="primary">
          Open Intelligence Dashboard
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason={
          frequency === 'daily'
            ? 'You receive this because you configured a Daily Intelligence Digest. Change frequency or turn it off in your digest settings.'
            : 'You receive this because you configured a Weekly Intelligence Digest. Change frequency or turn it off in your digest settings.'
        }
        manageLabel="Digest settings"
        manageUrl={dashboardUrl}
      />
    </EmailLayout>
  );
}

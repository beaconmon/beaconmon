import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  Strong,
  EventCard,
  DetailBox,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  badgeKindFromEventType,
  formatBriefDateTimeUTC,
  formatRelativeAgo,
  hostnameFrom,
  type Severity,
  type BadgeKind,
} from '@beaconmon/emails';

export interface ContentChangeAlertProps {
  monitorName: string;
  monitorUrl: string;
  changedAt: Date;
  summary?: string;
  classification?: string;
  diffUrl?: string;
  muteUrl?: string;
  unsubscribeUrl?: string;
}

interface BannerCopy {
  sev: Severity;
  label: string;
  badge: BadgeKind;
  headline: string;
}

function deriveBannerCopy(classification: string | undefined, monitorName: string): BannerCopy {
  const host = monitorName;
  switch (classification) {
    case 'price_changed':
      return {
        sev: 'warning',
        label: 'Price drop detected',
        badge: 'priceDown',
        headline: `${host} just changed a price you track`,
      };
    case 'sale_started':
      return {
        sev: 'warning',
        label: 'Sale started',
        badge: 'sale',
        headline: `${host} launched a sale`,
      };
    case 'sale_ended':
      return {
        sev: 'info',
        label: 'Sale ended',
        badge: 'promo',
        headline: `${host} ended a sale`,
      };
    case 'out_of_stock':
      return {
        sev: 'critical',
        label: 'Product went out of stock',
        badge: 'stockout',
        headline: `${host} just sold out of a product you track`,
      };
    case 'back_in_stock':
      return {
        sev: 'positive',
        label: 'Back in stock',
        badge: 'restock',
        headline: `${host} restocked a product you track`,
      };
    case 'product_added':
      return {
        sev: 'info',
        label: 'New product listed',
        badge: 'newProduct',
        headline: `${host} added a new product`,
      };
    case 'product_removed':
      return {
        sev: 'info',
        label: 'Product removed',
        badge: 'removed',
        headline: `${host} removed a product`,
      };
    case 'promo_detected':
      return {
        sev: 'warning',
        label: 'Promotion detected',
        badge: 'promo',
        headline: `${host} pushed a new promotion`,
      };
    default:
      return {
        sev: 'info',
        label: 'Content change detected',
        badge: 'info',
        headline: `${host} changed`,
      };
  }
}

export function ContentChangeAlert({
  monitorName,
  monitorUrl,
  changedAt,
  summary,
  classification,
  diffUrl,
  muteUrl,
  unsubscribeUrl,
}: ContentChangeAlertProps) {
  const copy = deriveBannerCopy(classification, monitorName);
  const host = hostnameFrom(monitorUrl);
  const preview = summary
    ? `${monitorName} — ${summary}`
    : `${monitorName} — content change detected`;

  const detailRows = [
    { k: 'Competitor', v: monitorName, mono: false },
    { k: 'URL', v: monitorUrl, mono: true, break: true },
    ...(summary ? [{ k: 'Change', v: summary, mono: false }] : []),
    { k: 'Detected', v: formatBriefDateTimeUTC(changedAt) },
  ];

  return (
    <EmailLayout preview={preview} context="Competitor Alert">
      <AlertBanner
        sev={copy.sev}
        label={copy.label}
        tag={{ kind: badgeKindFromEventType(classification) }}
      />

      <H1>{copy.headline}</H1>

      <Para>
        Beaconmon detected a change on <Strong>{monitorName}</Strong>
        {classification === 'price_changed' && summary ? <>: {summary}.</> : '.'}
      </Para>

      <EventCard
        name={monitorName}
        host={host}
        badge={copy.badge}
        sev={copy.sev}
        summary={summary}
        time={`Detected ${formatRelativeAgo(changedAt)} · ${formatBriefDateTimeUTC(changedAt)}`}
        actionLabel={diffUrl ? 'View diff' : undefined}
        actionUrl={diffUrl}
      />

      <DetailBox rows={detailRows} />

      {(diffUrl || muteUrl) && (
        <BtnRow>
          {diffUrl && (
            <EBtn href={diffUrl} variant="primary">
              View the change
            </EBtn>
          )}
          {muteUrl && (
            <EBtn href={muteUrl} variant="outline">
              Mute this monitor
            </EBtn>
          )}
        </BtnRow>
      )}

      <EmailFooter
        reason="You receive this because you have alerts enabled for this monitor. Switch to a daily roll-up any time."
        manageLabel="Alert settings"
        manageUrl={diffUrl}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

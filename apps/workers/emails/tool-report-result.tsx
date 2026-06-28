import * as React from 'react';
import { Section, Text } from '@react-email/components';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  DigestSection,
  EventCard,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
  formatBriefDate,
} from '@beaconmon/emails';

export interface ToolReportChange {
  title: string;
  changeType: 'price_drop' | 'price_rise' | 'sale_started' | 'sale_ended' | 'added' | 'removed';
  oldPrice?: string;
  newPrice?: string;
  oldCompareAt?: string | null;
  newCompareAt?: string | null;
}

export interface ToolReportResultProps {
  domain: string;
  windowStart: Date;
  windowEnd: Date;
  changes: ToolReportChange[];
  signUpUrl: string;
}

function fmt(amount: string): string {
  const n = parseFloat(amount);
  return isFinite(n) ? `$${n.toFixed(2)}` : amount;
}

function changeLabel(c: ToolReportChange): string {
  switch (c.changeType) {
    case 'price_drop':
      return `${fmt(c.oldPrice!)} → ${fmt(c.newPrice!)}`;
    case 'price_rise':
      return `${fmt(c.oldPrice!)} → ${fmt(c.newPrice!)}`;
    case 'sale_started':
      return `Sale: ${fmt(c.newPrice!)} (was ${fmt(c.newCompareAt ?? c.oldPrice ?? '?')})`;
    case 'sale_ended':
      return 'Sale ended';
    case 'added':
      return 'Added to catalog';
    case 'removed':
      return 'Removed from catalog';
  }
}

export function ToolReportResult({ domain, windowStart, windowEnd, changes, signUpUrl }: ToolReportResultProps) {
  const total = changes.length;
  const preview =
    total === 0
      ? `${domain} held steady. No price changes, promos, or product changes detected this week.`
      : `${total} change${total !== 1 ? 's' : ''} detected on ${domain} in 7 days.`;

  const priceChanges = changes.filter((c) => c.changeType === 'price_drop' || c.changeType === 'price_rise');
  const saleChanges = changes.filter((c) => c.changeType === 'sale_started' || c.changeType === 'sale_ended');
  const added = changes.filter((c) => c.changeType === 'added');
  const removed = changes.filter((c) => c.changeType === 'removed');

  const dateRange = `${formatBriefDate(windowStart, 'UTC')} to ${formatBriefDate(windowEnd, 'UTC')}`;

  return (
    <EmailLayout preview={preview} context="Intelligence Report">
      <Eyebrow color={EP.brandDeep}>7-day report &middot; {dateRange}</Eyebrow>
      <H1>
        {total === 0 ? `${domain} held steady` : `${total} change${total !== 1 ? 's' : ''} on ${domain}`}
      </H1>

      {total === 0 ? (
        <Para>
          No price changes, promotions, or product additions were detected on {domain} during the 7-day window. That is
          useful intelligence: this competitor did not run any promotions or adjust pricing that week.
        </Para>
      ) : (
        <Para>Here is every change Beaconmon detected on {domain} over the past 7 days.</Para>
      )}

      {priceChanges.length > 0 && (
        <DigestSection label="Price changes" count={priceChanges.length}>
          {priceChanges.slice(0, 6).map((c, i) => (
            <EventCard
              key={i}
              name={c.title}
              host={domain}
              badge={c.changeType === 'price_drop' ? 'priceDown' : 'priceUp'}
              sev={c.changeType === 'price_drop' ? 'positive' : 'warning'}
              summary={changeLabel(c)}
              time=""
            />
          ))}
          {priceChanges.length > 6 && (
            <Para
              style={{ margin: '2px 0 0', textAlign: 'center', fontFamily: MONO, fontSize: '11px', color: EP.muted }}
            >
              + {priceChanges.length - 6} more price changes
            </Para>
          )}
        </DigestSection>
      )}

      {saleChanges.length > 0 && (
        <DigestSection label="Promotions" count={saleChanges.length}>
          {saleChanges.slice(0, 6).map((c, i) => (
            <EventCard
              key={i}
              name={c.title}
              host={domain}
              badge={c.changeType === 'sale_started' ? 'sale' : 'info'}
              sev={c.changeType === 'sale_started' ? 'warning' : 'info'}
              summary={changeLabel(c)}
              time=""
            />
          ))}
        </DigestSection>
      )}

      {added.length > 0 && (
        <DigestSection label="New products" count={added.length}>
          {added.slice(0, 6).map((c, i) => (
            <EventCard
              key={i}
              name={c.title}
              host={domain}
              badge="newProduct"
              sev="info"
              summary="Added to catalog"
              time=""
            />
          ))}
          {added.length > 6 && (
            <Para
              style={{ margin: '2px 0 0', textAlign: 'center', fontFamily: MONO, fontSize: '11px', color: EP.muted }}
            >
              + {added.length - 6} more new products
            </Para>
          )}
        </DigestSection>
      )}

      {removed.length > 0 && (
        <DigestSection label="Removed products" count={removed.length}>
          {removed.slice(0, 6).map((c, i) => (
            <EventCard
              key={i}
              name={c.title}
              host={domain}
              badge="removed"
              sev="info"
              summary="Removed from catalog"
              time=""
            />
          ))}
        </DigestSection>
      )}

      <Section style={{ marginTop: '28px', marginBottom: '8px' }}>
        <Text
          style={{
            margin: '0 0 6px',
            fontFamily: MONO,
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: EP.muted,
          }}
        >
          What happens next
        </Text>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: EP.body, lineHeight: '1.65' }}>
          This was your free 7-day window. {domain} will keep changing. Continuous monitoring catches every move
          the moment it happens, not a week later.
        </Text>
      </Section>

      <BtnRow>
        <EBtn href={signUpUrl} variant="primary">
          Keep watching {domain}
        </EBtn>
      </BtnRow>

      <EmailFooter
        reason={`You receive this because you requested a free 7-day competitor intelligence report on ${domain}.`}
        manageLabel="Beaconmon tools"
        manageUrl="https://beaconmon.com/tools"
      />
    </EmailLayout>
  );
}

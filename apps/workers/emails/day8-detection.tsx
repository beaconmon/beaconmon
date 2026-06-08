import * as React from 'react';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
} from '@beaconmon/emails';
import { Section, Text } from '@react-email/components';

export interface TopCompetitorEvent {
  competitorName: string;
  type: string;
  detectedAt: string;
}

export interface Day8DetectionProps {
  competitorEvents: number;
  topEvents: TopCompetitorEvent[];
  incidents: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    price_changed: 'Price change detected',
    promo_detected: 'Promotion detected',
    sale_started: 'Sale started',
    sale_ended: 'Sale ended',
    site_changed: 'Content change detected',
    product_added: 'New product listed',
    product_removed: 'Product removed',
    stock_changed: 'Stock level changed',
    out_of_stock: 'Out of stock',
    back_in_stock: 'Back in stock',
  };
  return labels[type] ?? type;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Day8Detection({
  competitorEvents,
  topEvents,
  incidents,
  appUrl,
  unsubscribeUrl,
}: Day8DetectionProps) {
  const hasCompetitorData = competitorEvents > 0;
  const hasIncidents = incidents > 0;

  let preview: string;
  let headingText: string;
  let bodyText: string;
  let ctaLabel: string;
  let ctaHref: string;

  if (hasCompetitorData) {
    const n = competitorEvents;
    preview = `${n} competitor signal${n === 1 ? '' : 's'} detected in your first week.`;
    headingText = 'Your competitors have been busy';
    bodyText = `In the past 7 days, Beaconmon detected ${n} competitor signal${n === 1 ? '' : 's'} for your team.`;
    ctaLabel = 'View all intelligence';
    ctaHref = `${appUrl}/wire`;
  } else if (hasIncidents) {
    const n = incidents;
    preview = `Beaconmon caught ${n} incident${n === 1 ? '' : 's'} while monitoring your sites.`;
    headingText = `Beaconmon caught ${n} incident${n === 1 ? '' : 's'} this week`;
    bodyText = `Your monitors flagged ${n} downtime incident${n === 1 ? '' : 's'} in the past 7 days. Beaconmon notified you in real time so you could act fast.`;
    ctaLabel = 'View incidents';
    ctaHref = `${appUrl}/incidents`;
  } else {
    preview = 'Your Beaconmon monitors have been running quietly this week.';
    headingText = 'Your monitors are running quietly';
    bodyText =
      'No competitor changes or downtime incidents in the past 7 days. Things look healthy. If you want more signal, try adding a competitor to track.';
    ctaLabel = 'Track a competitor';
    ctaHref = `${appUrl}/wire?tab=competitors`;
  }

  return (
    <EmailLayout preview={preview} context="Day 8 · Week 1 recap">
      <Eyebrow>Day 8 · Week 1 recap</Eyebrow>
      <H1>{headingText}</H1>
      <Para>{bodyText}</Para>

      {hasCompetitorData && topEvents.length > 0 && (
        <Section style={{ marginBottom: '20px' }}>
          {topEvents.map((event, i) => (
            <Section
              key={i}
              style={{
                borderLeft: `3px solid ${EP.brand}`,
                paddingLeft: '12px',
                marginBottom: '12px',
              }}
            >
              <Text
                style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 650, color: EP.ink }}
              >
                {formatEventType(event.type)}
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: '12px',
                  color: EP.muted,
                }}
              >
                {event.competitorName} · {formatDate(event.detectedAt)}
              </Text>
            </Section>
          ))}
        </Section>
      )}

      <BtnRow>
        <EBtn href={ctaHref} variant="primary">
          {ctaLabel}
        </EBtn>
      </BtnRow>

      <Section
        style={{
          backgroundColor: EP.surface,
          border: `1px solid ${EP.line}`,
          borderRadius: '9px',
          padding: '14px 16px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            margin: '0 0 8px',
            fontFamily: MONO,
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: EP.muted,
          }}
        >
          Unlock more with Growth
        </Text>
        <Text style={{ margin: '0 0 5px', fontSize: '13px', lineHeight: 1.5, color: EP.body }}>
          · 100 monitors, 1-min intervals, 5 check locations
        </Text>
        <Text style={{ margin: '0 0 5px', fontSize: '13px', lineHeight: 1.5, color: EP.body }}>
          · Competitor intelligence on up to 25 rivals
        </Text>
        <Text style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: 1.5, color: EP.body }}>
          · Advanced alerting and escalation policies
        </Text>
        <EBtn href={`${appUrl}/settings/billing`} variant="primary">
          Upgrade to Growth
        </EBtn>
      </Section>

      <EmailFooter
        reason="You received this email because you signed up for a Beaconmon trial."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings/billing`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

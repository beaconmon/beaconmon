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

export type Day2AhaBranch = 'detected' | 'uptime' | 'quiet';

export interface TopCompetitorEvent {
  competitorName: string;
  type: string;
  detectedAt: string;
}

export interface Day2AhaProps {
  competitorEvents: number;
  topEvents: TopCompetitorEvent[];
  incidents: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function selectDay2Branch({
  competitorEvents,
  incidents,
}: {
  competitorEvents: number;
  incidents: number;
}): Day2AhaBranch {
  if (competitorEvents > 0) return 'detected';
  if (incidents > 0) return 'uptime';
  return 'quiet';
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

export function Day2Aha({
  competitorEvents,
  topEvents,
  incidents,
  appUrl,
  unsubscribeUrl,
}: Day2AhaProps) {
  const branch = selectDay2Branch({ competitorEvents, incidents });

  let preview: string;
  let headingText: string;
  let bodyText: string;
  let ctaLabel: string;
  let ctaHref: string;

  if (branch === 'detected') {
    const n = competitorEvents;
    preview = `${n} competitor signal${n === 1 ? '' : 's'} detected in your first 48 hours.`;
    headingText = "Here's what we've already detected";
    bodyText = `In your first 48 hours, Beaconmon caught ${n} competitor signal${n === 1 ? '' : 's'}. Your intelligence feed is live.`;
    ctaLabel = 'View the Wire';
    ctaHref = `${appUrl}/wire`;
  } else if (branch === 'uptime') {
    const n = incidents;
    preview = `Beaconmon caught ${n} downtime incident${n === 1 ? '' : 's'} in your first 48 hours.`;
    headingText = 'Beaconmon is already working for you';
    bodyText = `Your monitors flagged ${n} downtime incident${n === 1 ? '' : 's'} in your first 48 hours. Beaconmon notified you in real time so you could act fast.`;
    ctaLabel = 'View incidents';
    ctaHref = `${appUrl}/incidents`;
  } else {
    preview = 'Your Beaconmon monitors are running, competitors have been quiet so far.';
    headingText = 'Your competitors are quiet, so far';
    bodyText =
      'No competitor changes or downtime incidents in the past 48 hours. That is a good sign, but the real value shows up when competitors move. Want more coverage? Add another competitor to track.';
    ctaLabel = 'Add a competitor';
    ctaHref = `${appUrl}/wire?tab=competitors`;
  }

  return (
    <EmailLayout preview={preview} context="48-hour check-in">
      <Eyebrow>Day 2</Eyebrow>
      <H1>{headingText}</H1>
      <Para>{bodyText}</Para>

      {branch === 'detected' && topEvents.length > 0 && (
        <Section style={{ marginBottom: '20px' }}>
          {topEvents.map((event, i) => (
            <Section
              key={i}
              style={{
                marginBottom: '12px',
              }}
            >
              <Text
                style={{
                  margin: '0 0 2px',
                  fontSize: '14px',
                  fontWeight: 650,
                  color: EP.ink,
                }}
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

      <EmailFooter
        reason="You received this email because you signed up for Beaconmon."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

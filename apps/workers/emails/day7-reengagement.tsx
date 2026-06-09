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

export interface Day7ReengagementProps {
  branch: 'no-competitors' | 'has-competitors';
  competitorCount: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day7Reengagement({
  branch,
  competitorCount,
  appUrl,
  unsubscribeUrl,
}: Day7ReengagementProps) {
  const isNoCompetitors = branch === 'no-competitors';

  const preview = isNoCompetitors
    ? 'Day 7: Add your first competitor and start tracking their prices and promos.'
    : `You have ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} being monitored. See what changed this week.`;

  const tips = isNoCompetitors
    ? [
        'Track a Shopify store: paste any domain and we detect it automatically.',
        'Get notified on price drops, stock changes, and homepage updates.',
        'Weekly digest summarizes everything so you stay informed without checking in.',
      ]
    : [
        'Add more pages: track pricing, sale banners, and product listing pages separately.',
        'Set up a weekly digest to get a summary every Monday morning.',
        'Connect Slack to get instant alerts on high-significance changes.',
      ];

  return (
    <EmailLayout preview={preview} context="Day 7">
      <Eyebrow>Day 7</Eyebrow>

      {isNoCompetitors ? (
        <>
          <H1>Add your first competitor</H1>
          <Para>
            You are 7 days in. Stores that add a competitor in their first week catch pricing
            moves and promo launches before their own customers notice.
          </Para>
          <Para>
            It takes under a minute. Paste a competitor domain and Beaconmon starts tracking
            their prices, stock levels, and page changes automatically.
          </Para>
          <BtnRow>
            <EBtn href={`${appUrl}/wire?tab=competitors`} variant="primary">
              Add your first competitor
            </EBtn>
          </BtnRow>
        </>
      ) : (
        <>
          <H1>Your competitors are moving. Are you watching?</H1>
          <Para>
            You have {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} being
            monitored. Beaconmon is capturing price changes, stock updates, and content changes in
            real time.
          </Para>
          <Para>
            Open your Intelligence Dashboard to see what changed this week across all your tracked
            competitors.
          </Para>
          <BtnRow>
            <EBtn href={`${appUrl}/wire`} variant="primary">
              View this week&apos;s activity
            </EBtn>
          </BtnRow>
        </>
      )}

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
          {isNoCompetitors ? 'Quick-start tips' : 'Make the most of competitor monitoring'}
        </Text>
        {tips.map((tip, i) => (
          <Text
            key={i}
            style={{
              margin: '0 0 6px',
              fontSize: '13px',
              lineHeight: 1.5,
              color: EP.body,
            }}
          >
            · {tip}
          </Text>
        ))}
      </Section>

      <EmailFooter
        reason="You received this email because you signed up for Beaconmon."
        manageLabel="Manage notifications"
        manageUrl={`${appUrl}/settings/notifications`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

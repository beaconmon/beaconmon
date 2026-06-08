import * as React from 'react';
import {
  EmailLayout,
  AlertBanner,
  H1,
  Para,
  EBtn,
  BtnRow,
  EmailFooter,
  DetailBox,
  EP,
  MONO,
} from '@beaconmon/emails';
import { Section, Text } from '@react-email/components';

export interface PausedMonitorItem {
  id: string;
  name: string;
  isCompetitor: boolean;
}

export interface Day14PausedProps {
  pausedMonitors: PausedMonitorItem[];
  appUrl: string;
  unsubscribeUrl?: string;
}

export function Day14Paused({ pausedMonitors, appUrl, unsubscribeUrl }: Day14PausedProps) {
  const competitorMonitors = pausedMonitors.filter((m) => m.isCompetitor);
  const ownMonitors = pausedMonitors.filter((m) => !m.isCompetitor);
  const total = pausedMonitors.length;

  const preview = `${total} monitor${total !== 1 ? 's' : ''} paused after your trial ended. Upgrade within 30 days to restore them.`;

  return (
    <EmailLayout preview={preview} context="Account">
      <AlertBanner sev="critical" label="Trial ended" />

      <H1>
        {total} monitor{total !== 1 ? 's were' : ' was'} paused
      </H1>

      <Para>
        Your Beaconmon trial ended and{' '}
        {total === 1 ? 'one monitor exceeded' : `${total} monitors exceeded`} the free plan limit.
        They have been paused, not deleted. You have 30 days to upgrade and restore them.
      </Para>

      {competitorMonitors.length > 0 && (
        <MonitorGroup label={`Competitor monitors (${competitorMonitors.length})`} items={competitorMonitors} />
      )}

      {ownMonitors.length > 0 && (
        <MonitorGroup label={`Your monitors (${ownMonitors.length})`} items={ownMonitors} />
      )}

      <Section
        style={{
          backgroundColor: EP.warnSoft,
          border: `1px solid ${EP.warn}33`,
          borderRadius: '9px',
          padding: '14px 16px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            margin: '0 0 6px',
            fontFamily: MONO,
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: EP.warnInk,
          }}
        >
          30-day recovery window
        </Text>
        <Text style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: EP.warnInk }}>
          Upgrade to Growth before your 30-day window closes and all paused monitors will be
          automatically restored. After 30 days they cannot be restored this way.
        </Text>
      </Section>

      <BtnRow>
        <EBtn href={`${appUrl}/settings/billing`} variant="primary">
          Upgrade to Growth
        </EBtn>
      </BtnRow>

      <DetailBox
        rows={[
          { k: 'Growth plan', v: '100 monitors, 1-min intervals', mono: false },
          { k: 'Competitors', v: '25 competitor monitors', mono: false },
          { k: 'Locations', v: '5 monitoring locations', mono: false },
          { k: 'History', v: '90 days', mono: false },
        ]}
      />

      <EmailFooter
        reason="You received this email because your Beaconmon trial expired."
        manageLabel="Manage account"
        manageUrl={`${appUrl}/settings/billing`}
        unsubscribeUrl={unsubscribeUrl}
      />
    </EmailLayout>
  );
}

function MonitorGroup({ label, items }: { label: string; items: PausedMonitorItem[] }) {
  return (
    <Section
      style={{
        backgroundColor: EP.surface,
        border: `1px solid ${EP.line}`,
        borderRadius: '9px',
        padding: '14px 16px',
        marginBottom: '12px',
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
        {label}
      </Text>
      {items.map((m) => (
        <Text
          key={m.id}
          style={{ margin: '0 0 4px', fontSize: '13.5px', color: EP.ink }}
        >
          {m.name}
        </Text>
      ))}
    </Section>
  );
}

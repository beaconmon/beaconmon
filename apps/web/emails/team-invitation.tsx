import * as React from 'react';
import {
  EmailLayout,
  Eyebrow,
  H1,
  Para,
  Strong,
  MonoVal,
  EBtn,
  BtnRow,
  EmailFooter,
  EP,
  MONO,
} from '@beaconmon/emails';
import { Section, Text } from '@react-email/components';

export interface TeamInvitationProps {
  inviterName: string;
  teamName: string;
  role: string;
  inviteUrl: string;
}

export function TeamInvitation({ inviterName, teamName, role, inviteUrl }: TeamInvitationProps) {
  const preview = `${inviterName} invited you to join ${teamName} on Beaconmon. Accept to join the workspace.`;

  return (
    <EmailLayout preview={preview} context="Invitation">
      <Eyebrow>Workspace invite</Eyebrow>
      <H1>
        {inviterName} invited you to {teamName} on Beaconmon
      </H1>
      <Para>
        <Strong>{inviterName}</Strong> added you to the <Strong>{teamName}</Strong> workspace as a{' '}
        <Strong>{role}</Strong>. Accept to start tracking competitors and store uptime together.
      </Para>

      <Section
        style={{
          backgroundColor: EP.surface,
          border: `1px solid ${EP.line}`,
          borderRadius: '9px',
          padding: '14px 16px',
          marginBottom: '24px',
        }}
      >
        <Text style={{ margin: 0, fontSize: '14px', fontWeight: 650, color: EP.ink }}>
          {teamName}
        </Text>
        <Text
          style={{
            margin: '2px 0 0',
            fontFamily: MONO,
            fontSize: '11px',
            color: EP.muted,
          }}
        >
          Role: {role}
        </Text>
      </Section>

      <BtnRow>
        <EBtn href={inviteUrl} variant="primary">
          Accept invitation
        </EBtn>
      </BtnRow>

      <Text style={{ margin: '0 0 22px', fontSize: '12px', color: EP.muted }}>
        Or paste this link: <MonoVal color={EP.brandDeep}>{inviteUrl}</MonoVal>
      </Text>

      <EmailFooter
        reason="This invitation expires in 7 days. If you weren't expecting it, you can ignore this email."
        manageLabel="Help"
      />
    </EmailLayout>
  );
}

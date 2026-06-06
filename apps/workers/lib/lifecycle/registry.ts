import type * as React from 'react';
import { TrialReminder } from '../../emails/trial-reminder.js';

export interface TeamForLifecycle {
  id: string;
  plan: string;
  trialEndsAt: Date | null;
  createdAt: Date;
  subscription: { status: string } | null;
  ownerEmail: string | null;
}

export interface LifecycleEmailTriggerConfig {
  type: string;
  category: 'lifecycle' | 'transactional';
  trigger: (team: TeamForLifecycle, now: Date) => boolean;
  payload: (team: TeamForLifecycle) => Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>;
  subject: (payload: Record<string, unknown>) => string;
  dedupKey: (team: TeamForLifecycle) => string;
}

function utcDayStart(now: Date, offsetDays: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
}

const trial7d: LifecycleEmailTriggerConfig = {
  type: 'trial_reminder_7d',
  category: 'lifecycle',
  trigger(team, now) {
    if (team.plan !== 'free' || !team.trialEndsAt || team.subscription) return false;
    const trialEnds = team.trialEndsAt.getTime();
    return (
      trialEnds >= utcDayStart(now, 7).getTime() && trialEnds < utcDayStart(now, 8).getTime()
    );
  },
  payload(_team) {
    return { daysLeft: 7 };
  },
  template: TrialReminder,
  subject() {
    return '7 days left in your Beaconmon trial';
  },
  dedupKey(team) {
    return `trial:reminder:7d:${team.id}`;
  },
};

const trial1d: LifecycleEmailTriggerConfig = {
  type: 'trial_reminder_1d',
  category: 'lifecycle',
  trigger(team, now) {
    if (team.plan !== 'free' || !team.trialEndsAt || team.subscription) return false;
    const trialEnds = team.trialEndsAt.getTime();
    return (
      trialEnds >= utcDayStart(now, 1).getTime() && trialEnds < utcDayStart(now, 2).getTime()
    );
  },
  payload(_team) {
    return { daysLeft: 1 };
  },
  template: TrialReminder,
  subject() {
    return 'Your Beaconmon trial ends tomorrow';
  },
  dedupKey(team) {
    return `trial:reminder:1d:${team.id}`;
  },
};

export const lifecycleEmailRegistry = new Map<string, LifecycleEmailTriggerConfig>([
  [trial7d.type, trial7d],
  [trial1d.type, trial1d],
]);

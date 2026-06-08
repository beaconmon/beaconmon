import type * as React from 'react';
import { TrialReminder } from '../../emails/trial-reminder.js';
import { Day7Reengagement } from '../../emails/day7-reengagement.js';
import { Welcome } from '../../emails/welcome.js';
import { LimitHit } from '../../emails/limit-hit.js';
import { Day2Aha } from '../../emails/day2-aha.js';
import { Day3AlertsSetup } from '../../emails/day3-alerts-setup.js';
import { Day8Detection } from '../../emails/day8-detection.js';
import { Day12Urgency } from '../../emails/day12-urgency.js';
import { Day14Paused } from '../../emails/day14-paused.js';
import { FirstCompetitorChange } from '../../emails/first-competitor-change.js';
import { digestRepository } from '@beaconmon/db';

export interface TeamForLifecycle {
  id: string;
  plan: string;
  trialEndsAt: Date | null;
  createdAt: Date;
  onboardingCompletedAt: Date | null;
  competitorDomains?: string[];
  subscription: { status: string } | null;
  ownerEmail: string | null;
  competitorCount: number;
  alertChannelCount?: number;
}

export interface LifecycleEmailTriggerConfig {
  type: string;
  category: 'lifecycle' | 'transactional';
  trigger: (team: TeamForLifecycle, now: Date) => boolean;
  payload: (team: TeamForLifecycle) => Promise<Record<string, unknown>> | Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>;
  subject: (payload: Record<string, unknown>) => string;
  dedupKey: (team: TeamForLifecycle) => string;
}

function utcDayStart(now: Date, offsetDays: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
}

// Statuses that represent a real billing relationship — suppress trial reminders
const ACTIVE_BILLING_STATUSES = new Set(['active', 'trialing', 'past_due']);

const trial7d: LifecycleEmailTriggerConfig = {
  type: 'trial_reminder_7d',
  category: 'lifecycle',
  trigger(team, now) {
    if (team.plan !== 'free' || !team.trialEndsAt) return false;
    if (ACTIVE_BILLING_STATUSES.has(team.subscription?.status ?? '')) return false;
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
    if (team.plan !== 'free' || !team.trialEndsAt) return false;
    if (ACTIVE_BILLING_STATUSES.has(team.subscription?.status ?? '')) return false;
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

const day7Reengagement: LifecycleEmailTriggerConfig = {
  type: 'day7-reengagement',
  category: 'lifecycle',
  trigger(team, now) {
    const created = team.createdAt.getTime();
    return (
      created >= utcDayStart(now, -7).getTime() && created < utcDayStart(now, -6).getTime()
    );
  },
  payload(team) {
    const branch = team.competitorCount === 0 ? 'no-competitors' : 'has-competitors';
    return { branch, competitorCount: team.competitorCount };
  },
  template: Day7Reengagement,
  subject(payload) {
    return payload['branch'] === 'no-competitors'
      ? 'Day 7: Add your first competitor to Beaconmon'
      : `Your ${payload['competitorCount']} competitor${(payload['competitorCount'] as number) !== 1 ? 's are' : ' is'} being monitored — see what changed`;
  },
  dedupKey(team) {
    return `lifecycle:day7:${team.id}`;
  },
};

const welcome: LifecycleEmailTriggerConfig = {
  type: 'welcome',
  category: 'transactional',
  trigger(team) {
    return !!team.onboardingCompletedAt;
  },
  payload(team) {
    return { competitorDomains: team.competitorDomains ?? [] };
  },
  template: Welcome,
  subject() {
    return "You're set up on Beaconmon";
  },
  dedupKey(team) {
    return `welcome:${team.id}`;
  },
};

const limitHit: LifecycleEmailTriggerConfig = {
  type: 'limit_hit',
  category: 'transactional',
  // Event-triggered from API routes; never fires from the scheduler.
  trigger() { return false; },
  payload() { return {}; },
  template: LimitHit,
  subject(payload) {
    const type = payload['limitType'] === 'competitor' ? 'competitor' : 'monitor';
    return `You've reached your ${type} limit on Beaconmon`;
  },
  dedupKey(team) {
    return `limit:hit:${team.id}`;
  },
};

const day2Aha: LifecycleEmailTriggerConfig = {
  type: 'day2-aha',
  category: 'lifecycle',
  trigger(team, now) {
    if (!team.onboardingCompletedAt) return false;
    const completed = team.onboardingCompletedAt.getTime();
    return (
      completed >= utcDayStart(now, -2).getTime() &&
      completed < utcDayStart(now, -1).getTime()
    );
  },
  async payload(team) {
    const windowStart = team.onboardingCompletedAt!;
    const windowEnd = new Date();
    const [events, incidents] = await Promise.all([
      digestRepository.findCompetitorEventsForDigest(team.id, windowStart, windowEnd),
      digestRepository.findIncidentsInWindow(team.id, windowStart, windowEnd),
    ]);
    return {
      competitorEvents: events.length,
      topEvents: events.slice(0, 3).map((e) => ({
        competitorName: e.competitorName,
        type: e.type,
        detectedAt: e.detectedAt.toISOString(),
      })),
      incidents: incidents.length,
    };
  },
  template: Day2Aha,
  subject(payload) {
    const competitorEvents = payload['competitorEvents'] as number;
    const incidents = payload['incidents'] as number;
    if (competitorEvents > 0) {
      return `${competitorEvents} competitor signal${competitorEvents === 1 ? '' : 's'} detected in your first 48 hours`;
    }
    if (incidents > 0) {
      return 'Beaconmon already caught a downtime incident for you';
    }
    return 'Your Beaconmon monitors are running, competitors are quiet so far';
  },
  dedupKey(team) {
    return `lifecycle:day2:aha:${team.id}`;
  },
};

const day8Detection: LifecycleEmailTriggerConfig = {
  type: 'day8-detection',
  category: 'lifecycle',
  trigger(team, now) {
    if (team.plan !== 'free') return false;
    if (ACTIVE_BILLING_STATUSES.has(team.subscription?.status ?? '')) return false;
    const created = team.createdAt.getTime();
    return (
      created >= utcDayStart(now, -8).getTime() && created < utcDayStart(now, -7).getTime()
    );
  },
  async payload(team) {
    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [events, incidents] = await Promise.all([
      digestRepository.findCompetitorEventsForDigest(team.id, windowStart, windowEnd),
      digestRepository.findIncidentsInWindow(team.id, windowStart, windowEnd),
    ]);
    return {
      competitorEvents: events.length,
      topEvents: events.slice(0, 3).map((e) => ({
        competitorName: e.competitorName,
        type: e.type,
        detectedAt: e.detectedAt.toISOString(),
      })),
      incidents: incidents.length,
    };
  },
  template: Day8Detection,
  subject(payload) {
    const competitorEvents = payload['competitorEvents'] as number;
    const incidents = payload['incidents'] as number;
    if (competitorEvents > 0) {
      return `${competitorEvents} competitor signal${competitorEvents === 1 ? '' : 's'} detected this week`;
    }
    if (incidents > 0) {
      return 'Your uptime monitoring caught issues this week';
    }
    return 'Week 1 check-in: your Beaconmon monitors are running';
  },
  dedupKey(team) {
    return `lifecycle:day8:detection:${team.id}`;
  },
};

const day12Urgency: LifecycleEmailTriggerConfig = {
  type: 'day12-urgency',
  category: 'lifecycle',
  trigger(team, now) {
    if (team.plan !== 'free' || !team.trialEndsAt) return false;
    if (ACTIVE_BILLING_STATUSES.has(team.subscription?.status ?? '')) return false;
    const created = team.createdAt.getTime();
    return (
      created >= utcDayStart(now, -12).getTime() && created < utcDayStart(now, -11).getTime()
    );
  },
  async payload(team) {
    const windowStart = team.createdAt;
    const windowEnd = new Date();
    const [events, incidents] = await Promise.all([
      digestRepository.findCompetitorEventsForDigest(team.id, windowStart, windowEnd),
      digestRepository.findIncidentsInWindow(team.id, windowStart, windowEnd),
    ]);
    return {
      competitorEventCount: events.length,
      incidentCount: incidents.length,
    };
  },
  template: Day12Urgency,
  subject() {
    return '2 days left in your Beaconmon trial';
  },
  dedupKey(team) {
    return `lifecycle:day12:urgency:${team.id}`;
  },
};

const day14Paused: LifecycleEmailTriggerConfig = {
  type: 'day14-paused',
  category: 'transactional',
  // Event-triggered from trial-end-enforce task; never fires from the scheduler.
  trigger() { return false; },
  payload() { return {}; },
  template: Day14Paused,
  subject(payload) {
    const count = (payload['pausedMonitors'] as unknown[])?.length ?? 0;
    return `${count} monitor${count !== 1 ? 's' : ''} paused after your trial ended`;
  },
  dedupKey(team) {
    return `lifecycle:day14:paused:${team.id}`;
  },
};

const day3AlertsSetup: LifecycleEmailTriggerConfig = {
  type: 'day3-alerts-setup',
  category: 'lifecycle',
  trigger(team, now) {
    if (!team.onboardingCompletedAt) return false;
    if ((team.alertChannelCount ?? 0) > 0) return false;
    const completed = team.onboardingCompletedAt.getTime();
    return (
      completed >= utcDayStart(now, -3).getTime() &&
      completed < utcDayStart(now, -2).getTime()
    );
  },
  payload() {
    return {};
  },
  template: Day3AlertsSetup,
  subject() {
    return 'Set up alerts for your monitors';
  },
  dedupKey(team) {
    return `day3:alerts:setup:${team.id}`;
  },
};

const firstCompetitorChange: LifecycleEmailTriggerConfig = {
  type: 'first-competitor-change',
  category: 'transactional',
  // Event-triggered from process-competitor-page-check-job.ts; never fires from the scheduler.
  trigger() { return false; },
  payload() { return {}; },
  template: FirstCompetitorChange,
  subject() {
    return 'We found your first competitor change!';
  },
  dedupKey(team) {
    return `first:competitor:change:${team.id}`;
  },
};

export const lifecycleEmailRegistry = new Map<string, LifecycleEmailTriggerConfig>([
  [welcome.type, welcome],
  [day2Aha.type, day2Aha],
  [day3AlertsSetup.type, day3AlertsSetup],
  [trial7d.type, trial7d],
  [trial1d.type, trial1d],
  [day7Reengagement.type, day7Reengagement],
  [day8Detection.type, day8Detection],
  [limitHit.type, limitHit],
  [day12Urgency.type, day12Urgency],
  [day14Paused.type, day14Paused],
  [firstCompetitorChange.type, firstCompetitorChange],
]);

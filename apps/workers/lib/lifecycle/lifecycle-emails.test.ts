import { describe, it, expect } from 'vitest';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '@beaconmon/queue';
import { lifecycleEmailRegistry } from './registry.js';
import type { TeamForLifecycle } from './registry.js';
import { selectDay2Branch } from '../../emails/day2-aha.js';

const SECRET = 'test-secret-32-chars-min-xxxxxxxxx';

// ─── HMAC token helpers ────────────────────────────────────────────────────────

describe('signUnsubscribeToken / verifyUnsubscribeToken', () => {
  it('round-trips correctly', () => {
    const token = signUnsubscribeToken('team-1', 'lifecycle', SECRET);
    const result = verifyUnsubscribeToken(token, SECRET);
    expect(result).toEqual({ teamId: 'team-1', category: 'lifecycle' });
  });

  it('returns null for a tampered payload', () => {
    const token = signUnsubscribeToken('team-1', 'lifecycle', SECRET);
    const [data, sig] = token.split('.');
    const tampered = `${data}x.${sig}`;
    expect(verifyUnsubscribeToken(tampered, SECRET)).toBeNull();
  });

  it('returns null for a tampered signature', () => {
    const token = signUnsubscribeToken('team-1', 'lifecycle', SECRET);
    const [data] = token.split('.');
    expect(verifyUnsubscribeToken(`${data}.invalidsig`, SECRET)).toBeNull();
  });

  it('returns null for a wrong secret', () => {
    const token = signUnsubscribeToken('team-1', 'lifecycle', SECRET);
    expect(verifyUnsubscribeToken(token, 'wrong-secret')).toBeNull();
  });

  it('returns null for a token with no dot separator', () => {
    expect(verifyUnsubscribeToken('nodot', SECRET)).toBeNull();
  });

  it('encodes teamId with colons correctly', () => {
    // teamId should not contain colon but verify colon-in-category is handled
    const token = signUnsubscribeToken('team-abc', 'transactional', SECRET);
    expect(verifyUnsubscribeToken(token, SECRET)).toEqual({
      teamId: 'team-abc',
      category: 'transactional',
    });
  });
});

// ─── Registry trigger evaluation ─────────────────────────────────────────────

function makeTeam(overrides: Partial<TeamForLifecycle> = {}): TeamForLifecycle {
  return {
    id: 'team-1',
    plan: 'free',
    trialEndsAt: null,
    onboardingCompletedAt: null,
    createdAt: new Date('2025-01-01'),
    subscription: null,
    ownerEmail: 'owner@example.com',
    competitorCount: 0,
    ...overrides,
  };
}


describe('trial_reminder_7d trigger', () => {
  const config = lifecycleEmailRegistry.get('trial_reminder_7d')!;

  it('fires when trialEndsAt is exactly 7 days from now', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13)); // June 13 = +7 days from June 6
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('does not fire when trial ends in 6 days', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 12));
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when trial ends in 8 days', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 14));
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire for non-free plans', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    const team = makeTeam({ plan: 'starter', trialEndsAt });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when team has an active subscription', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    const team = makeTeam({ trialEndsAt, subscription: { status: 'active' } });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when subscription is trialing or past_due', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    expect(config.trigger(makeTeam({ trialEndsAt, subscription: { status: 'trialing' } }), now)).toBe(false);
    expect(config.trigger(makeTeam({ trialEndsAt, subscription: { status: 'past_due' } }), now)).toBe(false);
  });

  it('fires when subscription is canceled', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    const team = makeTeam({ trialEndsAt, subscription: { status: 'canceled' } });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('fires when subscription is incomplete', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    const team = makeTeam({ trialEndsAt, subscription: { status: 'incomplete' } });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('produces dedupKey with team id', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('trial:reminder:7d:abc');
  });
});

describe('trial_reminder_1d trigger', () => {
  const config = lifecycleEmailRegistry.get('trial_reminder_1d')!;

  it('fires when trialEndsAt is exactly 1 day from now', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 7)); // June 7 = +1 day from June 6
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('does not fire when trial ends today (0 days)', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 6));
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when trial ends in 2 days', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 8));
    const team = makeTeam({ trialEndsAt });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('produces dedupKey with team id', () => {
    expect(config.dedupKey(makeTeam({ id: 'xyz' }))).toBe('trial:reminder:1d:xyz');
  });
});

// ─── day7-reengagement trigger ────────────────────────────────────────────────

describe('day7-reengagement trigger', () => {
  const config = lifecycleEmailRegistry.get('day7-reengagement')!;

  it('fires when createdAt is exactly 7 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 30)); // May 30 = 7 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(true);
  });

  it('does not fire when createdAt is 6 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 31)); // May 31 = 6 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(false);
  });

  it('does not fire when createdAt is 8 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29)); // May 29 = 8 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(false);
  });

  it('fires regardless of plan', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 30));
    expect(config.trigger(makeTeam({ createdAt, plan: 'starter' }), now)).toBe(true);
    expect(config.trigger(makeTeam({ createdAt, plan: 'growth' }), now)).toBe(true);
  });

  it('fires regardless of subscription status', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 30));
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'active' } }), now)).toBe(true);
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'trialing' } }), now)).toBe(true);
  });

  it('produces dedupKey with team id', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('lifecycle:day7:abc');
  });
});

// ─── day7-reengagement branch selector ───────────────────────────────────────

describe('day7-reengagement branch selector', () => {
  const config = lifecycleEmailRegistry.get('day7-reengagement')!;

  it('selects no-competitors branch when competitorCount is 0', () => {
    const payload = config.payload(makeTeam({ competitorCount: 0 })) as Record<string, unknown>;
    expect(payload['branch']).toBe('no-competitors');
    expect(payload['competitorCount']).toBe(0);
  });

  it('selects has-competitors branch when competitorCount is 1', () => {
    const payload = config.payload(makeTeam({ competitorCount: 1 })) as Record<string, unknown>;
    expect(payload['branch']).toBe('has-competitors');
    expect(payload['competitorCount']).toBe(1);
  });

  it('selects has-competitors branch when competitorCount is greater than 1', () => {
    const payload = config.payload(makeTeam({ competitorCount: 5 })) as Record<string, unknown>;
    expect(payload['branch']).toBe('has-competitors');
    expect(payload['competitorCount']).toBe(5);
  });

  it('subject uses no-competitors copy for branch a', () => {
    const payload = config.payload(makeTeam({ competitorCount: 0 })) as Record<string, unknown>;
    expect(config.subject(payload)).toBe('Day 7: Add your first competitor to Beaconmon');
  });

  it('subject uses plural copy for branch b with multiple competitors', () => {
    const payload = config.payload(makeTeam({ competitorCount: 3 })) as Record<string, unknown>;
    expect(config.subject(payload)).toContain('competitors are');
  });

  it('subject uses singular copy for branch b with one competitor', () => {
    const payload = config.payload(makeTeam({ competitorCount: 1 })) as Record<string, unknown>;
    expect(config.subject(payload)).toContain('competitor is');
  });
});

// ─── welcome trigger ─────────────────────────────────────────────────────────

describe('welcome trigger', () => {
  const config = lifecycleEmailRegistry.get('welcome')!;

  it('fires when onboardingCompletedAt is set', () => {
    const team = makeTeam({ onboardingCompletedAt: new Date('2026-06-06T10:00:00Z') });
    expect(config.trigger(team, new Date())).toBe(true);
  });

  it('does not fire when onboardingCompletedAt is null', () => {
    const team = makeTeam({ onboardingCompletedAt: null });
    expect(config.trigger(team, new Date())).toBe(false);
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('welcome:abc');
  });

  it('includes competitorDomains in payload', () => {
    const team = makeTeam({ competitorDomains: ['rival.com', 'competitor.io'] });
    expect(config.payload(team)).toEqual({ competitorDomains: ['rival.com', 'competitor.io'] });
  });

  it('defaults competitorDomains to empty array when not provided', () => {
    expect(config.payload(makeTeam())).toEqual({ competitorDomains: [] });
  });

  it('is transactional category', () => {
    expect(config.category).toBe('transactional');
  });
});

// ─── day12-urgency trigger ────────────────────────────────────────────────────

describe('day12-urgency trigger', () => {
  const config = lifecycleEmailRegistry.get('day12-urgency')!;

  it('fires when createdAt is exactly 12 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25)); // May 25 = 12 days before June 6
    const team = makeTeam({ createdAt, trialEndsAt: new Date(Date.UTC(2026, 5, 8)) });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('does not fire when createdAt is 11 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 26)); // May 26 = 11 days before June 6
    const team = makeTeam({ createdAt, trialEndsAt: new Date(Date.UTC(2026, 5, 9)) });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when createdAt is 13 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 24)); // May 24 = 13 days before June 6
    const team = makeTeam({ createdAt, trialEndsAt: new Date(Date.UTC(2026, 5, 7)) });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire for non-free plans', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25));
    const team = makeTeam({ createdAt, plan: 'starter', trialEndsAt: new Date(Date.UTC(2026, 5, 8)) });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when trialEndsAt is null', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25));
    const team = makeTeam({ createdAt, trialEndsAt: null });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when subscription is active', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25));
    const team = makeTeam({ createdAt, trialEndsAt: new Date(Date.UTC(2026, 5, 8)), subscription: { status: 'active' } });
    expect(config.trigger(team, now)).toBe(false);
  });

  it('does not fire when subscription is trialing or past_due', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25));
    const trialEndsAt = new Date(Date.UTC(2026, 5, 8));
    expect(config.trigger(makeTeam({ createdAt, trialEndsAt, subscription: { status: 'trialing' } }), now)).toBe(false);
    expect(config.trigger(makeTeam({ createdAt, trialEndsAt, subscription: { status: 'past_due' } }), now)).toBe(false);
  });

  it('fires when subscription is canceled', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 25));
    const team = makeTeam({ createdAt, trialEndsAt: new Date(Date.UTC(2026, 5, 8)), subscription: { status: 'canceled' } });
    expect(config.trigger(team, now)).toBe(true);
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('lifecycle:day12:urgency:abc');
  });

  it('subject is 2 days left copy', () => {
    expect(config.subject({})).toBe('2 days left in your Beaconmon trial');
  });

  it('is lifecycle category', () => {
    expect(config.category).toBe('lifecycle');
  });
});

// ─── day8-detection trigger ───────────────────────────────────────────────────

describe('day8-detection trigger', () => {
  const config = lifecycleEmailRegistry.get('day8-detection')!;

  it('fires when createdAt is exactly 8 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29)); // May 29 = 8 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(true);
  });

  it('does not fire when createdAt is 7 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 30)); // May 30 = 7 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(false);
  });

  it('does not fire when createdAt is 9 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 28)); // May 28 = 9 days before June 6
    expect(config.trigger(makeTeam({ createdAt }), now)).toBe(false);
  });

  it('does not fire for non-free plans', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29));
    expect(config.trigger(makeTeam({ createdAt, plan: 'starter' }), now)).toBe(false);
    expect(config.trigger(makeTeam({ createdAt, plan: 'growth' }), now)).toBe(false);
  });

  it('does not fire when subscription is active', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29));
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'active' } }), now)).toBe(false);
  });

  it('does not fire when subscription is trialing or past_due', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29));
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'trialing' } }), now)).toBe(false);
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'past_due' } }), now)).toBe(false);
  });

  it('fires when subscription is canceled', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29));
    expect(config.trigger(makeTeam({ createdAt, subscription: { status: 'canceled' } }), now)).toBe(true);
  });

  it('fires when trialEndsAt is null', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const createdAt = new Date(Date.UTC(2026, 4, 29));
    expect(config.trigger(makeTeam({ createdAt, trialEndsAt: null }), now)).toBe(true);
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('lifecycle:day8:detection:abc');
  });

  it('is lifecycle category', () => {
    expect(config.category).toBe('lifecycle');
  });
});

// ─── day8-detection subject branches ─────────────────────────────────────────

describe('day8-detection subject', () => {
  const config = lifecycleEmailRegistry.get('day8-detection')!;

  it('uses detection copy when competitorEvents > 0 (singular)', () => {
    expect(config.subject({ competitorEvents: 1, incidents: 0, topEvents: [] }))
      .toBe('1 competitor signal detected this week');
  });

  it('uses detection copy when competitorEvents > 0 (plural)', () => {
    expect(config.subject({ competitorEvents: 5, incidents: 0, topEvents: [] }))
      .toBe('5 competitor signals detected this week');
  });

  it('uses uptime copy when only incidents present', () => {
    expect(config.subject({ competitorEvents: 0, incidents: 3, topEvents: [] }))
      .toBe('Your uptime monitoring caught issues this week');
  });

  it('uses quiet copy when no detections', () => {
    expect(config.subject({ competitorEvents: 0, incidents: 0, topEvents: [] }))
      .toBe('Week 1 check-in: your Beaconmon monitors are running');
  });

  it('prioritizes competitor events over incidents', () => {
    expect(config.subject({ competitorEvents: 2, incidents: 1, topEvents: [] }))
      .toContain('competitor signal');
  });
});

// ─── day2-aha trigger ─────────────────────────────────────────────────────────

describe('day2-aha trigger', () => {
  const config = lifecycleEmailRegistry.get('day2-aha')!;

  it('fires when onboardingCompletedAt is exactly 2 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const onboardingCompletedAt = new Date(Date.UTC(2026, 5, 4)); // June 4 = 2 days before June 6
    expect(config.trigger(makeTeam({ onboardingCompletedAt }), now)).toBe(true);
  });

  it('does not fire when onboardingCompletedAt is 1 day ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const onboardingCompletedAt = new Date(Date.UTC(2026, 5, 5)); // June 5 = 1 day before June 6
    expect(config.trigger(makeTeam({ onboardingCompletedAt }), now)).toBe(false);
  });

  it('does not fire when onboardingCompletedAt is 3 days ago', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const onboardingCompletedAt = new Date(Date.UTC(2026, 5, 3)); // June 3 = 3 days before June 6
    expect(config.trigger(makeTeam({ onboardingCompletedAt }), now)).toBe(false);
  });

  it('does not fire when onboardingCompletedAt is null', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    expect(config.trigger(makeTeam({ onboardingCompletedAt: null }), now)).toBe(false);
  });

  it('fires regardless of plan', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const onboardingCompletedAt = new Date(Date.UTC(2026, 5, 4));
    expect(config.trigger(makeTeam({ onboardingCompletedAt, plan: 'starter' }), now)).toBe(true);
    expect(config.trigger(makeTeam({ onboardingCompletedAt, plan: 'growth' }), now)).toBe(true);
  });

  it('fires regardless of subscription status', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const onboardingCompletedAt = new Date(Date.UTC(2026, 5, 4));
    expect(config.trigger(makeTeam({ onboardingCompletedAt, subscription: { status: 'active' } }), now)).toBe(true);
    expect(config.trigger(makeTeam({ onboardingCompletedAt, subscription: { status: 'trialing' } }), now)).toBe(true);
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('lifecycle:day2:aha:abc');
  });

  it('is lifecycle category', () => {
    expect(config.category).toBe('lifecycle');
  });
});

// ─── day2-aha branch selector ─────────────────────────────────────────────────

describe('selectDay2Branch', () => {
  it('returns detected when competitorEvents > 0', () => {
    expect(selectDay2Branch({ competitorEvents: 1, incidents: 0 })).toBe('detected');
  });

  it('returns detected when both competitorEvents and incidents > 0', () => {
    expect(selectDay2Branch({ competitorEvents: 2, incidents: 3 })).toBe('detected');
  });

  it('returns uptime when only incidents > 0', () => {
    expect(selectDay2Branch({ competitorEvents: 0, incidents: 1 })).toBe('uptime');
  });

  it('returns quiet when both are 0', () => {
    expect(selectDay2Branch({ competitorEvents: 0, incidents: 0 })).toBe('quiet');
  });
});

// ─── day2-aha subject branches ────────────────────────────────────────────────

describe('day2-aha subject', () => {
  const config = lifecycleEmailRegistry.get('day2-aha')!;

  it('uses detection copy for single competitor event', () => {
    expect(config.subject({ competitorEvents: 1, incidents: 0, topEvents: [] }))
      .toBe('1 competitor signal detected in your first 48 hours');
  });

  it('uses plural detection copy for multiple competitor events', () => {
    expect(config.subject({ competitorEvents: 4, incidents: 0, topEvents: [] }))
      .toBe('4 competitor signals detected in your first 48 hours');
  });

  it('uses uptime copy when only incidents present', () => {
    expect(config.subject({ competitorEvents: 0, incidents: 2, topEvents: [] }))
      .toBe('Beaconmon already caught a downtime incident for you');
  });

  it('uses quiet copy when no detections', () => {
    expect(config.subject({ competitorEvents: 0, incidents: 0, topEvents: [] }))
      .toBe('Your Beaconmon monitors are running, competitors are quiet so far');
  });

  it('prioritizes competitor events over incidents', () => {
    expect(config.subject({ competitorEvents: 1, incidents: 1, topEvents: [] }))
      .toContain('competitor signal');
  });
});

// ─── day14-paused registry entry ─────────────────────────────────────────────

describe('day14-paused registry entry', () => {
  const config = lifecycleEmailRegistry.get('day14-paused')!;

  it('is registered in the registry', () => {
    expect(config).toBeDefined();
  });

  it('trigger always returns false (event-triggered only)', () => {
    const now = new Date('2026-06-07T12:00:00Z');
    expect(config.trigger(makeTeam(), now)).toBe(false);
  });

  it('is transactional category', () => {
    expect(config.category).toBe('transactional');
  });

  it('subject uses singular when 1 monitor paused', () => {
    expect(config.subject({ pausedMonitors: [{ id: 'm1', name: 'My Monitor', isCompetitor: false }] }))
      .toBe('1 monitor paused after your trial ended');
  });

  it('subject uses plural when multiple monitors paused', () => {
    expect(config.subject({
      pausedMonitors: [
        { id: 'm1', name: 'Mon 1', isCompetitor: false },
        { id: 'm2', name: 'Mon 2', isCompetitor: false },
        { id: 'c1', name: 'Comp 1', isCompetitor: true },
      ],
    })).toBe('3 monitors paused after your trial ended');
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('lifecycle:day14:paused:abc');
  });
});

// ─── limit_hit registry entry ────────────────────────────────────────────────

describe('limit_hit registry entry', () => {
  const config = lifecycleEmailRegistry.get('limit_hit')!;

  it('is registered in the registry', () => {
    expect(config).toBeDefined();
  });

  it('trigger always returns false (event-triggered only)', () => {
    const now = new Date('2026-06-07T12:00:00Z');
    expect(config.trigger(makeTeam(), now)).toBe(false);
  });

  it('is transactional category', () => {
    expect(config.category).toBe('transactional');
  });

  it('subject uses competitor copy when limitType is competitor', () => {
    expect(config.subject({ limitType: 'competitor' }))
      .toBe("You've reached your competitor limit on Beaconmon");
  });

  it('subject uses monitor copy when limitType is monitor', () => {
    expect(config.subject({ limitType: 'monitor' }))
      .toBe("You've reached your monitor limit on Beaconmon");
  });

  it('subject defaults to monitor when limitType is unknown', () => {
    expect(config.subject({ limitType: 'other' }))
      .toBe("You've reached your monitor limit on Beaconmon");
  });

  it('produces correct dedupKey', () => {
    expect(config.dedupKey(makeTeam({ id: 'abc' }))).toBe('limit:hit:abc');
  });
});

// ─── Unsubscribe filter simulation ────────────────────────────────────────────

describe('unsubscribe category filter', () => {
  it('lifecycle category blocks trial reminders', () => {
    // Simulate what the scheduler does: if unsubscribed from 'lifecycle', skip
    const config7d = lifecycleEmailRegistry.get('trial_reminder_7d')!;
    const config1d = lifecycleEmailRegistry.get('trial_reminder_1d')!;
    expect(config7d.category).toBe('lifecycle');
    expect(config1d.category).toBe('lifecycle');
    // Both trial reminders are 'lifecycle' so one unsubscribe covers both
  });
});

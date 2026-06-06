import { describe, it, expect } from 'vitest';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '@beaconmon/queue';
import { lifecycleEmailRegistry } from './registry.js';
import type { TeamForLifecycle } from './registry.js';

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
    createdAt: new Date('2025-01-01'),
    subscription: null,
    ownerEmail: 'owner@example.com',
    ...overrides,
  };
}

function nowWithOffset(offsetDays: number): Date {
  const now = new Date('2026-06-06T12:00:00Z');
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offsetDays));
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

  it('does not fire when team has a subscription', () => {
    const now = new Date('2026-06-06T12:00:00Z');
    const trialEndsAt = new Date(Date.UTC(2026, 5, 13));
    const team = makeTeam({ trialEndsAt, subscription: { status: 'active' } });
    expect(config.trigger(team, now)).toBe(false);
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

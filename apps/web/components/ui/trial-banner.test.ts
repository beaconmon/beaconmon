import { describe, it, expect } from 'vitest';
import { computeBannerState } from './trial-banner';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-01-15T12:00:00Z').getTime();

describe('computeBannerState', () => {
  it('returns none when trialEndsAt is null', () => {
    expect(computeBannerState('free', null, now)).toBe('none');
    expect(computeBannerState('growth', null, now)).toBe('none');
  });

  it('returns none when trialEndsAt is invalid', () => {
    expect(computeBannerState('growth', 'not-a-date', now)).toBe('none');
  });

  it('returns inTrialPositive when more than 7 days remain on trial', () => {
    const trialEndsAt = new Date(now + 11 * DAY).toISOString();
    expect(computeBannerState('growth', trialEndsAt, now)).toBe('inTrialPositive');
  });

  it('returns inTrialPositive at exactly 8 days remaining', () => {
    const trialEndsAt = new Date(now + 8 * DAY).toISOString();
    expect(computeBannerState('growth', trialEndsAt, now)).toBe('inTrialPositive');
  });

  it('returns inTrialCountdown at exactly 7 days remaining', () => {
    const trialEndsAt = new Date(now + 7 * DAY).toISOString();
    expect(computeBannerState('growth', trialEndsAt, now)).toBe('inTrialCountdown');
  });

  it('returns inTrialCountdown when 1 day remains', () => {
    const trialEndsAt = new Date(now + 1 * DAY).toISOString();
    expect(computeBannerState('growth', trialEndsAt, now)).toBe('inTrialCountdown');
  });

  it('returns expired when effectivePlan is free and trial has passed', () => {
    const trialEndsAt = new Date(now - 2 * DAY).toISOString();
    expect(computeBannerState('free', trialEndsAt, now)).toBe('expired');
  });

  it('returns none when effectivePlan is free but trialEndsAt is in the future', () => {
    // edge case: shouldn't normally happen, but guard against it
    const trialEndsAt = new Date(now + 5 * DAY).toISOString();
    expect(computeBannerState('free', trialEndsAt, now)).toBe('none');
  });

  it('returns none for a user with active subscription (effectivePlan not free, no trial expiry)', () => {
    expect(computeBannerState('growth', null, now)).toBe('none');
  });
});

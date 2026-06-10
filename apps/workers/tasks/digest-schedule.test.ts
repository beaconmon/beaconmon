import { describe, it, expect } from 'vitest';
import { getLocalSendState, DAILY_DIGEST_LOCAL_HOUR } from './digest-schedule.js';

describe('getLocalSendState', () => {
  it('matches UTC behavior for Etc/UTC (legacy default)', () => {
    const state = getLocalSendState(new Date('2026-06-10T07:00:00Z'), 'Etc/UTC');
    expect(state.dateKey).toBe('2026-06-10');
    expect(state.hour).toBe(7);
    expect(state.isMonday).toBe(false);
    expect(state.weekKey).toBe('2026-W24');
  });

  it('is still the previous local day for New York at 07:00 UTC', () => {
    // 07:00 UTC on June 10 is 03:00 EDT on June 10, before the send hour
    const state = getLocalSendState(new Date('2026-06-10T07:00:00Z'), 'America/New_York');
    expect(state.dateKey).toBe('2026-06-10');
    expect(state.hour).toBe(3);
    expect(state.hour).toBeLessThan(DAILY_DIGEST_LOCAL_HOUR);
  });

  it('reaches the send hour for New York at 11:00 UTC during EDT', () => {
    const state = getLocalSendState(new Date('2026-06-10T11:00:00Z'), 'America/New_York');
    expect(state.hour).toBe(7);
    expect(state.dateKey).toBe('2026-06-10');
  });

  it('reaches the send hour for New York at 12:00 UTC during EST (winter)', () => {
    const state = getLocalSendState(new Date('2026-01-14T12:00:00Z'), 'America/New_York');
    expect(state.hour).toBe(7);
    expect(state.dateKey).toBe('2026-01-14');
  });

  it('crosses the date line correctly for Auckland', () => {
    // 20:00 UTC on June 10 is 08:00 on June 11 in Auckland (UTC+12)
    const state = getLocalSendState(new Date('2026-06-10T20:00:00Z'), 'Pacific/Auckland');
    expect(state.dateKey).toBe('2026-06-11');
    expect(state.hour).toBe(8);
  });

  it('detects local Monday for the weekly digest', () => {
    // 2026-06-08 is a Monday. 13:00 UTC is 06:00 PDT, still Monday but before send hour.
    const before = getLocalSendState(new Date('2026-06-08T13:00:00Z'), 'America/Los_Angeles');
    expect(before.isMonday).toBe(true);
    expect(before.hour).toBe(6);

    // 02:00 UTC on Tuesday June 9 is still Monday 19:00 in Los Angeles
    const lateMonday = getLocalSendState(new Date('2026-06-09T02:00:00Z'), 'America/Los_Angeles');
    expect(lateMonday.isMonday).toBe(true);
    expect(lateMonday.dateKey).toBe('2026-06-08');
    expect(lateMonday.weekKey).toBe('2026-W24');
  });

  it('handles the spring-forward DST transition (2:30am local does not exist)', () => {
    // US DST began 2026-03-08. 07:00 UTC is 02:00 EST -> clocks jump to 03:00 EDT.
    const state = getLocalSendState(new Date('2026-03-08T07:00:00Z'), 'America/New_York');
    expect(state.dateKey).toBe('2026-03-08');
    expect(state.hour).toBe(3);

    // Send hour is still reached later the same local day (11:00 UTC = 07:00 EDT)
    const sendTime = getLocalSendState(new Date('2026-03-08T11:00:00Z'), 'America/New_York');
    expect(sendTime.hour).toBe(7);
    expect(sendTime.dateKey).toBe('2026-03-08');
  });

  it('handles the fall-back DST transition without repeating a date key', () => {
    // US DST ends 2026-11-01. 06:00 UTC is 01:00 EST (second pass through 1am).
    const state = getLocalSendState(new Date('2026-11-01T06:00:00Z'), 'America/New_York');
    expect(state.dateKey).toBe('2026-11-01');
    expect(state.hour).toBe(1);

    const sendTime = getLocalSendState(new Date('2026-11-01T12:00:00Z'), 'America/New_York');
    expect(sendTime.hour).toBe(7);
    expect(sendTime.dateKey).toBe('2026-11-01');
  });

  it('returns hour 0 at local midnight (h23 hour cycle)', () => {
    const state = getLocalSendState(new Date('2026-06-10T00:00:00Z'), 'Etc/UTC');
    expect(state.hour).toBe(0);
  });

  it('falls back to UTC for an invalid timezone', () => {
    const state = getLocalSendState(new Date('2026-06-10T09:30:00Z'), 'Not/AZone');
    expect(state.dateKey).toBe('2026-06-10');
    expect(state.hour).toBe(9);
  });

  it('computes ISO week keys at year boundaries', () => {
    // 2027-01-01 is a Friday, ISO week 53 of 2026
    const state = getLocalSendState(new Date('2027-01-01T12:00:00Z'), 'Etc/UTC');
    expect(state.weekKey).toBe('2026-W53');
  });
});

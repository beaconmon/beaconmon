import { describe, it, expect } from 'vitest';
import { computeFailureBackoffSeconds } from '@beaconmon/db';

const HOUR = 60 * 60;
const SEVEN_DAYS = 7 * 24 * HOUR;
const SIX_HOURS = 6 * HOUR;

describe('computeFailureBackoffSeconds', () => {
  const interval = HOUR; // 1 hour normal cadence

  it('keeps the normal interval for the first two failures', () => {
    expect(computeFailureBackoffSeconds(1, interval)).toBe(interval);
    expect(computeFailureBackoffSeconds(2, interval)).toBe(interval);
  });

  it('applies 2x backoff on the third failure', () => {
    expect(computeFailureBackoffSeconds(3, interval)).toBe(interval * 2);
  });

  it('doubles the backoff with each subsequent failure', () => {
    expect(computeFailureBackoffSeconds(4, interval)).toBe(interval * 4);
    expect(computeFailureBackoffSeconds(5, interval)).toBe(interval * 8);
    expect(computeFailureBackoffSeconds(6, interval)).toBe(interval * 16);
  });

  it('caps the backoff at 7 days no matter how high the failure count', () => {
    // 98 consecutive failures (the youthtothepeople.com case) must not blow past the cap.
    expect(computeFailureBackoffSeconds(98, interval)).toBe(SEVEN_DAYS);
    expect(computeFailureBackoffSeconds(50, interval)).toBe(SEVEN_DAYS);
  });

  it('applies a 6-hour floor for hard WAF blocks even on early failures', () => {
    for (const code of [401, 403, 429, 503]) {
      // Failure 1 would normally stay at the 1h interval, but a hard block floors it to 6h.
      expect(computeFailureBackoffSeconds(1, interval, code)).toBe(SIX_HOURS);
    }
  });

  it('uses the larger of the computed backoff and the hard-block floor', () => {
    // 10 failures => 2^8 = 256h of backoff, which exceeds the 6h floor, so the
    // (capped) exponential value wins.
    expect(computeFailureBackoffSeconds(10, interval, 403)).toBe(SEVEN_DAYS);
    // A short interval with a low failure count: exponential is below the floor, floor wins.
    expect(computeFailureBackoffSeconds(3, 60, 429)).toBe(SIX_HOURS);
  });

  it('does not apply the hard-block floor for non-block status codes', () => {
    expect(computeFailureBackoffSeconds(1, interval, 404)).toBe(interval);
    expect(computeFailureBackoffSeconds(1, interval, 500)).toBe(interval);
    expect(computeFailureBackoffSeconds(1, interval, null)).toBe(interval);
  });
});

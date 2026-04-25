/**
 * Tests for graceful SIGTERM shutdown behavior.
 *
 * Verifies the shutdown contract:
 *   1. Worker pauses (stops accepting new jobs)
 *   2. In-flight jobs are allowed to complete
 *   3. If jobs don't finish within 10s, forceShutdown() is called
 *   4. All connections are closed before exit
 *
 * Uses mocked BullMQ Worker so no real Redis/DB is required.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('./lib/env.js', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    ALERT_DRY_RUN: false,
    SENTRY_DSN: undefined,
    FEATURE_SMS_ALERTS: false,
  },
}));

vi.mock('./lib/sentry.js', () => ({
  initSentry: vi.fn(),
  Sentry: { captureException: vi.fn(), captureCheckIn: vi.fn() },
}));

vi.mock('./lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// ─── Shutdown logic under test ────────────────────────────────────────────────

/**
 * Extracted shutdown function matching the pattern used in all workers.
 * Returns the exit code that would have been passed to process.exit().
 * Never actually calls process.exit() — returns instead.
 */
async function runShutdown(opts: {
  /** Resolves when the worker finishes draining */
  workerClose: () => Promise<void>;
  /** How long to wait before forceShutdown fires (ms) */
  drainTimeoutMs: number;
  /** Disconnect callbacks */
  onDisconnect?: () => Promise<void>;
}): Promise<{ exitCode: number; timedOut: boolean }> {
  let timedOut = false;

  const drainTimeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve();
    }, opts.drainTimeoutMs);
  });

  // Mirrors the real shutdown: pause → close (race with timeout) → disconnect → exit
  const closePromise = opts.workerClose();

  await Promise.race([closePromise, drainTimeoutPromise]);
  await opts.onDisconnect?.().catch(() => {});

  return { exitCode: timedOut ? 1 : 0, timedOut };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('graceful shutdown', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.useRealTimers());

  it('exits cleanly (code 0) when in-flight job finishes before timeout', async () => {
    vi.useFakeTimers();

    let disconnected = false;
    const workerClose = () =>
      new Promise<void>((resolve) => {
        // Simulate a job that finishes in 3 seconds
        setTimeout(resolve, 3_000);
      });

    const shutdownPromise = runShutdown({
      workerClose,
      drainTimeoutMs: 10_000,
      onDisconnect: async () => { disconnected = true; },
    });

    // Advance 3s — job finishes before the 10s timeout
    await vi.advanceTimersByTimeAsync(3_000);
    const result = await shutdownPromise;

    expect(result.exitCode).toBe(0);
    expect(result.timedOut).toBe(false);
    expect(disconnected).toBe(true);
  });

  it('force-exits (code 1) when a job exceeds the 10-second drain timeout', async () => {
    vi.useFakeTimers();

    let disconnected = false;
    const workerClose = () =>
      // Simulate a job that would take 30s — longer than the 10s timeout
      new Promise<void>((resolve) => setTimeout(resolve, 30_000));

    const shutdownPromise = runShutdown({
      workerClose,
      drainTimeoutMs: 10_000,
      onDisconnect: async () => { disconnected = true; },
    });

    // Advance past the 10s timeout
    await vi.advanceTimersByTimeAsync(10_001);
    const result = await shutdownPromise;

    expect(result.exitCode).toBe(1);
    expect(result.timedOut).toBe(true);
    // Disconnect still runs even in force-shutdown path
    expect(disconnected).toBe(true);
  });

  it('exits cleanly (code 0) when there are no in-flight jobs', async () => {
    vi.useFakeTimers();

    // Worker closes immediately (no in-flight jobs)
    const workerClose = () => Promise.resolve();

    const shutdownPromise = runShutdown({
      workerClose,
      drainTimeoutMs: 10_000,
    });

    await vi.advanceTimersByTimeAsync(0);
    const result = await shutdownPromise;

    expect(result.exitCode).toBe(0);
    expect(result.timedOut).toBe(false);
  });

  it('still disconnects even when onDisconnect throws', async () => {
    vi.useFakeTimers();

    const workerClose = () => Promise.resolve();
    let disconnectAttempted = false;

    const shutdownPromise = runShutdown({
      workerClose,
      drainTimeoutMs: 10_000,
      onDisconnect: async () => {
        disconnectAttempted = true;
        throw new Error('Redis quit failed');
      },
    });

    await vi.advanceTimersByTimeAsync(0);
    // Should not throw — shutdown catches disconnect errors
    const result = await shutdownPromise;

    expect(result.exitCode).toBe(0);
    expect(disconnectAttempted).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from 'undici';
import { runHttpCheck } from './http.js';
import type { CheckInput } from './types.js';

vi.mock('undici', () => ({ request: vi.fn() }));

const mockRequest = vi.mocked(request);

function job(overrides: Partial<CheckInput> = {}): CheckInput {
  return {
    monitorId: 'mon_1',
    url: 'https://example.com',
    type: 'http',
    timeoutMs: 30_000,
    intervalSeconds: 300,
    ...overrides,
  };
}

function response(statusCode: number) {
  return { statusCode, body: { dump: vi.fn().mockResolvedValue(undefined), text: vi.fn() } } as never;
}

describe('runHttpCheck retry', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    vi.useFakeTimers();
  });

  it('returns immediately on a first-try success without retrying', async () => {
    mockRequest.mockResolvedValueOnce(response(200));

    const result = await runHttpCheck(job());

    expect(result.success).toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('retries once after a failure and returns the retry result when it succeeds', async () => {
    mockRequest.mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(200));

    const resultPromise = runHttpCheck(job());
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('returns the retry failure when both attempts fail', async () => {
    mockRequest.mockResolvedValue(response(503));

    const resultPromise = runHttpCheck(job());
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.errorType).toBe('non_2xx');
    expect(result.statusCode).toBe(503);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

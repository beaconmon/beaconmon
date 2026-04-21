import { request } from 'undici';
import type { CheckResult } from '@beaconmon/types';
import type { CheckInput } from './types.js';
import { classifyError } from './errors.js';

export async function runHttpCheck(job: CheckInput): Promise<CheckResult> {
  const startedAt = Date.now();
  const checkedAt = new Date();

  try {
    const { statusCode } = await request(job.url, {
      method: 'GET',
      headersTimeout: job.timeoutMs,
      bodyTimeout: job.timeoutMs,
      headers: {
        'user-agent': 'beaconmon/1.0 (+https://beaconmon.dev)',
      },
    } as Parameters<typeof request>[1]);

    const responseTimeMs = Date.now() - startedAt;
    const success = statusCode >= 200 && statusCode < 300;

    return {
      monitorId: job.monitorId,
      checkedAt,
      success,
      statusCode,
      responseTimeMs,
      errorType: success ? null : 'non_2xx',
      errorMessage: success ? null : `HTTP ${statusCode}`,
      type: job.type,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - startedAt;
    const { errorType, errorMessage } = classifyError(err);

    return {
      monitorId: job.monitorId,
      checkedAt,
      success: false,
      statusCode: null,
      responseTimeMs,
      errorType,
      errorMessage,
      type: job.type,
    };
  }
}

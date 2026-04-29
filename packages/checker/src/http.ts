import { request } from 'undici';
import type { CheckResult } from '@beaconmon/types';
import type { CheckInput } from './types.js';
import { classifyError } from './errors.js';

export async function runHttpCheck(job: CheckInput): Promise<CheckResult> {
  const startedAt = Date.now();
  const checkedAt = new Date();

  try {
    const { statusCode, body } = await request(job.url, {
      method: 'GET',
      headersTimeout: job.timeoutMs,
      bodyTimeout: job.timeoutMs,
      headers: {
        'user-agent': 'beaconmon/1.0 (+https://beaconmon.dev)',
      },
    } as Parameters<typeof request>[1]);

    const responseTimeMs = Date.now() - startedAt;

    if (job.type === 'keyword') {
      const keyword = job.keyword ?? '';
      if (keyword === '') {
        await body.dump();
        return {
          monitorId: job.monitorId,
          checkedAt,
          success: false,
          statusCode,
          responseTimeMs,
          errorType: 'invalid_keyword',
          errorMessage: 'Keyword monitor has no keyword configured',
          type: job.type,
        };
      }

      const bodyText = await body.text();
      const condition = job.keywordCondition ?? 'present';
      const found = bodyText.includes(keyword);
      const success = condition === 'present' ? found : !found;

      return {
        monitorId: job.monitorId,
        checkedAt,
        success,
        statusCode,
        responseTimeMs,
        errorType: success ? null : 'keyword_not_found',
        errorMessage: success
          ? null
          : condition === 'present'
          ? `Keyword "${keyword}" not found in response body`
          : `Keyword "${keyword}" was found in response body (expected absent)`,
        type: job.type,
      };
    }

    // HTTP monitor — check status code only
    await body.dump(); // consume body to free the socket
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

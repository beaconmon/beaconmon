import { request } from 'undici';
import * as cheerio from 'cheerio';
import type { CheckErrorType } from '@beaconmon/types';
import { classifyError } from './errors.js';

export interface ContentCheckInput {
  monitorId: string;
  url: string;
  selector?: string;
  timeoutMs: number;
}

export interface ContentCheckResult {
  monitorId: string;
  checkedAt: Date;
  success: boolean;
  content: string | null;
  statusCode: number | null;
  responseTimeMs: number;
  errorType: CheckErrorType | null;
  errorMessage: string | null;
}

/**
 * Fetch a page, extract text via cheerio (selector or full body), and normalize whitespace.
 * Never uses Playwright — HTML-only (architecture rule #10).
 */
export async function runContentCheck(input: ContentCheckInput): Promise<ContentCheckResult> {
  const { monitorId, url, selector, timeoutMs } = input;
  const startedAt = Date.now();
  const checkedAt = new Date();

  try {
    const { statusCode, body } = await request(url, {
      method: 'GET',
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
      headers: {
        'user-agent': 'beaconmon/1.0 (+https://beaconmon.com)',
        accept: 'text/html,application/xhtml+xml',
      },
    });

    const html = await body.text();
    const responseTimeMs = Date.now() - startedAt;

    const $ = cheerio.load(html);
    const rawText = selector ? $(selector).text() : $('body').text();
    // Normalize: trim + collapse internal whitespace to single spaces
    const content = rawText.replace(/\s+/g, ' ').trim();

    return {
      monitorId,
      checkedAt,
      success: true,
      content,
      statusCode,
      responseTimeMs,
      errorType: null,
      errorMessage: null,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - startedAt;
    const { errorType, errorMessage } = classifyError(err);

    return {
      monitorId,
      checkedAt,
      success: false,
      content: null,
      statusCode: null,
      responseTimeMs,
      errorType,
      errorMessage,
    };
  }
}

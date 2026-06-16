import { request, Agent, interceptors } from 'undici';
import * as cheerio from 'cheerio';
import type { CheckErrorType } from '@beaconmon/types';
import { classifyError } from './errors.js';

export interface ContentCheckInput {
  monitorId: string;
  url: string;
  selector?: string;
  timeoutMs: number;
}

// A bot user-agent gets challenged by Cloudflare and similar WAFs, failing
// roughly 10% of monitored pages with 403 cf-mitigated responses. Present a
// current, realistic desktop Chrome user-agent so soft bot-detection passes.
export const CONTENT_CHECK_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';

// Follow up to 5 redirects so a 301/302 yields the destination page, not the
// redirect stub body (undici does not follow redirects by default).
const redirectDispatcher = new Agent().compose(interceptors.redirect({ maxRedirections: 5 }));

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
      dispatcher: redirectDispatcher,
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
      headers: {
        'user-agent': CONTENT_CHECK_USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });

    const html = await body.text();
    const responseTimeMs = Date.now() - startedAt;

    // A 404, 500, or bot-challenge page must not become the snapshot baseline:
    // treating it as success would emit a bogus change event and corrupt every
    // diff until the page recovers.
    if (statusCode < 200 || statusCode >= 300) {
      return {
        monitorId,
        checkedAt,
        success: false,
        content: null,
        statusCode,
        responseTimeMs,
        errorType: 'non_2xx',
        errorMessage: `HTTP ${statusCode}`,
      };
    }

    const $ = cheerio.load(html);
    $('script, style').remove();
    $('*').contents().filter((_, n) => n.type === 'comment').remove();
    const rawText = selector ? $(selector).text() : $('body').text();
    // Normalize: collapse horizontal whitespace per line, drop blank lines.
    // Preserves newlines so diffLines() produces meaningful per-line diffs.
    const content = rawText
      .split('\n')
      .map((l) => l.replace(/[ \t]+/g, ' ').trim())
      .filter((l) => l.length > 0)
      .join('\n');

    // A selector that no longer matches after a redesign (or a body that yields
    // no text) extracts to ''. Snapshotting that would fire one bogus
    // "everything was removed" change and then go permanently silent, because
    // empty never diffs against empty again. Surface it as a failure so the
    // page's consecutive-failure tracking handles it like any other outage
    // instead of reporting a calm, broken monitor.
    if (content.length === 0) {
      return {
        monitorId,
        checkedAt,
        success: false,
        content: null,
        statusCode,
        responseTimeMs,
        errorType: 'empty_content',
        errorMessage: selector
          ? `Selector "${selector}" matched no content`
          : 'Page body extracted no text',
      };
    }

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

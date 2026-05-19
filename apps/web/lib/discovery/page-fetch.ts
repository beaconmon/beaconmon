import 'server-only';
import { isHostnameSafe } from './ssrf-guard';
import { DISCOVERY_USER_AGENT } from './sitemap';
import { logger } from '@/lib/logger';

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

function hostnameMatchesApex(hostname: string, apex: string): boolean {
  return hostname === apex || hostname === `www.${apex}`;
}

export async function fetchPageHtml(
  url: string,
  apexHostname: string,
  signal?: AbortSignal
): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!hostnameMatchesApex(parsed.hostname, apexHostname)) return null;

  const ssrf = await isHostnameSafe(parsed.hostname);
  if (!ssrf.allowed) return null;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': DISCOVERY_USER_AGENT,
        Accept: 'text/html, */*',
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html')) return null;

    const reader = res.body?.getReader();
    if (!reader) {
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_BODY_BYTES) return null;
      return new TextDecoder().decode(buf);
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const buf = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
    let offset = 0;
    for (const c of chunks) {
      buf.set(c, offset);
      offset += c.length;
    }
    return new TextDecoder().decode(buf);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return null;
    logger.error({ err, url, fn: 'fetchPageHtml' }, 'page-fetch: request failed');
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

import 'server-only';
import { parseSitemapDirectives, parseSitemapXml } from './sitemap-parse';

export const DISCOVERY_USER_AGENT = 'Beaconmon-Discovery/1.0 (+https://beaconmon.com/discovery)';

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_URLS = 1_000;

export interface SitemapFetchResult {
  urls: string[];
  warnings: string[];
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response | null> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': DISCOVERY_USER_AGENT,
        Accept: 'text/plain, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

async function readBoundedText(res: Response): Promise<string | null> {
  try {
    const reader = res.body?.getReader();
    if (!reader) return await res.text();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        total += value.length;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
    }
    return new TextDecoder().decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
  } catch {
    return null;
  }
}

export { parseSitemapDirectives, parseSitemapXml };

export async function fetchSitemapUrls(
  domain: string,
  signal?: AbortSignal
): Promise<SitemapFetchResult> {
  const warnings: string[] = [];
  const urlSet = new Set<string>();
  const origin = `https://${domain}`;

  const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`, signal);
  const robotsBody = robotsRes && robotsRes.ok ? await readBoundedText(robotsRes) : null;
  const sitemapDirectives = robotsBody ? parseSitemapDirectives(robotsBody) : [];

  const candidateSitemaps = sitemapDirectives.length > 0
    ? sitemapDirectives
    : [`${origin}/sitemap.xml`];

  for (const sitemapUrl of candidateSitemaps.slice(0, 3)) {
    if (urlSet.size >= MAX_URLS) break;
    const sm = await fetchWithTimeout(sitemapUrl, signal);
    if (!sm || !sm.ok) continue;
    const body = await readBoundedText(sm);
    if (!body) continue;
    const { urls, nestedSitemaps } = parseSitemapXml(body);
    for (const u of urls) {
      if (urlSet.size >= MAX_URLS) break;
      urlSet.add(u);
    }
    for (const nested of nestedSitemaps.slice(0, 3)) {
      if (urlSet.size >= MAX_URLS) break;
      const nestedRes = await fetchWithTimeout(nested, signal);
      if (!nestedRes || !nestedRes.ok) continue;
      const nestedBody = await readBoundedText(nestedRes);
      if (!nestedBody) continue;
      const parsed = parseSitemapXml(nestedBody);
      for (const u of parsed.urls) {
        if (urlSet.size >= MAX_URLS) break;
        urlSet.add(u);
      }
    }
  }

  if (urlSet.size === 0) {
    warnings.push("We couldn't read your sitemap — only the apex monitors were suggested.");
  }

  return { urls: Array.from(urlSet), warnings };
}

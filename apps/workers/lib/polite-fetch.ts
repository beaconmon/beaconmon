// Polite fetching shared by catalog-sync adapters: honest UA, timeout, backoff.
// No proxies, no header spoofing. Blocked responses are handled by tier
// downgrades upstream, never by retrying harder.

export const POLITE_USER_AGENT = 'BeaconMon/1.0';

export function validateCompetitorDomain(domain: string): void {
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    throw new Error(`Invalid domain: ${domain}`);
  }
  const lower = domain.toLowerCase();
  const blocked = ['localhost', '127.', '10.', '192.168.', '169.254.'];
  for (const prefix of blocked) {
    if (lower === prefix || lower.startsWith(prefix)) {
      throw new Error(`Blocked domain: ${domain}`);
    }
  }
  // Block 172.16.0.0/12
  const m = lower.match(/^172\.(\d+)\./);
  if (m) {
    const octet = parseInt(m[1]!, 10);
    if (octet >= 16 && octet <= 31) throw new Error(`Blocked domain: ${domain}`);
  }
}

/**
 * Fallback-tier URLs may only point at the competitor's own site. Tracked URLs
 * come from the competitor's sitemap or merchant input, but job payloads can
 * be replayed, so enforce it again at fetch time.
 */
export function assertUrlOnDomain(rawUrl: string, domain: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`Non-HTTPS URL rejected: ${rawUrl}`);
  }
  const bare = domain.toLowerCase().replace(/^www\./, '');
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (host !== bare && !host.endsWith(`.${bare}`)) {
    throw new Error(`URL ${rawUrl} is not on competitor domain ${domain}`);
  }
  validateCompetitorDomain(parsed.hostname);
  return parsed;
}

export async function fetchWithRetry(
  url: string,
  opts: { maxAttempts?: number; timeoutMs?: number } = {}
): Promise<Response> {
  const { maxAttempts = 3, timeoutMs = 30_000 } = opts;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': POLITE_USER_AGENT },
        signal: AbortSignal.timeout(timeoutMs),
      });
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }
  throw lastErr;
}

/** Random delay between sequential fallback-tier fetches */
export async function politeJitter(): Promise<void> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
}

/** Response statuses that mean "stop asking", not "try again" */
export function isBlockedStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 429 || status === 430;
}

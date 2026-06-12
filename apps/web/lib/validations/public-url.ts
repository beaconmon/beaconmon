import { ValidationError } from '@/lib/api/errors';

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0']);
const BLOCKED_SUFFIXES = ['.local', '.localhost', '.internal'];

function isPrivateIpv4(hostname: string): boolean {
  const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (!m) return false;
  const a = parseInt(m[1]!, 10);
  const b = parseInt(m[2]!, 10);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Reject URLs the worker fleet must never fetch: non-HTTP schemes, localhost,
 * private and link-local IPv4 ranges, IPv6 literals, and internal-only TLDs.
 * Workers fetch user-supplied competitor URLs from the VPS, so anything that
 * resolves into the private network is an SSRF vector.
 */
export function assertPublicHttpUrl(raw: string): void {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ValidationError('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError('URL must use http or https');
  }

  const host = url.hostname.toLowerCase();
  if (
    BLOCKED_HOSTS.has(host) ||
    host.startsWith('[') || // bracketed IPv6 literal
    BLOCKED_SUFFIXES.some((s) => host.endsWith(s)) ||
    !host.includes('.') ||
    isPrivateIpv4(host)
  ) {
    throw new ValidationError('URL must point to a public host');
  }
}

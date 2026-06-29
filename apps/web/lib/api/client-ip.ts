import 'server-only';

/**
 * Extract the real client IP from a request.
 *
 * Prefers x-real-ip (set by the trusted reverse proxy and not appendable by the
 * client), then falls back to the LAST entry in X-Forwarded-For (appended by the
 * proxy, harder to spoof than the first entry which the client controls).
 */
export function clientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const last = xff.split(',').at(-1)?.trim();
    if (last) return last;
  }
  return 'unknown';
}

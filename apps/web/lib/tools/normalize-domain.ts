import 'server-only';

/**
 * Parse and normalize a user-supplied URL or domain string to a bare hostname.
 * Returns null if the input is not a valid public-looking domain.
 * Called before isHostnameSafe() on every public tool route.
 */
export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase().replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
  return host;
}

/**
 * Wrap window.fetch so state-changing requests automatically include the
 * `x-csrf-token` header. The token value comes from the `bm_csrf` cookie set
 * by proxy.ts (double-submit cookie pattern). Server-rendered code has
 * no DOM cookie, but server-rendered code uses repositories directly — only
 * client-side mutations go through the API, so reading from document.cookie
 * is safe here.
 */

const CSRF_COOKIE = 'bm_csrf';
const CSRF_HEADER = 'x-csrf-token';
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${CSRF_COOKIE}=`;
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (!STATE_CHANGING.has(method)) {
    return fetch(input, init);
  }

  const token = readCsrfCookie();
  const headers = new Headers(init?.headers);
  if (token && !headers.has(CSRF_HEADER)) {
    headers.set(CSRF_HEADER, token);
  }
  return fetch(input, { ...init, headers });
}

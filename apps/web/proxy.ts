import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { auth } from '@/lib/auth';

const RedisUrl = z.string().url().parse(process.env['REDIS_URL']);
const redis = new Redis(RedisUrl);

const PROTECTED_PATHS = ['/overview', '/onboarding', '/monitors', '/incidents', '/status-pages', '/alert-channels', '/intelligence', '/settings'];
const AUTH_PATHS = ['/sign-in', '/sign-up', '/verify', '/forgot-password', '/reset-password'];

/**
 * CSRF protection: double-submit cookie pattern.
 *
 * On every same-origin request we ensure a non-HttpOnly `bm_csrf` cookie is
 * set. The browser sends it on same-site requests; an attacker on a different
 * origin cannot read it (same-origin policy) and cannot set the matching
 * `x-csrf-token` request header (cross-origin fetch can't set arbitrary
 * headers without CORS).
 *
 * For state-changing requests (POST/PUT/PATCH/DELETE) we require:
 *   `x-csrf-token` header == `bm_csrf` cookie value
 *
 * Bypassed paths:
 *   - /api/auth/*: better-auth has its own origin-based CSRF
 *   - /api/webhooks/*: verified by webhook signature (Freemius, etc.)
 *   - /api/team/invitations/{token}/accept: public, token-bound
 *   - /api/status-pages/{slug}/data: GET only, public
 */
const CSRF_COOKIE = 'bm_csrf';
const CSRF_HEADER = 'x-csrf-token';
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_BYPASS_PREFIXES = ['/api/auth/', '/api/webhooks/'];
const CSRF_BYPASS_REGEX = [/^\/api\/team\/invitations\/[^/]+\/accept$/];

function isCsrfBypassed(pathname: string): boolean {
  for (const prefix of CSRF_BYPASS_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  for (const re of CSRF_BYPASS_REGEX) {
    if (re.test(pathname)) return true;
  }
  return false;
}

function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

function setCsrfCookieIfMissing(res: NextResponse, existingToken: string | undefined): void {
  if (existingToken) return;
  res.cookies.set(CSRF_COOKIE, generateCsrfToken(), {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export default async function proxy(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';

  let appHost = 'localhost';
  try {
    const rawUrl = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
    appHost = new URL(rawUrl).hostname;
  } catch {
    appHost = 'localhost';
  }

  // Redirect www to apex
  if (host === `www.${appHost}`) {
    const redirectUrl = new URL(req.url);
    redirectUrl.hostname = appHost;
    redirectUrl.port = '';
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (host === appHost || host === 'localhost' || host === '127.0.0.1') {
    const { pathname } = req.nextUrl;

    if (pathname === '/for/agencies' || pathname === '/for/developers') {
      return NextResponse.redirect(new URL('/for/dtc-brands', req.url), 301);
    }
    if (pathname === '/for/freelancers') {
      return NextResponse.redirect(new URL('/for/solo-founders', req.url), 301);
    }
    // Redirect trailing-slash URLs to their canonical non-slash form to prevent
    // duplicate content (skipTrailingSlashRedirect: true means Next.js won't do this).
    // Exclude /ingest/ proxy paths: posthog-js POSTs to /ingest/e/ and /ingest/decide/
    // with trailing slashes, and a 301 on a POST causes browsers to re-issue as GET,
    // silently dropping the event body.
    if (pathname !== '/' && pathname.endsWith('/') && !pathname.startsWith('/ingest/')) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.slice(0, -1);
      return NextResponse.redirect(url, 301);
    }

    const method = req.method.toUpperCase();
    const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;

    if (
      STATE_CHANGING_METHODS.has(method) &&
      pathname.startsWith('/api/') &&
      !isCsrfBypassed(pathname)
    ) {
      const headerToken = req.headers.get(CSRF_HEADER);
      if (!cookieToken || !headerToken || !safeEquals(cookieToken, headerToken)) {
        return new NextResponse(JSON.stringify({ error: 'CSRF check failed' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        });
      }
    }

    const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (isProtected || isAuthPage) {
      const session = await auth.api.getSession({ headers: req.headers });
      const isAuthenticated = Boolean(session?.user?.id);

      if (isProtected && !isAuthenticated) {
        const signIn = new URL('/sign-in', req.url);
        signIn.searchParams.set('redirect', pathname);
        const res = NextResponse.redirect(signIn);
        setCsrfCookieIfMissing(res, cookieToken);
        return res;
      }

      if (isAuthPage && isAuthenticated) {
        const res = NextResponse.redirect(new URL('/overview', req.url));
        setCsrfCookieIfMissing(res, cookieToken);
        return res;
      }
    }

    const res = NextResponse.next();
    setCsrfCookieIfMissing(res, cookieToken);
    return res;
  }

  const slug = await redis.hget('custom_domains', host);

  if (!slug) {
    return new NextResponse('Not found', { status: 404 });
  }

  const url = req.nextUrl.clone();
  url.pathname = `/s/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals so the
    // CSRF cookie gets seeded on first page load (not just first API call).
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$).*)',
  ],
};

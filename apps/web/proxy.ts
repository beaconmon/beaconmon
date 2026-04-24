import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { auth } from '@/lib/auth';

const RedisUrl = z.string().url().parse(process.env['REDIS_URL']);
const redis = new Redis(RedisUrl);

const PROTECTED_PATHS = ['/overview', '/monitors', '/incidents', '/status-pages', '/alert-channels', '/settings'];
const AUTH_PATHS = ['/sign-in', '/sign-up', '/verify', '/forgot-password', '/reset-password'];

export default async function proxy(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';

  let appHost = 'localhost';
  try {
    const rawUrl = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
    appHost = new URL(rawUrl).hostname;
  } catch {
    appHost = 'localhost';
  }

  if (host === appHost || host === 'localhost' || host === '127.0.0.1') {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (isProtected || isAuthPage) {
      const session = await auth.api.getSession({ headers: req.headers });
      const isAuthenticated = Boolean(session?.user?.id);

      if (isProtected && !isAuthenticated) {
        const signIn = new URL('/sign-in', req.url);
        signIn.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signIn);
      }

      if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(new URL('/overview', req.url));
      }
    }

    return NextResponse.next();
  }

  const slug = await redis.hget('custom_domains', host);

  if (!slug) {
    return new NextResponse('Not found', { status: 404 });
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${slug}`;
  return NextResponse.rewrite(url);
}

export const runtime = 'nodejs';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/).*)',
  ],
};

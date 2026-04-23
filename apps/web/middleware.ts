import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedis } from '@/lib/redis';

// Node.js runtime required — ioredis is not compatible with Edge runtime.
export const runtime = 'nodejs';

// Extract the app's own hostname from BETTER_AUTH_URL (or NEXT_PUBLIC_APP_URL).
// Falls back to 'localhost' for local dev.
function getAppHost(): string {
  const url = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
  try {
    return new URL(url).hostname;
  } catch {
    return 'localhost';
  }
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';
  const appHost = getAppHost();

  // Short-circuit: app domain and localhost always pass through
  if (host === appHost || host === 'localhost' || host === '127.0.0.1') {
    return NextResponse.next();
  }

  // Unknown host — check Redis for a custom domain mapping
  try {
    const redis = getRedis();
    const slug = await redis.hget('custom_domains', host);
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = `/${slug}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    // Redis unavailable — pass through, don't 500
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js build assets)
     * - _next/image (Next.js image optimization)
     * - favicon.ico / sitemap.xml / robots.txt
     * - /api routes (handled by their own route handlers)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/).*)',
  ],
};

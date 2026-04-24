import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const RedisUrl = z.string().url().parse(process.env['REDIS_URL']);
const redis = new Redis(RedisUrl);

function getAppHost(): string {
  const url = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
  try {
    return new URL(url).hostname;
  } catch {
    return 'localhost';
  }
}

export default async function proxy(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0] ?? '';
  const appHost = getAppHost();

  if (host === appHost || host === 'localhost' || host === '127.0.0.1') {
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/).*)',
  ],
};

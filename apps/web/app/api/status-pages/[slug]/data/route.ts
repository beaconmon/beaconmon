import { z } from 'zod';
import { getStatusPageData, rateLimit } from '@/lib/cache/status-pages';
import { logger } from '@/lib/logger';

const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(3).max(50);

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  // Validate slug format
  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // Rate limit by IP (sliding window: 60 req/min)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const allowed = await rateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let data;
  try {
    data = await getStatusPageData(parsed.data);
  } catch (err) {
    logger.error({ service: 'web', slug: parsed.data, err }, 'Failed to fetch status page data');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    },
  });
}

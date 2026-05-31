export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);

  const pathStr = path.join('/');
  const query = searchParams.toString();
  const upstream = `https://us-assets.i.posthog.com/static/${pathStr}${query ? `?${query}` : ''}`;

  const res = await fetch(upstream, {
    // Cache upstream response at the Next.js server level for 7 days so
    // repeated requests from different users don't hit PostHog CDN each time.
    next: { revalidate: 86400 * 7 },
  });

  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  const body = await res.arrayBuffer();

  return new Response(body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/javascript',
      // Files are version-pinned via ?v=... so 1-year immutable cache is safe.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);

  // Reject any segment that would escape the /static/ prefix on the upstream host.
  if (path.some((segment) => segment === '..' || segment === '.')) {
    return new Response(null, { status: 400 });
  }

  const pathStr = path.join('/');
  const query = searchParams.toString();
  const upstream = `https://us-assets.i.posthog.com/static/${pathStr}${query ? `?${query}` : ''}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(upstream, {
      signal: controller.signal,
      // Cache upstream response at the Next.js server level for 7 days so
      // repeated requests from different users don't hit PostHog CDN each time.
      next: { revalidate: 86400 * 7 },
    });
  } catch {
    return new Response(null, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  const body = await res.arrayBuffer();

  return new Response(body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
      // Files are version-pinned via ?v=... so 1-year immutable cache is safe.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

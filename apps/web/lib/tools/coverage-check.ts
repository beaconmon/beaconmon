import 'server-only';

const FETCH_TIMEOUT_MS = 8_000;
const TOOL_USER_AGENT = 'Beaconmon/1.0 (+https://beaconmon.com)';

export type PageStatus = 'up' | 'redirect' | 'down' | 'error' | 'skipped';

export interface PageCheck {
  id: string;
  label: string;
  url: string;
  status: PageStatus;
  httpStatus: number | null;
  responseMs: number | null;
  critical: true;
  note: string | null;
}

export interface CoverageResult {
  ok: true;
  domain: string;
  platform: 'shopify' | 'unknown';
  checkedAt: string;
  pages: PageCheck[];
  summary: {
    total: number;
    up: number;
    redirect: number;
    down: number;
    error: number;
    skipped: number;
  };
}

async function timedFetch(
  url: string,
  opts: { method?: string; redirect?: RequestRedirect } = {},
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: opts.method ?? 'HEAD',
      redirect: opts.redirect ?? 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': TOOL_USER_AGENT },
    });
  } finally {
    clearTimeout(timer);
  }
}

function statusFromCode(code: number): PageStatus {
  if (code >= 200 && code < 300) return 'up';
  if (code >= 300 && code < 400) return 'redirect';
  return 'down';
}

async function checkUrl(
  url: string,
  opts: { redirect?: RequestRedirect } = {},
): Promise<{ status: PageStatus; httpStatus: number | null; responseMs: number | null }> {
  const start = Date.now();
  try {
    const res = await timedFetch(url, { method: 'HEAD', redirect: opts.redirect ?? 'follow' });
    const responseMs = Date.now() - start;
    // With redirect:'manual', the Fetch spec returns an opaque-redirect response
    // with status=0 and type='opaqueredirect'. Treat this as a redirect, not down.
    if (res.type === 'opaqueredirect') {
      return { status: 'redirect', httpStatus: null, responseMs };
    }
    if (res.status === 405) {
      const getStart = Date.now();
      const getRes = await timedFetch(url, { method: 'GET', redirect: opts.redirect ?? 'follow' });
      await getRes.arrayBuffer().catch(() => undefined);
      return { status: statusFromCode(getRes.status), httpStatus: getRes.status, responseMs: Date.now() - getStart };
    }
    return { status: statusFromCode(res.status), httpStatus: res.status, responseMs };
  } catch {
    return { status: 'error', httpStatus: null, responseMs: null };
  }
}

async function checkCheckout(
  domain: string,
): Promise<{ url: string; status: PageStatus; httpStatus: number | null; responseMs: number | null }> {
  const primary = `https://${domain}/checkouts`;
  const res = await checkUrl(primary, { redirect: 'manual' });
  if (res.status !== 'down') {
    return { url: primary, ...res };
  }
  // Some stores require www or a trailing slash on /checkouts. Follow redirects
  // on the fallback so that www-redirects are handled correctly.
  const alt = `https://${domain}/checkouts/`;
  const altRes = await checkUrl(alt, { redirect: 'follow' });
  return { url: primary, ...altRes };
}

async function checkCollections(
  domain: string,
): Promise<{ url: string; status: PageStatus; httpStatus: number | null; responseMs: number | null }> {
  const primary = `https://${domain}/collections`;
  const res = await checkUrl(primary);
  if (res.httpStatus === 404) {
    const alt = `https://${domain}/collections/all`;
    const altRes = await checkUrl(alt);
    return { url: alt, ...altRes };
  }
  return { url: primary, ...res };
}

async function checkProduct(domain: string): Promise<{
  url: string;
  status: PageStatus;
  httpStatus: number | null;
  responseMs: number | null;
  note: string | null;
}> {
  let handle: string | null = null;
  try {
    const feedRes = await timedFetch(
      `https://${domain}/products.json?limit=1`,
      { method: 'GET', redirect: 'follow' },
    );
    if (feedRes.ok) {
      const data = (await feedRes.json()) as { products?: Array<{ handle: string }> };
      handle = data.products?.[0]?.handle ?? null;
    }
  } catch {
    handle = null;
  }

  if (!handle) {
    return {
      url: `https://${domain}/products`,
      status: 'skipped',
      httpStatus: null,
      responseMs: null,
      note: 'Could not find a product URL. The store may not be Shopify or its catalog feed is private.',
    };
  }

  const productUrl = `https://${domain}/products/${handle}`;
  const res = await checkUrl(productUrl);
  return { url: productUrl, note: null, ...res };
}

export async function checkCoverage(domain: string): Promise<CoverageResult> {
  const checkedAt = new Date().toISOString();

  const [homepageRes, collectionsRes, productRes, cartRes, checkoutRes] = await Promise.allSettled([
    checkUrl(`https://${domain}/`),
    checkCollections(domain),
    checkProduct(domain),
    checkUrl(`https://${domain}/cart`),
    checkCheckout(domain),
  ]);

  function settled<T>(r: PromiseSettledResult<T>, fallback: T): T {
    return r.status === 'fulfilled' ? r.value : fallback;
  }

  const homepage = settled(homepageRes, { status: 'error' as PageStatus, httpStatus: null, responseMs: null });
  const collections = settled(collectionsRes, {
    url: `https://${domain}/collections`,
    status: 'error' as PageStatus,
    httpStatus: null,
    responseMs: null,
  });
  const product = settled(productRes, {
    url: `https://${domain}/products`,
    status: 'error' as PageStatus,
    httpStatus: null,
    responseMs: null,
    note: null,
  });
  const cart = settled(cartRes, { status: 'error' as PageStatus, httpStatus: null, responseMs: null });
  const checkout = settled(checkoutRes, { status: 'error' as PageStatus, httpStatus: null, responseMs: null });

  const isShopify = product.status !== 'skipped';

  const checkoutNote =
    checkout.status === 'redirect'
      ? "Checkout redirects to Shopify's hosted checkout. This is normal. Monitor the entry point URL."
      : null;

  const pages: PageCheck[] = [
    {
      id: 'homepage',
      label: 'Homepage',
      url: `https://${domain}/`,
      status: homepage.status,
      httpStatus: homepage.httpStatus,
      responseMs: homepage.responseMs,
      critical: true,
      note: null,
    },
    {
      id: 'collection',
      label: 'Collections page',
      url: collections.url,
      status: collections.status,
      httpStatus: collections.httpStatus,
      responseMs: collections.responseMs,
      critical: true,
      note: null,
    },
    {
      id: 'product',
      label: 'Product page (sample)',
      url: product.url,
      status: product.status,
      httpStatus: product.httpStatus,
      responseMs: product.responseMs,
      critical: true,
      note: product.note,
    },
    {
      id: 'cart',
      label: 'Cart',
      url: `https://${domain}/cart`,
      status: cart.status,
      httpStatus: cart.httpStatus,
      responseMs: cart.responseMs,
      critical: true,
      note: null,
    },
    {
      id: 'checkout',
      label: 'Checkout entry',
      url: `https://${domain}/checkouts`,
      status: checkout.status,
      httpStatus: checkout.httpStatus,
      responseMs: checkout.responseMs,
      critical: true,
      note: checkoutNote,
    },
  ];

  const summary = {
    total: pages.length,
    up: pages.filter((p) => p.status === 'up').length,
    redirect: pages.filter((p) => p.status === 'redirect').length,
    down: pages.filter((p) => p.status === 'down').length,
    error: pages.filter((p) => p.status === 'error').length,
    skipped: pages.filter((p) => p.status === 'skipped').length,
  };

  return {
    ok: true,
    domain,
    platform: isShopify ? 'shopify' : 'unknown',
    checkedAt,
    pages,
    summary,
  };
}

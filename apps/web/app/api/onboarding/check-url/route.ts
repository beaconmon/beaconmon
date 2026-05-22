import { z } from 'zod';
import { lookup as dnsLookup } from 'node:dns/promises';
import net from 'node:net';
import { withAuth } from '@/lib/api/with-auth';
import { ValidationError } from '@/lib/api/errors';
import { createLogger } from '@beaconmon/logger';

const logger = createLogger('onboarding');

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const a = parts[0] ?? 0;
    const b = parts[1] ?? 0;
    return (
      a === 127 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a === 0
    );
  }
  if (net.isIPv6(ip)) {
    const h = ip.toLowerCase();
    return h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80');
  }
  return false;
}

async function isPrivateOrLocalAddress(hostname: string): Promise<boolean> {
  const bare = hostname.replace(/^\[|\]$/g, '');
  if (bare === 'localhost' || bare.endsWith('.localhost')) return true;
  if (net.isIP(bare)) return isPrivateIp(bare);
  try {
    const records = await dnsLookup(bare, { all: true });
    return records.some((r) => isPrivateIp(r.address));
  } catch {
    return false; // fail-open: unresolvable hosts will fail at fetch time
  }
}

const bodySchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
      message: 'URL must start with http:// or https://',
    }),
});

export const POST = withAuth(async (req) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Invalid URL');

  const { url } = parsed.data;
  const hostname = new URL(url).hostname;

  if (await isPrivateOrLocalAddress(hostname)) {
    throw new ValidationError('URL resolves to a private or internal address');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const startedAt = Date.now();
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'beaconmon/1.0 (+https://beaconmon.com)' },
    });
    const responseMs = Date.now() - startedAt;
    const html = await res.text();

    return Response.json({
      ok: res.ok,
      responseMs,
      platform: detectPlatform(res.headers, html),
    });
  } catch (err) {
    logger.error({ err, url }, 'check-url fetch failed');
    return Response.json({ ok: false, responseMs: null, platform: 'other' });
  } finally {
    clearTimeout(timer);
  }
});

function detectPlatform(
  headers: Headers,
  html: string
): 'shopify' | 'woocommerce' | 'other' {
  if (
    headers.has('x-shopify-stage') ||
    html.includes('Shopify.theme') ||
    html.includes('cdn.shopify.com')
  ) {
    return 'shopify';
  }

  const setCookie = headers.get('set-cookie') ?? '';
  if (
    setCookie.includes('woocommerce') ||
    html.includes('/wp-content/plugins/woocommerce')
  ) {
    return 'woocommerce';
  }

  return 'other';
}

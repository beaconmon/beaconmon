import 'server-only';
import https from 'node:https';
import type { TLSSocket } from 'node:tls';

const FETCH_TIMEOUT_MS = 10_000;
const SSL_TIMEOUT_MS = 8_000;
const REDIRECT_HOP_TIMEOUT_MS = 5_000;
const MAX_REDIRECT_HOPS = 5;
const SHOPIFY_MEDIAN_MS = 380;
const TOOL_USER_AGENT = 'Beaconmon/1.0 (+https://beaconmon.com)';

export interface RegionCheck {
  region: string;
  label: string;
  httpStatus: number | null;
  responseMs: number | null;
  ok: boolean;
}

export interface SslInfo {
  valid: boolean;
  expiresAt: string;
  daysRemaining: number;
  issuer: string;
}

export interface RedirectInfo {
  hops: number;
  finalUrl: string;
  hasLoop: boolean;
}

export interface BenchmarkInfo {
  shopifyMedianMs: number;
  rating: 'good' | 'fair' | 'slow';
}

export interface UptimeResult {
  ok: true;
  domain: string;
  status: 'up' | 'down';
  checks: RegionCheck[];
  ssl: SslInfo | null;
  redirects: RedirectInfo | null;
  benchmark: BenchmarkInfo | null;
}

function benchmarkRating(ms: number): 'good' | 'fair' | 'slow' {
  if (ms < 500) return 'good';
  if (ms <= 1500) return 'fair';
  return 'slow';
}

async function timedFetch(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function runHttpCheck(
  domain: string
): Promise<{ httpStatus: number | null; responseMs: number | null }> {
  const url = `https://${domain}/`;
  const headers = { 'User-Agent': TOOL_USER_AGENT };

  const headStart = Date.now();
  try {
    const headRes = await timedFetch(url, { method: 'HEAD', redirect: 'follow', headers }, FETCH_TIMEOUT_MS);
    if (headRes.status !== 405) {
      return { httpStatus: headRes.status, responseMs: Date.now() - headStart };
    }
  } catch {
    // HEAD failed with a network error; fall through to GET
  }

  // HEAD returned 405 or failed with a network error -- fall back to GET
  const getStart = Date.now();
  try {
    const getRes = await timedFetch(url, { method: 'GET', redirect: 'follow', headers }, FETCH_TIMEOUT_MS);
    // Drain body to avoid connection leaks
    await getRes.arrayBuffer().catch(() => undefined);
    return { httpStatus: getRes.status, responseMs: Date.now() - getStart };
  } catch {
    return { httpStatus: null, responseMs: null };
  }
}

export async function checkSsl(domain: string): Promise<SslInfo | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), SSL_TIMEOUT_MS);

    const req = https.request(
      {
        hostname: domain,
        port: 443,
        method: 'HEAD',
        path: '/',
        rejectUnauthorized: false,
        timeout: SSL_TIMEOUT_MS - 1_000,
        headers: { 'User-Agent': TOOL_USER_AGENT },
      },
      (res) => {
        const socket = res.socket as TLSSocket;
        const cert = socket.getPeerCertificate();
        res.destroy();
        clearTimeout(timeout);

        if (!cert?.valid_to) {
          resolve(null);
          return;
        }

        let expiresAt: string;
        let daysRemaining: number;
        try {
          const expiry = new Date(cert.valid_to);
          expiresAt = expiry.toISOString();
          daysRemaining = Math.floor((expiry.getTime() - Date.now()) / 86_400_000);
        } catch {
          resolve(null);
          return;
        }

        const issuerObj = cert.issuer as Record<string, string> | undefined;
        const issuer = issuerObj?.O || issuerObj?.CN || 'Unknown';

        resolve({
          valid: socket.authorized === true && daysRemaining > 0,
          expiresAt,
          daysRemaining,
          issuer,
        });
      }
    );

    req.on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timeout);
      resolve(null);
    });
    req.end();
  });
}

export async function followRedirectChain(startUrl: string): Promise<RedirectInfo> {
  const visited = new Set<string>();
  let current = startUrl;
  let hops = 0;
  let hasLoop = false;
  const headers = { 'User-Agent': TOOL_USER_AGENT };

  while (hops < MAX_REDIRECT_HOPS) {
    if (visited.has(current)) {
      hasLoop = true;
      break;
    }
    visited.add(current);

    let res: Response;
    try {
      res = await timedFetch(current, { method: 'GET', redirect: 'manual', headers }, REDIRECT_HOP_TIMEOUT_MS);
    } catch {
      break;
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      try {
        current = new URL(location, current).href;
      } catch {
        break;
      }
      hops++;
    } else {
      break;
    }
  }

  if (hops >= MAX_REDIRECT_HOPS) hasLoop = true;

  return { hops, finalUrl: current, hasLoop };
}

export async function checkUptime(domain: string): Promise<UptimeResult> {
  const { httpStatus, responseMs } = await runHttpCheck(domain);
  const isUp = httpStatus !== null && httpStatus >= 200 && httpStatus < 400;

  const check: RegionCheck = {
    region: 'global',
    label: 'Global (via Beaconmon servers)',
    httpStatus,
    responseMs,
    ok: isUp,
  };

  let ssl: SslInfo | null = null;
  let redirects: RedirectInfo | null = null;
  let benchmark: BenchmarkInfo | null = null;

  if (isUp) {
    [ssl, redirects] = await Promise.all([
      checkSsl(domain),
      followRedirectChain(`https://${domain}/`),
    ]);

    if (responseMs !== null) {
      benchmark = {
        shopifyMedianMs: SHOPIFY_MEDIAN_MS,
        rating: benchmarkRating(responseMs),
      };
    }
  }

  return {
    ok: true,
    domain,
    status: isUp ? 'up' : 'down',
    checks: [check],
    ssl,
    redirects,
    benchmark,
  };
}

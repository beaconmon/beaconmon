import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const PRIVATE_V4_RANGES: Array<[number, number, number]> = [
  [10, 0, 8],
  [127, 0, 8],
  [169, 254, 16],
  [172, 16, 12],
  [192, 168, 16],
  [100, 64, 10],
  [0, 0, 8],
];

function isPrivateV4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
    return true;
  }
  const a = parts[0]!;
  const asInt = (parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!;
  for (const [r1, r2, prefix] of PRIVATE_V4_RANGES) {
    const mask = prefix === 32 ? 0xffffffff : (0xffffffff << (32 - prefix)) >>> 0;
    const network = ((r1 << 24) | (r2 << 16)) >>> 0;
    if (((asInt >>> 0) & mask) === (network & mask)) return true;
  }
  if (a >= 224) return true;
  return false;
}

function isPrivateV6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('ff')) return true;
  if (lower.startsWith('::ffff:')) {
    const v4 = lower.slice('::ffff:'.length);
    if (isIP(v4) === 4) return isPrivateV4(v4);
  }
  return false;
}

export function isReservedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  return false;
}

export interface SsrfCheckResult {
  allowed: boolean;
  reason?: string;
}

export async function isHostnameSafe(host: string): Promise<SsrfCheckResult> {
  if (!host) return { allowed: false, reason: 'Empty hostname' };
  if (isReservedHostname(host)) return { allowed: false, reason: 'Reserved hostname' };

  const literal = isIP(host);
  if (literal === 4) {
    return isPrivateV4(host)
      ? { allowed: false, reason: 'Private IPv4 address' }
      : { allowed: true };
  }
  if (literal === 6) {
    return isPrivateV6(host)
      ? { allowed: false, reason: 'Private IPv6 address' }
      : { allowed: true };
  }

  try {
    const addrs = await lookup(host, { all: true });
    if (addrs.length === 0) return { allowed: false, reason: 'No DNS records' };
    for (const addr of addrs) {
      const blocked = addr.family === 4 ? isPrivateV4(addr.address) : isPrivateV6(addr.address);
      if (blocked) return { allowed: false, reason: 'Resolves to private address' };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'DNS resolution failed' };
  }
}

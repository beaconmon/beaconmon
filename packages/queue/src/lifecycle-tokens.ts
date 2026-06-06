import { createHmac, timingSafeEqual } from 'node:crypto';

// Token format: base64url(teamId:category).hmac-sha256-base64url
// Self-contained so the verify function extracts teamId+category without extra params.

export function signUnsubscribeToken(teamId: string, category: string, secret: string): string {
  const data = `${teamId}:${category}`;
  const dataB64 = Buffer.from(data).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${dataB64}.${sig}`;
}

export function verifyUnsubscribeToken(
  token: string,
  secret: string
): { teamId: string; category: string } | null {
  const dot = token.indexOf('.');
  if (dot === -1) return null;

  const dataB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let data: string;
  try {
    data = Buffer.from(dataB64, 'base64url').toString('utf-8');
  } catch {
    return null;
  }

  const expectedSig = createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  const colon = data.indexOf(':');
  if (colon === -1) return null;

  return { teamId: data.slice(0, colon), category: data.slice(colon + 1) };
}

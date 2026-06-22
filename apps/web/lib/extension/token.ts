import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@beaconmon/db';

// Bearer tokens issued to a Chrome extension install. We store only the SHA-256
// hash: the raw value is returned to the extension once and never persisted, so
// a database leak cannot be replayed against the API. Prefixed so a leaked token
// is grep-able in logs and unambiguously ours.
const TOKEN_PREFIX = 'bmext_';
const TOKEN_BYTES = 32;

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export interface ResolvedExtensionToken {
  userId: string;
  teamId: string;
}

/** Mint a new token for a (user, team) pair and return the raw value once.
 * Caller is responsible for confirming the user is a member of the team. */
export async function mintExtensionToken(userId: string, teamId: string): Promise<string> {
  const raw = `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString('base64url')}`;
  await prisma.extensionToken.create({
    data: { tokenHash: hashToken(raw), userId, teamId },
  });
  return raw;
}

/** Resolve a presented bearer token to its owner + team, or null if missing,
 * malformed, revoked, or unknown. Bumps lastUsedAt best-effort for activity. */
export async function resolveExtensionToken(raw: string | null): Promise<ResolvedExtensionToken | null> {
  if (!raw || !raw.startsWith(TOKEN_PREFIX)) return null;

  const record = await prisma.extensionToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    select: { id: true, userId: true, teamId: true, revokedAt: true },
  });
  if (!record || record.revokedAt) return null;

  // Fire-and-forget activity stamp; never block auth on it.
  void prisma.extensionToken
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return { userId: record.userId, teamId: record.teamId };
}

/** Extract the raw token from an `Authorization: Bearer <token>` header. */
export function bearerFromRequest(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

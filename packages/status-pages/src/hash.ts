import { createHmac } from 'node:crypto';

/**
 * Public status page payloads must not leak raw monitor or incident DB IDs —
 * those IDs are used elsewhere as primary keys and could enable cross-page
 * correlation or reconnaissance. Instead we expose a stable HMAC truncated to
 * 16 hex chars (64 bits, comfortably collision-resistant within a single page),
 * keyed by `slug + secret`. Same monitor on two different status pages produces
 * different hashes — limits cross-page correlation.
 *
 * The hash is *stable* per (slug, id), so client-side React keys remain
 * consistent across refreshes / cache warms.
 *
 * @param slug   Status-page slug — scopes the hash so the same monitor exposed
 *               on different pages gets different opaque IDs.
 * @param secret Server secret. Must NOT be exposed to the client.
 * @returns      A hash function `(rawId) => opaqueId` ready to apply to all
 *               IDs in a single status page payload.
 */
export function createStatusPageIdHasher(
  slug: string,
  secret: string
): (rawId: string) => string {
  if (!secret) {
    throw new Error('createStatusPageIdHasher: secret is empty');
  }
  return (rawId: string): string =>
    createHmac('sha256', secret)
      .update(slug)
      .update('\0')
      .update(rawId)
      .digest('hex')
      .slice(0, 16);
}

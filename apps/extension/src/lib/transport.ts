// Browser-fetch transport for the shared @beaconmon/checker storefront parser.
// In the extension's service worker, fetch() carries the extension's host
// permissions, so cross-origin reads of a competitor's public products.json
// succeed without a server proxy — the privacy promise ("we never receive the
// sites you browse") holds because this fetch happens entirely on-device.
import { STOREFRONT_FETCH_TIMEOUT_MS } from './config.js';
import type { StorefrontFetchDeps } from '@beaconmon/checker/storefront';

/** Single timed fetch, no retries: a passive badge should resolve fast or fall
 * back to the neutral "intel available" dot rather than block on a slow store. */
async function browserFetch(url: string, opts: { timeoutMs?: number } = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? STOREFRONT_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, credentials: 'omit' });
  } finally {
    clearTimeout(timer);
  }
}

// Storefronts are read one tab at a time on demand, so no cross-store politeness
// budget is needed; a no-op jitter keeps the parser contract satisfied.
const noJitter = (): Promise<void> => Promise.resolve();

export const storefrontDeps: StorefrontFetchDeps = {
  fetchWithRetry: browserFetch,
  politeJitter: noJitter,
};

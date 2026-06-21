// Single source of truth for the Beaconmon API origin the extension talks to.
// Swap to http://localhost:3000 for local development against the web app, and
// keep externally_connectable in static/manifest.json in sync with this host.
export const API_ORIGIN = 'https://beaconmon.com';

// Where the magic-link "connect your extension" flow lives. After the user
// authenticates there, the page mints a long-lived extension token and hands it
// back via chrome.runtime.sendMessage (see externally_connectable). The page is
// passed our extension id so it knows where to send the token.
export function connectUrl(): string {
  return `${API_ORIGIN}/extension/connect?ext_id=${chrome.runtime.id}`;
}

// Public storefront feeds rarely exceed this in promo terms; the snapshot reads
// up to MAX_SNAPSHOT_PAGES * 250 products, mirroring the web tool's floor logic.
export const MAX_SNAPSHOT_PAGES = 5;

// Per-request budget so a slow or hostile storefront can't hang the badge.
export const STOREFRONT_FETCH_TIMEOUT_MS = 10_000;

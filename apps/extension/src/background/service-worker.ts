// The orchestrator. Three jobs:
//   1. On a Shopify detection, read products.json on-device and paint the badge
//      with the store's "% of catalog on sale".
//   2. Answer popup queries (snapshot, auth, track, connect).
//   3. Accept the bearer token handed back by beaconmon.com after magic-link auth.
// Nothing about the user's browsing leaves the device except an explicit Track.
import { buildSnapshot, type SnapshotResult } from '../lib/snapshot.js';
import { getAuthState, setToken } from '../lib/auth.js';
import { track } from '../lib/api.js';
import { connectUrl } from '../lib/config.js';
import type {
  RuntimeMessage,
  ExternalTokenMessage,
  SnapshotState,
} from '../lib/messages.js';

// Per-domain snapshot cache so re-activating a tab or opening the popup reuses a
// recent read instead of re-fetching the storefront. In-memory only; a worker
// restart simply re-derives on next detection.
interface CacheEntry {
  state: SnapshotState;
  ts: number;
}
const SNAPSHOT_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function fresh(domain: string): SnapshotState | null {
  const entry = cache.get(domain);
  if (!entry) return null;
  if (Date.now() - entry.ts > SNAPSHOT_TTL_MS) {
    cache.delete(domain);
    return null;
  }
  return entry.state;
}

function store(domain: string, state: SnapshotState): void {
  cache.set(domain, { state, ts: Date.now() });
}

// --- Badge ----------------------------------------------------------------

const BADGE_GREEN = '#00935a';
const BADGE_NEUTRAL = '#6b7280';

async function paintBadge(tabId: number, state: SnapshotState): Promise<void> {
  if (state.status === 'loading') {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_NEUTRAL });
    await chrome.action.setBadgeText({ tabId, text: '…' });
    return;
  }
  if (state.status === 'ready') {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_GREEN });
    await chrome.action.setBadgeText({ tabId, text: `${state.snapshot.onSalePct}%` });
    return;
  }
  if (state.status === 'unusable') {
    // Shopify, but the feed is blocked/absent. Never show 0% (a lie) — a neutral
    // dot says "intel available, open me" without asserting a sale rate.
    await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_NEUTRAL });
    await chrome.action.setBadgeText({ tabId, text: '•' });
    return;
  }
  await chrome.action.setBadgeText({ tabId, text: '' });
}

function toState(result: SnapshotResult): SnapshotState {
  if (result.ok) return { status: 'ready', snapshot: result.snapshot };
  // 'not_shopify' here means detected-but-unreadable feed -> "intel available".
  // 'unreachable' means the host failed entirely -> clear the badge.
  return result.reason === 'not_shopify' ? { status: 'unusable' } : { status: 'none' };
}

/** Resolve a snapshot for a domain, using the cache and updating the tab badge. */
async function resolveSnapshot(domain: string, tabId?: number): Promise<SnapshotState> {
  const cached = fresh(domain);
  if (cached) {
    if (tabId !== undefined) await paintBadge(tabId, cached);
    return cached;
  }

  if (tabId !== undefined) await paintBadge(tabId, { status: 'loading' });

  const result = await buildSnapshot(domain);
  const state = toState(result);
  store(domain, state);
  if (tabId !== undefined) await paintBadge(tabId, state);
  return state;
}

// --- Message routing (in-extension: content script + popup) ----------------

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  void handleMessage(message, sender).then(sendResponse).catch(() => sendResponse(undefined));
  // Returning true keeps the response channel open for the async work above.
  return true;
});

async function handleMessage(
  message: RuntimeMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'SHOPIFY_DETECTED':
      return resolveSnapshot(message.domain, sender.tab?.id);

    case 'GET_SNAPSHOT':
      return resolveSnapshot(message.domain);

    case 'GET_AUTH':
      return getAuthState();

    case 'CONNECT':
      await chrome.tabs.create({ url: connectUrl() });
      return { opened: true };

    case 'TRACK':
      return track(message.domain, message.name);

    default:
      return undefined;
  }
}

// --- External message routing (beaconmon.com hands back the bearer token) ---

chrome.runtime.onMessageExternal.addListener((message: ExternalTokenMessage, sender, sendResponse) => {
  // Only accept tokens from our own web origins (also gated by
  // externally_connectable.matches in the manifest, this is defense in depth).
  const origin = sender.origin ?? '';
  const trusted = /^https:\/\/([a-z0-9-]+\.)?beaconmon\.com$/.test(origin) || origin === 'http://localhost:3000';
  if (!trusted || message?.type !== 'EXT_TOKEN' || typeof message.token !== 'string') {
    sendResponse({ ok: false });
    return false;
  }
  void setToken(message.token, message.teamName).then(() => sendResponse({ ok: true }));
  return true;
});

// Re-evaluate the badge when the user switches to an already-open tab, so a
// cached snapshot reappears without needing a fresh page load / detection.
chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs.get(tabId).then((tab) => {
    if (!tab.url) return;
    let host: string;
    try {
      host = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return;
    }
    const cached = fresh(host);
    void paintBadge(tabId, cached ?? { status: 'none' });
  });
});

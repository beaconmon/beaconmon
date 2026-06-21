// Popup UI. Resolves the active tab's store, asks the service worker for the
// cached/fresh snapshot and auth state, and renders the X-ray + one-click Track.
// All heavy lifting (feed read, badge, API) lives in the worker; this is view-only.
import type {
  GetSnapshotMessage,
  GetAuthMessage,
  TrackMessage,
  ConnectMessage,
  SnapshotState,
  AuthState,
  TrackResult,
} from '../lib/messages.js';
import type { Snapshot, SnapshotProduct } from '../lib/snapshot.js';
import { clearToken } from '../lib/auth.js';

const root = document.getElementById('root')!;
const authEl = document.getElementById('auth')!;

async function activeDomain(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return new URL(tab.url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function money(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (!Number.isFinite(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function discountPct(price: string, compareAt: string): number | null {
  const p = Number.parseFloat(price);
  const c = Number.parseFloat(compareAt);
  if (!Number.isFinite(p) || !Number.isFinite(c) || c <= 0 || p >= c) return null;
  return Math.round((1 - p / c) * 100);
}

function el(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderMessage(text: string, cls = 'muted'): void {
  root.replaceChildren(el('div', cls, text));
}

function renderSnapshot(snapshot: Snapshot, auth: AuthState): void {
  root.replaceChildren();

  root.appendChild(el('div', 'domain', snapshot.domain));

  const stats = el('div', 'stats');
  stats.appendChild(stat(formatCount(snapshot.productCount, snapshot.countIsFloor), 'Products'));
  stats.appendChild(stat(`${snapshot.onSalePct}%`, 'On sale', snapshot.onSalePct > 0));
  stats.appendChild(stat(String(snapshot.availableCount), 'In stock'));
  root.appendChild(stats);

  if (snapshot.onSale.length > 0) {
    root.appendChild(el('p', 'section-title', 'Currently discounted'));
    root.appendChild(onSaleList(snapshot.onSale, snapshot.currency));
  }

  const btn = el('button', 'btn') as HTMLButtonElement;
  btn.textContent = auth.connected ? `Watch ${snapshot.domain}` : 'Connect & watch this store';
  const note = el('div', 'note');
  root.appendChild(btn);
  root.appendChild(note);

  btn.addEventListener('click', () => {
    void onTrack(snapshot, btn, note);
  });
}

function stat(value: string, label: string, accent = false): HTMLElement {
  const wrap = el('div', 'stat');
  const val = el('div', `val${accent ? ' accent' : ''}`, value);
  wrap.appendChild(val);
  wrap.appendChild(el('div', 'lbl', label));
  return wrap;
}

function formatCount(n: number, isFloor: boolean): string {
  return isFloor ? `${n}+` : String(n);
}

function onSaleList(products: SnapshotProduct[], currency: string): HTMLElement {
  const ul = el('ul', 'list');
  for (const p of products) {
    const li = el('li');
    const a = el('a', undefined, p.title) as HTMLAnchorElement;
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow';
    li.appendChild(a);

    const price = el('span', 'price');
    price.appendChild(el('span', undefined, money(p.price, currency)));
    if (p.compareAtPrice) {
      price.appendChild(el('span', 'was', money(p.compareAtPrice, currency)));
      const pct = discountPct(p.price, p.compareAtPrice);
      if (pct !== null) price.appendChild(el('span', 'pct', `-${pct}%`));
    }
    li.appendChild(price);
    ul.appendChild(li);
  }
  return ul;
}

async function onTrack(snapshot: Snapshot, btn: HTMLButtonElement, note: HTMLElement): Promise<void> {
  btn.disabled = true;
  note.className = 'note';
  note.textContent = 'Starting…';

  const msg: TrackMessage = { type: 'TRACK', domain: snapshot.domain, name: snapshot.domain };
  const result = (await chrome.runtime.sendMessage(msg)) as TrackResult;

  if (result.ok) {
    note.className = 'note ok';
    note.textContent = result.alreadyTracking
      ? `Already watching ${snapshot.domain}.`
      : `Now watching ${snapshot.domain}. We'll alert you on price and promo changes.`;
    btn.textContent = 'Tracking ✓';
    return;
  }

  if (result.reason === 'unauthenticated') {
    // Send them to the magic-link connect flow; the worker opens the tab and
    // stores the token once beaconmon.com hands it back.
    await chrome.runtime.sendMessage({ type: 'CONNECT' } satisfies ConnectMessage);
    note.className = 'note';
    note.textContent = 'Finish connecting in the new tab, then click again.';
    btn.disabled = false;
    return;
  }

  if (result.reason === 'limit') {
    note.className = 'note err';
    const link = el('a', 'note-link', 'Upgrade your plan') as HTMLAnchorElement;
    link.href = 'https://beaconmon.com/billing';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    note.replaceChildren(document.createTextNode('Competitor limit reached. '), link);
    btn.disabled = false;
    return;
  }

  note.className = 'note err';
  note.textContent = result.message;
  btn.disabled = false;
}

function renderAuthHeader(auth: AuthState): void {
  if (!auth.connected) {
    authEl.textContent = 'Not connected';
    return;
  }
  const discBtn = el('button', 'disc-btn', 'Disconnect');
  discBtn.addEventListener('click', () => {
    void clearToken().then(() => { window.location.reload(); });
  });
  authEl.replaceChildren(
    document.createTextNode(auth.teamName ?? 'Connected'),
    document.createTextNode(' · '),
    discBtn,
  );
}

async function main(): Promise<void> {
  const domain = await activeDomain();
  if (!domain) {
    renderMessage('Open a Shopify store to X-ray its promos.');
    return;
  }

  const auth = (await chrome.runtime.sendMessage({ type: 'GET_AUTH' } satisfies GetAuthMessage)) as AuthState;
  renderAuthHeader(auth);

  renderMessage('Reading catalog…');
  const state = (await chrome.runtime.sendMessage({
    type: 'GET_SNAPSHOT',
    domain,
  } satisfies GetSnapshotMessage)) as SnapshotState;

  if (state.status === 'ready') {
    renderSnapshot(state.snapshot, auth);
  } else if (state.status === 'unusable') {
    renderMessage("This looks like Shopify, but its catalog feed is locked. Some large brands block it. Nothing to X-ray here.");
  } else {
    renderMessage('No Shopify catalog detected on this page.');
  }
}

void main();

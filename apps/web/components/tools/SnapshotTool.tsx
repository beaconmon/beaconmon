'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';
import ShareButtons from '@/components/tools/ShareButtons';

// Mirrors the /api/tools/snapshot response shape (see app/api/tools/snapshot/route.ts).
interface SnapshotProduct {
  title: string;
  handle: string;
  url: string;
  price: string;
  compareAtPrice: string | null;
  onSale: boolean;
  available: boolean;
}
interface Snapshot {
  domain: string;
  platform: 'shopify';
  currency: string;
  countIsFloor: boolean;
  productCount: number;
  onSaleCount: number;
  availableCount: number;
  onSale: SnapshotProduct[];
  sample: SnapshotProduct[];
  takenAt: string;
}
type ApiResponse =
  | ({ ok: true; snapshot: Snapshot; cached?: boolean })
  | ({ ok: false; reason: 'not_shopify' | 'unreachable'; cached?: boolean })
  | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; snapshot: Snapshot };

const EXAMPLES = ['allbirds.com', 'brooklinen.com', 'chubbiesshorts.com'];

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

function formatCount(n: number, isFloor: boolean): string {
  return isFloor ? `${n.toLocaleString()}+` : n.toLocaleString();
}

export default function SnapshotTool() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  async function runSnapshot(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.status === 429) {
        setState({ status: 'error', message: 'Too many scans in a short window. Wait a minute, then try again.' });
        return;
      }
      const data = (await res.json()) as ApiResponse;
      if ('error' in data) {
        setState({ status: 'error', message: data.error });
        return;
      }
      if (!data.ok) {
        setState({
          status: 'error',
          message:
            data.reason === 'not_shopify'
              ? "We could not read this store's catalog. It may not be a Shopify store, or it uses a custom storefront that blocks public catalog access. Some large brands do this."
              : 'We could not reach that store. Check the URL and try again.',
        });
        return;
      }
      setState({ status: 'success', snapshot: data.snapshot });
    } catch {
      setState({ status: 'error', message: 'Something went wrong running the snapshot. Please try again.' });
    }
  }

  const loading = state.status === 'loading';

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSnapshot(url);
        }}
        className="flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[560px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
      >
        <label htmlFor="snapshot-url" className="sr-only">
          Shopify store URL
        </label>
        <input
          id="snapshot-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="competitor-store.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 min-w-0 bg-transparent border-0 text-brand-text font-[inherit] text-[16px] px-[14px] outline-none placeholder:text-brand-muted disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || url.trim() === ''}
          className="inline-flex items-center justify-center gap-2 h-[48px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Spinner /> Scanning
            </>
          ) : (
            <>Run free snapshot</>
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-brand-muted">
        <span>No signup, no install.</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span aria-hidden className="text-brand-line">|</span>
          Try:
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => {
                setUrl(ex);
                void runSnapshot(ex);
              }}
              className="font-mono text-brand-dim underline decoration-brand-line underline-offset-2 hover:text-brand-green-ink hover:decoration-brand-green-ink transition-colors disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </span>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'success' && <SnapshotResult snapshot={state.snapshot} />}
      </div>
      {state.status === 'success' && (
        <ShareButtons
          tweetText={`${state.snapshot.domain} has ${state.snapshot.countIsFloor ? `${state.snapshot.productCount.toLocaleString()}+` : state.snapshot.productCount.toLocaleString()} products, ${state.snapshot.onSaleCount} currently on sale. Via @beaconmon free snapshot:`}
        />
      )}
    </div>
  );
}

function SnapshotResult({ snapshot }: { snapshot: Snapshot }) {
  const taken = new Date(snapshot.takenAt);
  const signUpHref = `/sign-up?competitor=${encodeURIComponent(snapshot.domain)}`;

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[820px]">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-green-ink" />
            Shopify
          </span>
          <span className="font-mono text-[14px] text-brand-text truncate">{snapshot.domain}</span>
        </div>
        <span className="text-[12px] text-brand-muted whitespace-nowrap">
          Snapshot{' '}
          <time dateTime={snapshot.takenAt}>
            {taken.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </time>
        </span>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 max-[480px]:grid-cols-1 divide-x max-[480px]:divide-x-0 max-[480px]:divide-y divide-brand-line-soft">
        <Stat label="Products live" value={formatCount(snapshot.productCount, snapshot.countIsFloor)} />
        <Stat
          label="On sale now"
          value={snapshot.onSaleCount.toLocaleString()}
          accent={snapshot.onSaleCount > 0}
        />
        <Stat label="In stock" value={snapshot.availableCount.toLocaleString()} />
      </div>

      {/* On-sale list */}
      {snapshot.onSale.length > 0 && (
        <div className="px-6 py-5 border-t border-brand-line-soft">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">
            Currently discounted
          </h3>
          <ul className="divide-y divide-brand-line-soft">
            {snapshot.onSale.map((p) => {
              const pct = p.compareAtPrice ? discountPct(p.price, p.compareAtPrice) : null;
              return (
                <li key={p.handle} className="flex items-center justify-between gap-4 py-2.5">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-[14px] text-brand-text hover:text-brand-green-ink transition-colors truncate"
                  >
                    {p.title}
                  </a>
                  <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[13px]">
                    <span className="text-brand-text">{money(p.price, snapshot.currency)}</span>
                    {p.compareAtPrice && (
                      <span className="text-brand-muted line-through">{money(p.compareAtPrice, snapshot.currency)}</span>
                    )}
                    {pct !== null && (
                      <span className="rounded-md bg-brand-green-glow-10 px-1.5 py-0.5 text-[11px] font-semibold text-brand-green-ink">
                        -{pct}%
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sample grid */}
      <div className="px-6 py-5 border-t border-brand-line-soft">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">Catalog sample</h3>
        <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-x-6 gap-y-2">
          {snapshot.sample.map((p) => (
            <div key={p.handle} className="flex items-center justify-between gap-3 py-1.5 border-b border-brand-line-soft last:border-b-0">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[13px] text-brand-dim hover:text-brand-text transition-colors truncate"
              >
                {p.title}
              </a>
              <span className="font-mono text-[12px] text-brand-muted whitespace-nowrap">
                {money(p.price, snapshot.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade seam: snapshot is one-time, monitoring is continuous */}
      <div className="px-6 py-5 border-t border-brand-line bg-brand-bg-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[14px] text-brand-dim max-w-[440px] leading-[1.55]">
            This is a point in time. Watch {snapshot.domain} and get an alert the moment a price drops, a promo
            launches, or a product goes live.
          </p>
          <a
            href={signUpHref}
            onClick={() => {
              // Stash for the onboarding wizard to prefill the competitor step.
              // localStorage survives the signup and /today hops a query param can't.
              try {
                localStorage.setItem('beaconmon:competitor', snapshot.domain);
              } catch {
                // Non-fatal - the ?competitor= param on the href is the fallback.
              }
            }}
            className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            Watch this store &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 py-5">
      <div
        className={`font-display text-[32px] leading-none font-extrabold tracking-[-0.02em] ${
          accent ? 'text-brand-green-ink' : 'text-brand-text'
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[12px] uppercase tracking-[0.08em] text-brand-muted">{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="snap-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

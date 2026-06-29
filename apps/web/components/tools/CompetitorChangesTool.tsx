'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';
import type { ChangeType, RecentChange } from '@/lib/tools/competitor-changes';

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

interface ResultData {
  domain: string;
  hasHistory: boolean;
  snapshot: Snapshot;
  recentChanges: RecentChange[];
}

type ApiResponse =
  | ({ ok: true } & ResultData & { cached?: boolean })
  | { ok: false; reason: 'not_shopify' | 'unreachable'; cached?: boolean }
  | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: ResultData };

const EXAMPLES = ['gymshark.com', 'brooklinen.com', 'allbirds.com'];

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

function daysSince(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)));
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

export default function CompetitorChangesTool() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('url');
    if (q) {
      setUrl(q);
      runCheck(q);
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/competitor-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.status === 429) {
        setState({ status: 'error', message: 'Too many checks in a short window. Wait a minute, then try again.' });
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
              ? "We could not read this store's catalog. It may not be a Shopify store, or it uses a custom storefront that blocks public catalog access."
              : 'We could not reach that store. Check the URL and try again.',
        });
        return;
      }
      setState({ status: 'success', data: { domain: data.domain, hasHistory: data.hasHistory, snapshot: data.snapshot, recentChanges: data.recentChanges } });
    } catch {
      setState({ status: 'error', message: 'Something went wrong running the check. Please try again.' });
    }
  }

  const loading = state.status === 'loading';

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runCheck(url);
        }}
        className="flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[560px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
      >
        <label htmlFor="changes-url" className="sr-only">
          Shopify store URL
        </label>
        <input
          id="changes-url"
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
              <Spinner /> Checking
            </>
          ) : (
            <>Check for changes</>
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
                void runCheck(ex);
              }}
              className="font-mono text-brand-dim underline decoration-brand-line underline-offset-2 hover:text-brand-green-ink hover:decoration-brand-green-ink transition-colors disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </span>
      </div>

      {loading && (
        <div className="mt-4 text-[14px] text-brand-dim flex items-center gap-2">
          <Spinner />
          Scanning store and checking change history...
        </div>
      )}

      <div aria-live="polite" className="mt-6">
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'success' && <ChangesResult data={state.data} />}
      </div>
    </div>
  );
}

function ChangesResult({ data }: { data: ResultData }) {
  const { domain, hasHistory, snapshot, recentChanges } = data;
  const signUpHref = `/sign-up?ref=competitor-changes&competitor=${encodeURIComponent(domain)}`;
  const taken = new Date(snapshot.takenAt);
  const lastChangeAt = recentChanges[0]?.detectedAt;

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[820px]">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-green-ink" />
            Shopify
          </span>
          <span className="font-mono text-[14px] text-brand-text truncate">{domain}</span>
        </div>
        <span className="text-[12px] text-brand-muted whitespace-nowrap">
          Checked{' '}
          <time dateTime={snapshot.takenAt}>
            {taken.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </time>
        </span>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 max-[480px]:grid-cols-1 divide-x max-[480px]:divide-x-0 max-[480px]:divide-y divide-brand-line-soft">
        <Stat label="Products live" value={formatCount(snapshot.productCount, snapshot.countIsFloor)} />
        <Stat label="On sale now" value={snapshot.onSaleCount.toLocaleString()} accent={snapshot.onSaleCount > 0} />
        {hasHistory && lastChangeAt ? (
          <Stat label="Last change" value={daysSince(lastChangeAt)} accent />
        ) : (
          <Stat label="In stock" value={snapshot.availableCount.toLocaleString()} />
        )}
      </div>

      {/* Change timeline (has history) */}
      {hasHistory && (
        <div className="px-6 py-5 border-t border-brand-line-soft">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">
            Recent changes (last 7 days)
          </h3>
          <ul className="divide-y divide-brand-line-soft">
            {recentChanges.map((change, i) => (
              <li key={i} className="flex items-start gap-3 py-3">
                <span className="shrink-0 mt-[2px]">
                  <ChangeIcon type={change.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-[14px] font-semibold text-brand-text">{change.summary}</span>
                    <span className="text-[12px] text-brand-muted whitespace-nowrap">
                      <time dateTime={change.detectedAt}>
                        {new Date(change.detectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </time>
                    </span>
                  </div>
                  <p className="text-[13px] text-brand-dim mt-0.5 truncate">{change.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blurred placeholder (no history) */}
      {!hasHistory && (
        <div className="px-6 py-5 border-t border-brand-line-soft">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">
            Change history
          </h3>
          <div className="space-y-3 select-none" aria-hidden>
            {[
              { label: 'Price change', detail: '████████████: $00 -> $00 (00% off)' },
              { label: 'Promotion detected', detail: '█████████████████████████' },
              { label: 'New product added', detail: '████████████████████' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 py-2 blur-sm opacity-40">
                <div className="h-4 w-4 rounded-full bg-brand-muted shrink-0 mt-0.5" />
                <div>
                  <div className="text-[14px] font-semibold text-brand-text">{row.label}</div>
                  <div className="text-[13px] text-brand-dim mt-0.5">{row.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-brand-dim">
            No change history yet for this store. Start monitoring it and Beaconmon will capture future changes automatically.
          </p>
        </div>
      )}

      {/* On-sale list (no history state) */}
      {!hasHistory && snapshot.onSale.length > 0 && (
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

      {/* Conversion seam */}
      <div className="px-6 py-5 border-t border-brand-line bg-brand-bg-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[14px] text-brand-dim max-w-[440px] leading-[1.55]">
            {hasHistory
              ? `This is the last 7 days. Beaconmon catches changes the moment they happen and alerts you right away.`
              : `Monitor ${domain} to capture future price drops, promo launches, and product changes as they happen.`}
          </p>
          <a
            href={signUpHref}
            onClick={() => {
              try {
                localStorage.setItem('beaconmon:competitor', domain);
              } catch {
                // Non-fatal.
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

function ChangeIcon({ type }: { type: ChangeType }) {
  const base = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'price_drop':
      return (
        <svg className={`${base} text-brand-amber`} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 4h7l5 4-5 4H2V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="5" cy="8" r="1" fill="currentColor" />
        </svg>
      );
    case 'promo_launched':
      return (
        <svg className={`${base} text-brand-green-ink`} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 6.5C2 5.7 2.7 5 3.5 5L10 5l3 2.5L10 10l-6.5 0C2.7 10 2 9.3 2 8.5v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'product_added':
      return (
        <svg className={`${base} text-brand-green-ink`} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'product_removed':
      return (
        <svg className={`${base} text-brand-red`} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={`${base} text-brand-dim`} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-fetch';
import ShareButtons from '@/components/tools/ShareButtons';

interface RegionCheck {
  region: string;
  label: string;
  httpStatus: number | null;
  responseMs: number | null;
  ok: boolean;
}

interface SslInfo {
  valid: boolean;
  expiresAt: string;
  daysRemaining: number;
  issuer: string;
}

interface RedirectInfo {
  hops: number;
  finalUrl: string;
  hasLoop: boolean;
}

interface BenchmarkInfo {
  shopifyMedianMs: number;
  rating: 'good' | 'fair' | 'slow';
}

interface UptimeApiResponse {
  ok: true;
  domain: string;
  status: 'up' | 'down';
  checks: RegionCheck[];
  ssl: SslInfo | null;
  redirects: RedirectInfo | null;
  benchmark: BenchmarkInfo | null;
  cached: boolean;
}

type ApiResponse = UptimeApiResponse | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: UptimeApiResponse };

const EXAMPLES = ['gymshark.com', 'allbirds.com', 'brooklinen.com'];

const HTTP_STATUS_LABELS: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Page not found',
  429: 'Too many requests',
  500: 'Server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
};

function httpStatusLabel(status: number | null): string {
  if (status === null) return 'Not responding';
  const label = HTTP_STATUS_LABELS[status];
  if (label) return label;
  if (status >= 500) return 'Server error';
  if (status >= 400) return 'Client error';
  return `HTTP ${status}`;
}

const RATING_COLOR: Record<BenchmarkInfo['rating'], string> = {
  good: 'bg-brand-green',
  fair: 'bg-brand-amber',
  slow: 'bg-brand-red',
};

const RATING_TEXT: Record<BenchmarkInfo['rating'], string> = {
  good: 'text-brand-green-ink',
  fair: 'text-brand-amber',
  slow: 'text-brand-red',
};

const RATING_LABEL: Record<BenchmarkInfo['rating'], string> = {
  good: 'Fast',
  fair: 'Fair',
  slow: 'Slow',
};

export default function UptimeTester() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  async function runCheck(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/uptime-test', {
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
      setState({ status: 'success', data });
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
        <label htmlFor="uptime-url" className="sr-only">
          Shopify store URL
        </label>
        <input
          id="uptime-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="your-store.com"
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
            <>Test now</>
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-brand-muted">
        <span>No signup, no app install. Results in under 10 seconds.</span>
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

      <div aria-live="polite" className="mt-6">
        {state.status === 'loading' && (
          <div className="flex items-center gap-3 text-[14px] text-brand-dim">
            <Spinner />
            <span>Checking your store...</span>
          </div>
        )}
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'success' && <UptimeResult data={state.data} />}
      </div>
      {state.status === 'success' && (
        <ShareButtons tweetText={buildUptimeTweet(state.data)} />
      )}
    </div>
  );
}

function buildUptimeTweet(data: UptimeApiResponse): string {
  const responseMs = data.checks[0]?.responseMs;
  const sslStatus = data.ssl?.valid ? 'valid' : data.ssl ? 'invalid' : 'unknown';
  const msPart = responseMs !== null && responseMs !== undefined ? `, ${responseMs}ms response` : '';
  return `${data.domain} is ${data.status === 'up' ? 'UP' : 'DOWN'}${msPart}, SSL ${sslStatus}. Checked with @beaconmon:`;
}

function UptimeResult({ data }: { data: UptimeApiResponse }) {
  const isUp = data.status === 'up';
  const check = data.checks[0];

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[760px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
        <span className="font-mono text-[14px] text-brand-text truncate">{data.domain}</span>
        <span className="text-[12px] text-brand-muted whitespace-nowrap">
          {data.cached ? 'Cached result' : 'Checked just now'}
        </span>
      </div>

      {/* Status row */}
      <div className="px-6 py-6 border-b border-brand-line-soft">
        <div className="flex flex-wrap items-center gap-5">
          <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-[15px] tracking-wide ${isUp ? 'bg-brand-green-glow-10 text-brand-green-ink' : 'bg-[oklch(55%_0.22_25_/_10%)] text-brand-red'}`}>
            {isUp ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green" />
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
            )}
            {isUp ? 'UP' : 'DOWN'}
          </div>

          {check && (
            <div className="flex flex-wrap items-center gap-4 text-[14px]">
              {check.responseMs !== null && (
                <div>
                  <span className="font-display text-[28px] font-extrabold tracking-[-0.02em] text-brand-text leading-none">
                    {check.responseMs}
                  </span>
                  <span className="ml-1 text-brand-muted text-[13px]">ms</span>
                </div>
              )}
              {check.httpStatus !== null && (
                <span className="text-brand-muted text-[13px]">
                  HTTP {check.httpStatus}
                  {!isUp && (
                    <span className="ml-1 text-brand-red">({httpStatusLabel(check.httpStatus)})</span>
                  )}
                </span>
              )}
              {check.httpStatus === null && (
                <span className="text-brand-red text-[13px]">{httpStatusLabel(null)}</span>
              )}
            </div>
          )}
        </div>

        {!isUp && (
          <p className="mt-4 text-[14px] text-brand-dim leading-[1.6] max-w-[520px]">
            {check?.httpStatus === 503
              ? 'A 503 error means the server could not respond, usually due to a Shopify or app outage. Check shopifystatus.com for platform status.'
              : check?.httpStatus === 404
              ? 'A 404 error means the URL was not found. Check that the domain is correct and the store is live.'
              : check?.httpStatus === null
              ? 'The store did not respond within the timeout. It may be down, or DNS may not be resolving correctly.'
              : `HTTP ${check?.httpStatus ?? 'error'}: the store returned an error response.`}
          </p>
        )}
      </div>

      {/* SSL + Redirect cards (only when up) */}
      {isUp && (data.ssl || data.redirects) && (
        <div className="grid grid-cols-2 max-[520px]:grid-cols-1 divide-x max-[520px]:divide-x-0 max-[520px]:divide-y divide-brand-line-soft border-b border-brand-line-soft">
          {data.ssl && (
            <div className="px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">SSL certificate</div>
              <div className={`flex items-center gap-2 text-[14px] font-semibold mb-1.5 ${data.ssl.valid ? 'text-brand-green-ink' : 'text-brand-red'}`}>
                {data.ssl.valid ? <CheckMark /> : <XMark />}
                {data.ssl.valid ? 'Valid' : 'Invalid or expired'}
              </div>
              <div className="text-[13px] text-brand-muted">
                {data.ssl.daysRemaining > 0
                  ? `Expires in ${data.ssl.daysRemaining} days`
                  : 'Certificate has expired'}
              </div>
              <div className="text-[12px] text-brand-muted mt-0.5">{data.ssl.issuer}</div>
            </div>
          )}
          {data.redirects && (
            <div className="px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">Redirect chain</div>
              <div className={`flex items-center gap-2 text-[14px] font-semibold mb-1.5 ${data.redirects.hasLoop ? 'text-brand-red' : 'text-brand-green-ink'}`}>
                {data.redirects.hasLoop ? <XMark /> : <CheckMark />}
                {data.redirects.hasLoop
                  ? 'Redirect loop detected'
                  : data.redirects.hops === 0
                  ? 'No redirects'
                  : `${data.redirects.hops} redirect${data.redirects.hops === 1 ? '' : 's'} (healthy)`}
              </div>
              <div className="text-[12px] text-brand-muted font-mono truncate max-w-[220px]" title={data.redirects.finalUrl}>
                {data.redirects.finalUrl}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Benchmark bar */}
      {isUp && data.benchmark && data.checks[0]?.responseMs !== null && (
        <div className="px-6 py-5 border-b border-brand-line-soft">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-4">Response time vs. Shopify average</div>
          <BenchmarkBar responseMs={data.checks[0]!.responseMs!} benchmark={data.benchmark} />
        </div>
      )}

      {/* Conversion seam */}
      <div className="px-6 py-5 bg-brand-bg-section">
        {isUp ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[14px] text-brand-dim max-w-[420px] leading-[1.55]">
              Your store is up right now. Beaconmon checks it every minute and alerts you the moment something breaks.
            </p>
            <Link
              href="/sign-up?ref=uptime-test-up"
              className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
            >
              Monitor this store &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[14px] text-brand-dim max-w-[420px] leading-[1.55]">
              Know the instant your store recovers, and when it next goes down.
            </p>
            <Link
              href="/sign-up?ref=uptime-test-down"
              className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
            >
              Get alerted when it recovers &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BenchmarkBar({ responseMs, benchmark }: { responseMs: number; benchmark: BenchmarkInfo }) {
  const MAX_MS = 2000;
  const storeWidth = Math.min(100, (responseMs / MAX_MS) * 100);
  const medianWidth = Math.min(100, (benchmark.shopifyMedianMs / MAX_MS) * 100);
  const ratingColor = RATING_COLOR[benchmark.rating];
  const ratingText = RATING_TEXT[benchmark.rating];
  const ratingLabel = RATING_LABEL[benchmark.rating];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[12px]">
          <span className="text-brand-dim">Your store</span>
          <span className={`font-semibold ${ratingText}`}>{responseMs} ms ({ratingLabel})</span>
        </div>
        <div className="h-2 w-full rounded-full bg-brand-bg2">
          <div
            className={`h-2 rounded-full transition-all ${ratingColor}`}
            style={{ width: `${storeWidth}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[12px]">
          <span className="text-brand-dim">Shopify average</span>
          <span className="text-brand-muted">{benchmark.shopifyMedianMs} ms</span>
        </div>
        <div className="h-2 w-full rounded-full bg-brand-bg2">
          <div
            className="h-2 rounded-full bg-brand-line"
            style={{ width: `${medianWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
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

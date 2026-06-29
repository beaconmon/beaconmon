'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

interface SslInfo {
  valid: boolean;
  expiresAt: string;
  daysRemaining: number;
  issuer: string;
  commonName: string;
}

interface SslApiResponse {
  ok: true;
  domain: string;
  reachable: boolean;
  ssl: SslInfo | null;
  cached: boolean;
}

type ApiResponse = SslApiResponse | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: SslApiResponse };

const EXAMPLES = ['example.com', 'shopify.com', 'cloudflare.com'];

type Severity = 'good' | 'warn' | 'bad';

function severityFor(ssl: SslInfo): Severity {
  if (!ssl.valid || ssl.daysRemaining < 15) return 'bad';
  if (ssl.daysRemaining <= 60) return 'warn';
  return 'good';
}

const SEVERITY_TEXT: Record<Severity, string> = {
  good: 'text-brand-green-ink',
  warn: 'text-brand-amber',
  bad: 'text-brand-red',
};

const SEVERITY_DOT: Record<Severity, string> = {
  good: 'bg-brand-green',
  warn: 'bg-brand-amber',
  bad: 'bg-brand-red',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function SslChecker() {
  const [domain, setDomain] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  async function runCheck(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmed }),
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
      setState({ status: 'error', message: 'Something went wrong checking the certificate. Please try again.' });
    }
  }

  const loading = state.status === 'loading';

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runCheck(domain);
        }}
        className="flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[560px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
      >
        <label htmlFor="ssl-domain" className="sr-only">
          Website domain
        </label>
        <input
          id="ssl-domain"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
          className="flex-1 min-w-0 bg-transparent border-0 text-brand-text font-[inherit] text-[16px] px-[14px] outline-none placeholder:text-brand-muted disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || domain.trim() === ''}
          className="inline-flex items-center justify-center gap-2 h-[48px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Spinner /> Checking
            </>
          ) : (
            <>Check SSL</>
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-brand-muted">
        <span>No signup, no install. Results in under 10 seconds.</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span aria-hidden className="text-brand-line">|</span>
          Try:
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => {
                setDomain(ex);
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
            <span>Reading the certificate...</span>
          </div>
        )}
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'success' && <SslResult data={state.data} />}
      </div>
    </div>
  );
}

function SslResult({ data }: { data: SslApiResponse }) {
  if (!data.reachable || !data.ssl) {
    return (
      <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[640px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
          <span className="font-mono text-[14px] text-brand-text truncate">{data.domain}</span>
          <span className="text-[12px] text-brand-muted whitespace-nowrap">
            {data.cached ? 'Cached result' : 'Checked just now'}
          </span>
        </div>
        <div className="px-6 py-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-[15px] tracking-wide bg-[oklch(55%_0.22_25_/_10%)] text-brand-red">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
            No certificate found
          </div>
          <p className="mt-4 text-[14px] text-brand-dim leading-[1.6] max-w-[520px]">
            We could not complete a TLS handshake on port 443. The domain may not serve HTTPS, may be unreachable, or may
            not resolve. Double check the domain and that the store is live.
          </p>
        </div>
      </div>
    );
  }

  const ssl = data.ssl;
  const severity = severityFor(ssl);
  const expired = ssl.daysRemaining <= 0;

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[640px]">
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
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-[15px] tracking-wide ${
              ssl.valid ? 'bg-brand-green-glow-10 text-brand-green-ink' : 'bg-[oklch(55%_0.22_25_/_10%)] text-brand-red'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${ssl.valid ? 'bg-brand-green' : 'bg-brand-red'}`} />
            {ssl.valid ? 'Valid' : expired ? 'Expired' : 'Invalid'}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-[28px] font-extrabold tracking-[-0.02em] leading-none ${SEVERITY_TEXT[severity]}`}>
              {expired ? Math.abs(ssl.daysRemaining) : ssl.daysRemaining}
            </span>
            <span className="text-brand-muted text-[13px]">
              {expired ? 'days ago' : 'days remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-3 max-[520px]:grid-cols-1 divide-x max-[520px]:divide-x-0 max-[520px]:divide-y divide-brand-line-soft border-b border-brand-line-soft">
        <DetailCell label="Expires on">
          <span className={SEVERITY_TEXT[severity]}>{formatDate(ssl.expiresAt)}</span>
        </DetailCell>
        <DetailCell label="Issuer">{ssl.issuer}</DetailCell>
        <DetailCell label="Common name">
          <span className="font-mono text-[13px]">{ssl.commonName}</span>
        </DetailCell>
      </div>

      {/* Severity note */}
      <div className="px-6 py-4 flex items-start gap-3">
        <span className={`mt-[5px] h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[severity]}`} />
        <p className="text-[13px] text-brand-dim leading-[1.6]">
          {severity === 'good'
            ? 'This certificate has plenty of runway. A safe renewal window is 30 days before expiry, so there is nothing to do yet.'
            : severity === 'warn'
              ? 'This certificate expires within 60 days. Most teams renew at least 30 days out. If it is not on auto-renew, schedule the renewal now.'
              : expired
                ? 'This certificate has expired. Visitors are seeing a browser security warning instead of your store. Renew it immediately.'
                : 'This certificate expires in under 15 days or is not trusted. Renew it now to avoid a security warning that blocks customers at checkout.'}
        </p>
      </div>

      {/* Conversion seam */}
      <div className="px-6 py-5 bg-brand-bg-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[14px] text-brand-dim max-w-[420px] leading-[1.55]">
            Beaconmon watches your SSL certificate for you and alerts you well before it expires, so you never get caught
            by a lapsed cert.
          </p>
          <a
            href="/sign-up?ref=ssl-checker"
            className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            Monitor SSL expiry &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-2">{label}</div>
      <div className="text-[14px] font-semibold text-brand-text">{children}</div>
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

'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';
import Link from 'next/link';

type UiState =
  | { status: 'idle' }
  | { status: 'loading'; domain: string }
  | { status: 'submitted'; domain: string; reportDueAt: string; email: string }
  | { status: 'already_requested'; domain: string; reportDueAt: string }
  | { status: 'not_shopify' }
  | { status: 'error'; message: string };

interface ApiResponse {
  ok: boolean;
  reason?: 'already_requested' | 'not_shopify';
  domain?: string;
  reportDueAt?: string;
  message?: string;
  error?: string;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function Spinner() {
  return (
    <svg className="snap-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function IntelligenceReportForm() {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  const loading = state.status === 'loading';
  const canSubmit = email.trim() !== '' && url.trim() !== '' && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const trimmedUrl = url.trim();

    // Optimistic domain extraction for the loading message
    const displayDomain = trimmedUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] ?? trimmedUrl;
    setState({ status: 'loading', domain: displayDomain });

    try {
      const res = await apiFetch('/api/tools/intelligence-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), competitorUrl: trimmedUrl }),
      });

      if (res.status === 429) {
        setState({ status: 'error', message: 'Too many requests. Wait an hour and try again.' });
        return;
      }

      const data = (await res.json()) as ApiResponse;

      if (data.ok && data.domain && data.reportDueAt) {
        setState({ status: 'submitted', domain: data.domain, reportDueAt: data.reportDueAt, email: email.trim() });
        return;
      }

      if (!data.ok && data.reason === 'already_requested' && data.domain && data.reportDueAt) {
        setState({ status: 'already_requested', domain: data.domain, reportDueAt: data.reportDueAt });
        return;
      }

      if (!data.ok && data.reason === 'not_shopify') {
        setState({ status: 'not_shopify' });
        return;
      }

      setState({ status: 'error', message: data.error ?? data.message ?? 'Something went wrong. Please try again.' });
    } catch {
      setState({ status: 'error', message: 'Something went wrong. Please try again.' });
    }
  }

  return (
    <div className="w-full">
      {(state.status === 'idle' || state.status === 'loading' || state.status === 'error' || state.status === 'not_shopify') && (
        <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-3 max-w-[540px]">
          <div className="flex flex-col gap-2">
            <label htmlFor="report-email" className="sr-only">Your email address</label>
            <input
              id="report-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-[52px] w-full bg-brand-bg2 border border-brand-line rounded-xl px-[16px] text-[16px] text-brand-text font-[inherit] outline-none placeholder:text-brand-muted focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all disabled:opacity-60"
            />
            <label htmlFor="report-url" className="sr-only">Competitor store URL</label>
            <input
              id="report-url"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="competitor-store.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="h-[52px] w-full bg-brand-bg2 border border-brand-line rounded-xl px-[16px] text-[16px] text-brand-text font-[inherit] outline-none placeholder:text-brand-muted focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-[52px] w-full text-[15px] font-semibold rounded-xl bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] hover:scale-[1.01] hover:bg-[#00ff8a] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Setting up monitoring for {state.status === 'loading' ? state.domain : ''}...
              </span>
            ) : (
              'Get my free report'
            )}
          </button>
          <p className="text-[13px] text-brand-muted">No credit card. No install. Your report arrives in 7 days.</p>
        </form>
      )}

      <div aria-live="polite" className="mt-2">
        {state.status === 'submitted' && (
          <div className="snap-in rounded-2xl border border-brand-green-border-25 bg-brand-green-glow-10 p-6 max-w-[540px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink mb-2">
              Monitoring active
            </p>
            <p className="text-[17px] font-bold text-brand-text mb-1">{state.domain} is now being watched.</p>
            <p className="text-[14px] text-brand-dim leading-[1.6] mb-4">
              Your intelligence report arrives on {formatDay(state.reportDueAt)}. Check{' '}
              <span className="font-mono text-brand-text">{state.email}</span>.
            </p>
            <p className="text-[14px] text-brand-dim mb-3">In the meantime, see a snapshot of the store right now:</p>
            <Link
              href={`/tools/shopify-competitor-changes?url=${encodeURIComponent(state.domain)}`}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-green-ink hover:underline"
            >
              View current snapshot &rarr;
            </Link>
          </div>
        )}

        {state.status === 'already_requested' && (
          <div className="snap-in rounded-2xl border border-brand-amber bg-[rgba(251,191,36,0.06)] p-6 max-w-[540px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-amber mb-2">
              Report already running
            </p>
            <p className="text-[15px] text-brand-text leading-[1.6]">
              You already have a report running for{' '}
              <span className="font-mono">{state.domain}</span>. It arrives on{' '}
              {formatDay(state.reportDueAt)}.
            </p>
          </div>
        )}

        {state.status === 'not_shopify' && (
          <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 p-6 max-w-[540px]">
            <p className="text-[15px] text-brand-text leading-[1.6]">
              This tool works with Shopify stores only. The URL you entered does not appear to be a Shopify store, or it
              uses a custom storefront that blocks public catalog access.
            </p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[540px]">
            {state.message}
          </div>
        )}
      </div>
    </div>
  );
}

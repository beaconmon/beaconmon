'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';
import type { CoverageResult, PageCheck, PageStatus } from '@/lib/tools/coverage-check';
import ShareButtons from '@/components/tools/ShareButtons';

type ApiResponse = (CoverageResult & { cached?: boolean }) | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'result'; data: CoverageResult };

const EXAMPLES = ['gymshark.com', 'allbirds.com'];

export default function CoverageAuditor() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  async function runAudit(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/coverage-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.status === 429) {
        setState({ status: 'error', message: 'Too many audits in a short window. Wait a minute, then try again.' });
        return;
      }
      const data = (await res.json()) as ApiResponse;
      if ('error' in data) {
        setState({ status: 'error', message: data.error });
        return;
      }
      setState({ status: 'result', data });
    } catch {
      setState({ status: 'error', message: 'Something went wrong running the audit. Please try again.' });
    }
  }

  const loading = state.status === 'loading';

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runAudit(url);
        }}
        className="flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[560px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
      >
        <label htmlFor="coverage-url" className="sr-only">
          Shopify store URL
        </label>
        <input
          id="coverage-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="yourstore.com"
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
              <Spinner /> Auditing
            </>
          ) : (
            'Audit coverage'
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
                void runAudit(ex);
              }}
              className="font-mono text-brand-dim underline decoration-brand-line underline-offset-2 hover:text-brand-green-ink hover:decoration-brand-green-ink transition-colors disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </span>
      </div>

      {state.status === 'loading' && (
        <div className="mt-6 flex items-center gap-3 text-[14px] text-brand-dim">
          <Spinner />
          <span>Checking 5 critical pages...</span>
          <span className="ml-1 inline-block h-1 w-32 rounded-full bg-brand-line overflow-hidden">
            <span className="block h-full w-full origin-left animate-pulse bg-brand-green-ink opacity-60 rounded-full" />
          </span>
        </div>
      )}

      <div aria-live="polite" className="mt-6">
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-brand-red-glow-04 p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'result' && <CoverageResult data={state.data} />}
      </div>
      {state.status === 'result' && (
        <ShareButtons
          tweetText={`${state.data.summary.up}/${state.data.summary.total} critical pages of ${state.data.domain} are healthy right now. Checked with @beaconmon:`}
        />
      )}
    </div>
  );
}

function CoverageResult({ data }: { data: CoverageResult }) {
  const checkedAt = new Date(data.checkedAt);
  const hasDown = data.summary.down > 0;
  const issueCount = data.summary.down + data.summary.error;
  const signUpHref = `/sign-up?ref=coverage-audit&pages=homepage,collection,product,cart,checkout`;

  const summaryText = (() => {
    const parts: string[] = [];
    if (data.summary.up > 0) parts.push(`${data.summary.up} up`);
    if (data.summary.redirect > 0) parts.push(`${data.summary.redirect} redirect`);
    if (data.summary.down > 0) parts.push(`${data.summary.down} down`);
    if (data.summary.error > 0) parts.push(`${data.summary.error} error`);
    if (data.summary.skipped > 0) parts.push(`${data.summary.skipped} skipped`);
    return parts.join(', ');
  })();

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[820px]">
      {/* Alert bar for down pages */}
      {hasDown && (
        <div className="px-6 py-3 bg-[oklch(30%_0.18_25)] border-b border-[oklch(55%_0.22_25_/_40%)] flex items-center gap-3">
          <span aria-hidden className="text-brand-red text-[16px]">!</span>
          <p className="text-[13px] font-semibold text-brand-text">
            At least one page is returning an error. Your store may be down right now.
          </p>
          <a
            href={signUpHref}
            className="ml-auto shrink-0 inline-flex items-center h-[32px] px-4 text-[12px] font-semibold rounded-lg bg-brand-green text-brand-green-fg whitespace-nowrap hover:bg-[#00ff8a] transition-colors"
          >
            Get alerts now
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
        <div className="flex items-center gap-3 min-w-0">
          {data.platform === 'shopify' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-green-ink" />
              Shopify
            </span>
          )}
          <span className="font-mono text-[14px] text-brand-text truncate">{data.domain}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-brand-dim font-medium">
            {issueCount > 0
              ? `${issueCount} page${issueCount === 1 ? '' : 's'} with issues`
              : `${data.summary.total} pages checked`}
            {' '}
            <span className="text-brand-muted font-normal">({summaryText})</span>
          </span>
          <span className="text-[12px] text-brand-muted whitespace-nowrap">
            <time dateTime={data.checkedAt}>
              {checkedAt.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </time>
          </span>
        </div>
      </div>

      {/* Coverage map */}
      <div className="divide-y divide-brand-line-soft">
        {data.pages.map((page) => (
          <PageRow key={page.id} page={page} />
        ))}
      </div>

      {/* Not-yet-monitored callout */}
      <div className="px-6 py-5 border-t border-brand-line bg-brand-bg-section">
        <p className="text-[14px] text-brand-dim leading-[1.55] mb-4">
          These pages go dark without warning. Beaconmon alerts you within 2 minutes of any failure.
        </p>
        <a
          href={signUpHref}
          className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
        >
          Start monitoring these pages &rarr;
        </a>
      </div>
    </div>
  );
}

function PageRow({ page }: { page: PageCheck }) {
  const signUpHref = `/sign-up?ref=coverage-audit&page=${page.id}`;
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2 px-6 py-4">
      <StatusIcon status={page.status} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-brand-text">{page.label}</span>
          <span className="font-mono text-[12px] text-brand-muted truncate max-w-[260px]">{page.url}</span>
        </div>
        {page.note && (
          <p className="mt-1 text-[12px] text-brand-muted leading-[1.5]">{page.note}</p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {page.responseMs !== null && (
          <span className="font-mono text-[12px] text-brand-muted">{page.responseMs}ms</span>
        )}
        {page.httpStatus !== null && (
          <HttpBadge status={page.httpStatus} />
        )}
        {page.status !== 'skipped' && (
          <a
            href={signUpHref}
            className="inline-flex items-center h-[28px] px-3 text-[11px] font-semibold rounded-md border border-brand-green-border-25 text-brand-green-ink hover:bg-brand-green-glow-10 transition-colors whitespace-nowrap"
          >
            Add monitor
          </a>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: PageStatus }) {
  if (status === 'up') {
    return (
      <span className="mt-[2px] shrink-0 h-5 w-5 rounded-full bg-brand-green-glow-10 border border-brand-green-border-25 flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-brand-green-ink" />
      </span>
    );
  }
  if (status === 'redirect') {
    return (
      <span className="mt-[2px] shrink-0 h-5 w-5 rounded-full bg-[oklch(40%_0.18_85_/_15%)] border border-[oklch(65%_0.18_85_/_35%)] flex items-center justify-center">
        <svg className="h-3 w-3 text-brand-amber" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === 'down') {
    return (
      <span className="mt-[2px] shrink-0 h-5 w-5 rounded-full bg-[oklch(30%_0.18_25_/_20%)] border border-[oklch(55%_0.22_25_/_40%)] flex items-center justify-center">
        <svg className="h-3 w-3 text-brand-red" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  // error or skipped
  return (
    <span className="mt-[2px] shrink-0 h-5 w-5 rounded-full bg-brand-bg2 border border-brand-line flex items-center justify-center">
      <span className="h-1 w-3 rounded-full bg-brand-muted" />
    </span>
  );
}

function HttpBadge({ status }: { status: number }) {
  const isGood = status >= 200 && status < 300;
  const isRedirect = status >= 300 && status < 400;
  const className = isGood
    ? 'bg-brand-green-glow-10 text-brand-green-ink border-brand-green-border-25'
    : isRedirect
      ? 'bg-[oklch(40%_0.18_85_/_12%)] text-brand-amber border-[oklch(65%_0.18_85_/_30%)]'
      : 'bg-[oklch(30%_0.18_25_/_15%)] text-brand-red border-[oklch(55%_0.22_25_/_30%)]';
  return (
    <span className={`inline-flex items-center h-[20px] px-1.5 rounded text-[11px] font-mono font-semibold border ${className}`}>
      {status}
    </span>
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

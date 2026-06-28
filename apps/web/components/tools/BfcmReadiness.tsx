'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

interface BfcmCheckItem {
  pass: boolean;
  score: number;
  maxScore: 20;
  label: string;
  detail: string;
  fix: string | null;
}

interface BfcmChecks {
  uptime: BfcmCheckItem;
  ssl: BfcmCheckItem;
  speed: BfcmCheckItem;
  redirects: BfcmCheckItem;
  monitoring: BfcmCheckItem;
}

interface BfcmApiResponse {
  ok: true;
  domain: string;
  score: number;
  grade: string;
  checks: BfcmChecks;
  cached: boolean;
}

type ApiResponse = BfcmApiResponse | { error: string };

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: BfcmApiResponse };

const EXAMPLES = ['gymshark.com', 'allbirds.com', 'brooklinen.com'];

const CHECK_ORDER: (keyof BfcmChecks)[] = ['uptime', 'ssl', 'speed', 'redirects', 'monitoring'];

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function gradeColors(grade: string): { stroke: string; text: string; bg: string } {
  if (grade === 'A' || grade === 'B') {
    return { stroke: 'var(--brand-green)', text: 'text-brand-green-ink', bg: 'bg-brand-green-glow-10' };
  }
  if (grade === 'C') {
    return { stroke: 'var(--brand-amber)', text: 'text-brand-amber', bg: 'bg-[oklch(82%_0.17_72_/_10%)]' };
  }
  return { stroke: 'var(--brand-red)', text: 'text-brand-red', bg: 'bg-[oklch(55%_0.22_25_/_10%)]' };
}

function checkStatus(item: BfcmCheckItem): 'pass' | 'partial' | 'fail' {
  if (item.pass) return 'pass';
  if (item.score > 0) return 'partial';
  return 'fail';
}

export default function BfcmReadiness() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UiState>({ status: 'idle' });

  async function runCheck(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setState({ status: 'loading' });
    try {
      const res = await apiFetch('/api/tools/bfcm-readiness', {
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
        onSubmit={(e) => { e.preventDefault(); void runCheck(url); }}
        className="flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[560px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
      >
        <label htmlFor="bfcm-url" className="sr-only">Shopify store URL</label>
        <input
          id="bfcm-url"
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
          {loading ? <><Spinner /> Checking</> : 'Run BFCM check'}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-brand-muted">
        <span>No signup, no app install. Results in about 5 seconds.</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span aria-hidden className="text-brand-line">|</span>
          Try:
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => { setUrl(ex); void runCheck(ex); }}
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
            <span>Checking your store... This takes about 5 seconds.</span>
          </div>
        )}
        {state.status === 'error' && (
          <div className="snap-in rounded-xl border border-[oklch(55%_0.22_25_/_30%)] bg-[oklch(55%_0.22_25_/_4%)] p-4 text-[14px] text-brand-text max-w-[640px]">
            {state.message}
          </div>
        )}
        {state.status === 'success' && <ResultView data={state.data} />}
      </div>
    </div>
  );
}

function ResultView({ data }: { data: BfcmApiResponse }) {
  const [monitoringChecked, setMonitoringChecked] = useState(false);

  const checks: BfcmChecks = {
    ...data.checks,
    monitoring: monitoringChecked
      ? { ...data.checks.monitoring, pass: true, score: 20, detail: 'Monitoring confirmed by store owner' }
      : data.checks.monitoring,
  };

  const totalScore = CHECK_ORDER.reduce((sum, key) => sum + checks[key].score, 0);
  const grade = gradeFromScore(totalScore);
  const colors = gradeColors(grade);

  return (
    <div className="snap-in rounded-2xl border border-brand-line bg-brand-bg1 shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)] overflow-hidden max-w-[800px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-brand-line-soft bg-brand-bg2">
        <span className="font-mono text-[14px] text-brand-text truncate">{data.domain}</span>
        <span className="text-[12px] text-brand-muted whitespace-nowrap">
          {data.cached ? 'Cached result' : 'Checked just now'}
        </span>
      </div>

      {/* Score section */}
      <div className="px-6 py-6 border-b border-brand-line-soft">
        <div className="flex flex-wrap items-center gap-6">
          <ScoreGauge score={totalScore} grade={grade} />
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className={`text-[56px] font-extrabold leading-none tracking-[-0.04em] transition-all duration-300 ${colors.text}`}>
                {totalScore}
              </span>
              <span className="text-[20px] text-brand-muted font-semibold">/100</span>
              <span className={`ml-1 text-[32px] font-extrabold leading-none ${colors.text}`}>{grade}</span>
            </div>
            <p className="text-[13px] text-brand-muted">
              {grade === 'A' || grade === 'B'
                ? 'Your store looks solid for peak traffic.'
                : grade === 'C'
                ? 'A few gaps to fix before BFCM.'
                : 'Your store has issues that need attention before Black Friday.'}
            </p>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-6 py-4 border-b border-brand-line-soft">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-3">Score breakdown</div>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
          {CHECK_ORDER.map((key) => {
            const item = checks[key];
            const st = checkStatus(item);
            const bg = st === 'pass' ? 'bg-brand-green' : st === 'partial' ? 'bg-brand-amber' : 'bg-brand-red';
            return (
              <div
                key={key}
                className={`flex-1 transition-colors duration-300 ${bg}`}
                title={`${item.label}: ${item.score}/${item.maxScore}`}
              />
            );
          })}
        </div>
        <div className="flex gap-1 mt-1.5">
          {CHECK_ORDER.map((key) => {
            const item = checks[key];
            return (
              <div key={key} className="flex-1 text-[10px] text-brand-muted text-center truncate">
                {item.score}/{item.maxScore}
              </div>
            );
          })}
        </div>
      </div>

      {/* Check rows */}
      <div className="divide-y divide-brand-line-soft">
        {CHECK_ORDER.filter((k) => k !== 'monitoring').map((key) => (
          <CheckRow key={key} item={checks[key]} />
        ))}
        <MonitoringRow
          item={checks.monitoring}
          checked={monitoringChecked}
          onToggle={() => setMonitoringChecked((v) => !v)}
        />
      </div>

      {/* CTA */}
      <div className="px-6 py-5 bg-brand-bg-section border-t border-brand-line-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[14px] text-brand-dim max-w-[440px] leading-[1.55]">
            {totalScore < 80
              ? 'Your store has gaps that could cause problems during BFCM. Fix them before the rush.'
              : 'Your store looks solid. The last thing to add is continuous monitoring so you know instantly if anything breaks during peak traffic.'}
          </p>
          <a
            href="/sign-up?ref=bfcm-readiness"
            className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            Set up monitoring in 2 minutes &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const colors = gradeColors(grade);

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" aria-hidden>
      <circle cx="54" cy="54" r={r} fill="none" stroke="var(--brand-line-soft)" strokeWidth="8" />
      <circle
        cx="54" cy="54" r={r}
        fill="none"
        stroke={colors.stroke}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '54px 54px',
          transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease',
        }}
      />
    </svg>
  );
}

function CheckRow({ item }: { item: BfcmCheckItem }) {
  const [open, setOpen] = useState(false);
  const st = checkStatus(item);

  return (
    <div className="px-6 py-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-[2px]">
          {st === 'pass' ? <CheckMark /> : st === 'partial' ? <PartialMark /> : <XMark />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-[14px] font-semibold ${st === 'pass' ? 'text-brand-green-ink' : st === 'partial' ? 'text-brand-amber' : 'text-brand-red'}`}>
              {item.label}
            </span>
            <span className="text-[12px] text-brand-muted">
              {item.score}/{item.maxScore} pts
            </span>
          </div>
          <p className="text-[13px] text-brand-dim mt-0.5 leading-[1.5]">{item.detail}</p>
          {item.fix && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-[12px] font-semibold text-brand-dim underline decoration-brand-line underline-offset-2 hover:text-brand-text transition-colors"
              >
                {open ? 'Hide fix' : 'How to fix this'}
              </button>
              {open && (
                <p className="mt-2 text-[13px] text-brand-dim leading-[1.6] bg-brand-bg2 rounded-lg px-3 py-2.5 border border-brand-line-soft">
                  {item.fix}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonitoringRow({
  item,
  checked,
  onToggle,
}: {
  item: BfcmCheckItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`px-6 py-4 transition-colors duration-300 ${checked ? 'bg-brand-green-glow-10' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-[1px]">
          <input
            type="checkbox"
            id="monitoring-check"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 rounded border-brand-line bg-brand-bg2 accent-[var(--brand-green)] cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="monitoring-check"
              className={`text-[14px] font-semibold cursor-pointer select-none transition-colors duration-300 ${checked ? 'text-brand-green-ink' : 'text-brand-text'}`}
            >
              I have active uptime monitoring set up for this store
            </label>
            <span className="text-[12px] text-brand-muted">
              {item.score}/{item.maxScore} pts
            </span>
          </div>
          <p className="text-[13px] text-brand-dim mt-0.5 leading-[1.5]">
            {checked
              ? 'Monitoring confirmed by store owner'
              : 'No monitoring detected. You would not know your store went down during BFCM until a customer told you.'}
          </p>
          {!checked && (
            <p className="mt-2 text-[13px] text-brand-dim">
              No monitoring?{' '}
              <a href="/sign-up?ref=bfcm-readiness-monitoring" className="text-brand-green-ink hover:underline font-semibold">
                Beaconmon takes 2 minutes to set up.
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-brand-green-ink">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PartialMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-brand-amber">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function XMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-brand-red">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

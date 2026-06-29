'use client';

import { useEffect, useRef, useState } from 'react';
import CalculatorLeadCapture from '@/components/tools/CalculatorLeadCapture';

type CompetitorCount = '1' | '2-3' | '4-6' | '7+';
type Niche = 'commodity' | 'fashion' | 'specialty';
type ReactionTime = 'same_day' | '1-3_days' | '1_week' | 'rarely';

const VALID_NICHE: Niche[] = ['commodity', 'fashion', 'specialty'];
const VALID_COUNT: CompetitorCount[] = ['1', '2-3', '4-6', '7+'];
const VALID_REACTION: ReactionTime[] = ['same_day', '1-3_days', '1_week', 'rarely'];

interface CalcInputs {
  monthlyRevenue: number;
  niche: Niche | '';
  competitorCount: CompetitorCount | '';
  reactionTime: ReactionTime | '';
}

// Benchmark-derived constants
const COMPETITOR_MOVE_FREQ: Record<CompetitorCount, number> = {
  '1': 2,
  '2-3': 5,
  '4-6': 10,
  '7+': 18,
};

const NICHE_EXPOSURE: Record<Niche, number> = {
  commodity: 0.04,
  fashion: 0.02,
  specialty: 0.005,
};

const REACTION_RECOVERY: Record<ReactionTime, number> = {
  same_day: 0.80,
  '1-3_days': 0.55,
  '1_week': 0.25,
  rarely: 0.05,
};

const BEACONMON_REACTION_TIME: ReactionTime = 'same_day';
const BEACONMON_MONTHLY_COST = 19;

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function isComplete(inputs: CalcInputs): boolean {
  return inputs.monthlyRevenue > 0 && inputs.niche !== '' && inputs.competitorCount !== '' && inputs.reactionTime !== '';
}

const SELECT_CLS =
  'w-full bg-brand-bg2 border border-brand-line text-brand-text text-[15px] rounded-lg px-4 py-3 outline-none focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all appearance-none cursor-pointer';

export default function CompetitorRoiCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>({
    monthlyRevenue: 0,
    niche: '',
    competitorCount: '',
    reactionTime: '',
  });
  const [revenueDisplay, setRevenueDisplay] = useState('');
  const [copied, setCopied] = useState(false);
  const isFirstRender = useRef(true);

  // Read initial state from the URL once on mount so shared links restore inputs.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const revenue = Number(params.get('revenue'));
    const niche = params.get('niche');
    const competitors = params.get('competitors');
    const reaction = params.get('reaction');
    setInputs((p) => ({
      monthlyRevenue: Number.isFinite(revenue) && revenue > 0 ? revenue : p.monthlyRevenue,
      niche: VALID_NICHE.includes(niche as Niche) ? (niche as Niche) : p.niche,
      competitorCount: VALID_COUNT.includes(competitors as CompetitorCount) ? (competitors as CompetitorCount) : p.competitorCount,
      reactionTime: VALID_REACTION.includes(reaction as ReactionTime) ? (reaction as ReactionTime) : p.reactionTime,
    }));
    if (Number.isFinite(revenue) && revenue > 0) setRevenueDisplay(revenue.toLocaleString());
  }, []);

  // Sync inputs back into the URL (replaceState, no navigation) after hydration.
  // Skip the first execution: it runs before the mount effect's setInputs takes
  // effect, so inputs still hold defaults and would overwrite incoming URL params.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (inputs.monthlyRevenue > 0) params.set('revenue', String(inputs.monthlyRevenue));
    if (inputs.niche) params.set('niche', inputs.niche);
    if (inputs.competitorCount) params.set('competitors', inputs.competitorCount);
    if (inputs.reactionTime) params.set('reaction', inputs.reactionTime);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [inputs]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context or denied permission) -- ignore.
    }
  }

  const ready = isComplete(inputs);

  let movesPerMonth = 0;
  let currentMonthlyLoss = 0;
  let beaconmonMonthlyLoss = 0;
  let monthlyOpportunity = 0;
  let annualOpportunity = 0;
  let paybackDays = 0;
  let alreadyFast = false;

  if (ready) {
    movesPerMonth = COMPETITOR_MOVE_FREQ[inputs.competitorCount as CompetitorCount];
    const exposurePerMove = inputs.monthlyRevenue * NICHE_EXPOSURE[inputs.niche as Niche];
    const totalMonthlyExposure = movesPerMonth * exposurePerMove;
    const currentRecovery = REACTION_RECOVERY[inputs.reactionTime as ReactionTime];
    const beaconmonRecovery = REACTION_RECOVERY[BEACONMON_REACTION_TIME];
    currentMonthlyLoss = totalMonthlyExposure * (1 - currentRecovery);
    beaconmonMonthlyLoss = totalMonthlyExposure * (1 - beaconmonRecovery);
    monthlyOpportunity = currentMonthlyLoss - beaconmonMonthlyLoss;
    annualOpportunity = monthlyOpportunity * 12;
    alreadyFast = inputs.reactionTime === 'same_day';
    if (monthlyOpportunity > 0) {
      paybackDays = Math.ceil((BEACONMON_MONTHLY_COST / monthlyOpportunity) * 30);
    }
  }

  return (
    <div className="w-full max-w-[760px]">
      {/* Form */}
      <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 max-[640px]:p-5">
        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
          {/* Monthly revenue */}
          <div className="col-span-2 max-[640px]:col-span-1">
            <label htmlFor="monthly-revenue" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              Monthly store revenue
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-[15px] select-none">$</span>
              <input
                id="monthly-revenue"
                type="text"
                inputMode="numeric"
                placeholder="50,000"
                value={revenueDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  const n = raw ? Number(raw) : 0;
                  setRevenueDisplay(raw ? Number(raw).toLocaleString() : '');
                  setInputs((p) => ({ ...p, monthlyRevenue: n }));
                }}
                className="w-full bg-brand-bg2 border border-brand-line text-brand-text text-[15px] rounded-lg pl-8 pr-4 py-3 outline-none focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all"
              />
            </div>
          </div>

          {/* Niche */}
          <div>
            <label htmlFor="niche" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              Product category
            </label>
            <div className="relative">
              <select
                id="niche"
                value={inputs.niche}
                onChange={(e) => setInputs((p) => ({ ...p, niche: e.target.value as Niche | '' }))}
                className={SELECT_CLS}
              >
                <option value="" disabled>Choose category...</option>
                <option value="commodity">Commodity (price-sensitive)</option>
                <option value="fashion">Fashion / lifestyle</option>
                <option value="specialty">Specialty / unique products</option>
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Competitor count */}
          <div>
            <label htmlFor="competitor-count" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              Competitors you track
            </label>
            <div className="relative">
              <select
                id="competitor-count"
                value={inputs.competitorCount}
                onChange={(e) => setInputs((p) => ({ ...p, competitorCount: e.target.value as CompetitorCount | '' }))}
                className={SELECT_CLS}
              >
                <option value="" disabled>Choose count...</option>
                <option value="1">1 competitor</option>
                <option value="2-3">2 to 3 competitors</option>
                <option value="4-6">4 to 6 competitors</option>
                <option value="7+">7 or more competitors</option>
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Reaction time */}
          <div className="col-span-2 max-[640px]:col-span-1">
            <label htmlFor="reaction-time" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              How quickly do you react to competitor changes?
            </label>
            <div className="relative">
              <select
                id="reaction-time"
                value={inputs.reactionTime}
                onChange={(e) => setInputs((p) => ({ ...p, reactionTime: e.target.value as ReactionTime | '' }))}
                className={SELECT_CLS}
              >
                <option value="" disabled>Choose reaction time...</option>
                <option value="same_day">Same day</option>
                <option value="1-3_days">1 to 3 days</option>
                <option value="1_week">About 1 week</option>
                <option value="rarely">Rarely or never</option>
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        {!ready && (
          <p className="mt-5 text-[13px] text-brand-muted">
            Fill in all fields to see your results.
          </p>
        )}
      </div>

      {/* Results */}
      {ready && (
        <>
        <div className="snap-in mt-5 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
          {alreadyFast ? (
            <div className="px-8 py-8 max-[640px]:px-5">
              <p className="text-[18px] font-bold tracking-[-0.01em] mb-2">
                {"You're already reacting fast."}
              </p>
              <p className="text-brand-dim text-[15px] leading-[1.65] max-w-[520px]">
                The next step is making sure you never miss a move, even at 2am. Beaconmon watches every competitor 24/7
                and alerts you within minutes.
              </p>
              <a
                href="/sign-up?ref=competitor-intelligence-roi"
                className="inline-flex items-center justify-center mt-6 h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
              >
                Watch competitors 24/7 &rarr;
              </a>
            </div>
          ) : (
            <>
              {/* Headline stats */}
              <div className="grid grid-cols-3 max-[520px]:grid-cols-1 divide-x max-[520px]:divide-x-0 max-[520px]:divide-y divide-brand-line-soft">
                <ResultStat
                  label="Competitor moves per month"
                  value={`${movesPerMonth} moves`}
                />
                <ResultStat
                  label="Revenue at risk from slow reactions"
                  value={formatMoney(currentMonthlyLoss) + '/mo'}
                  accent
                  accentColor="red"
                />
                <ResultStat
                  label="Recoverable with instant alerts"
                  value={formatMoney(monthlyOpportunity) + '/mo'}
                  accent
                  accentColor="green"
                />
              </div>

              {/* Comparison table */}
              <div className="px-6 py-6 border-t border-brand-line-soft">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-4">
                  Reaction time comparison
                </h3>
                <div className="rounded-xl overflow-hidden border border-brand-line-soft">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="bg-brand-bg2 border-b border-brand-line-soft">
                        <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-muted">Setup</th>
                        <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-muted">Reaction time</th>
                        <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-muted">Unrecovered exposure</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-brand-line-soft">
                        <td className="px-4 py-3 text-brand-dim">Current setup</td>
                        <td className="px-4 py-3 text-brand-dim">{reactionTimeLabel(inputs.reactionTime as ReactionTime)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-brand-red">{formatMoney(currentMonthlyLoss)}/mo</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-brand-text font-semibold">With Beaconmon</td>
                        <td className="px-4 py-3 text-brand-green-ink font-medium">Same-day alert</td>
                        <td className="px-4 py-3 text-right font-semibold text-brand-green-ink">{formatMoney(beaconmonMonthlyLoss)}/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annual headline + payback */}
              <div className="px-6 py-5 border-t border-brand-line-soft bg-brand-bg2">
                <p className="text-[15px] text-brand-dim leading-[1.65]">
                  By reacting faster, you could recover{' '}
                  <span className="font-bold text-brand-green-ink">{formatMoney(annualOpportunity)}</span>{' '}
                  per year.
                </p>
                {paybackDays > 0 && paybackDays <= 365 && (
                  <p className="mt-2 text-[14px] text-brand-dim">
                    At $19/month, Beaconmon pays for itself in{' '}
                    <span className="font-semibold text-brand-text">{paybackDays} {paybackDays === 1 ? 'day' : 'days'}</span>.
                  </p>
                )}
                <p className="mt-3 text-[12px] text-brand-muted leading-[1.5]">
                  Estimates are based on industry benchmarks for ecommerce competitor reaction rates and revenue sensitivity by
                  category. Your results will vary.
                </p>
              </div>

              {/* CTA seam */}
              <div className="px-6 py-5 border-t border-brand-line bg-brand-bg-section">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[14px] text-brand-dim max-w-[400px] leading-[1.55]">
                    Beaconmon alerts you the moment a competitor drops prices or launches a sale. React the same day, every time.
                  </p>
                  <a
                    href="/sign-up?ref=competitor-intelligence-roi"
                    className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
                  >
                    Start monitoring free &rarr;
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold rounded-lg border border-brand-line text-brand-dim hover:text-brand-text hover:border-brand-green-border-25 transition-colors"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7.5l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied
              </>
            ) : (
              'Copy link to these results'
            )}
          </button>
        </div>
        <CalculatorLeadCapture
          tool="competitor-intelligence-roi"
          result={formatMoney(annualOpportunity)}
          inputs={{
            monthlyRevenue: inputs.monthlyRevenue,
            niche: inputs.niche,
            competitorCount: inputs.competitorCount,
            reactionTime: inputs.reactionTime,
          }}
          prompt="Save your result. We'll also send you a one-time tip on reacting faster to competitor moves."
        />
        </>
      )}
    </div>
  );
}

function reactionTimeLabel(rt: ReactionTime): string {
  const labels: Record<ReactionTime, string> = {
    same_day: 'Same day',
    '1-3_days': '1 to 3 days',
    '1_week': 'About 1 week',
    rarely: 'Rarely / never',
  };
  return labels[rt];
}

function ResultStat({
  label,
  value,
  accent,
  accentColor,
}: {
  label: string;
  value: string;
  accent?: boolean;
  accentColor?: 'red' | 'green';
}) {
  const colorCls =
    accent && accentColor === 'green'
      ? 'text-brand-green-ink'
      : accent && accentColor === 'red'
        ? 'text-brand-red'
        : 'text-brand-text';
  return (
    <div className="px-6 py-5">
      <div className={`font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] ${colorCls}`}>{value}</div>
      <div className="mt-1.5 text-[12px] uppercase tracking-[0.08em] text-brand-muted">{label}</div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

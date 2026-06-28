'use client';

import { useState } from 'react';

type MonitoringSetup = 'none' | 'manual' | 'generic_tool' | 'beaconmon';
type CheckInterval = 1 | 5 | 15 | 60;
type TeamCoverage = '247' | 'business_hours' | 'solo';

interface CalcInputs {
  monitoringSetup: MonitoringSetup | '';
  checkInterval: CheckInterval;
  monthlyRevenue: number;
  teamCoverage: TeamCoverage | '';
}

const BASE_MTTD: Record<MonitoringSetup, number> = {
  none: 240,
  manual: 90,
  generic_tool: 0,
  beaconmon: 1,
};

function computeMttd(inputs: CalcInputs): number {
  if (!inputs.monitoringSetup) return 0;
  let mttd = BASE_MTTD[inputs.monitoringSetup];

  if (inputs.monitoringSetup === 'generic_tool') {
    mttd = inputs.checkInterval / 2;
  }

  if (inputs.teamCoverage === 'business_hours') {
    mttd = mttd + 240 * 0.5;
  }
  if (inputs.teamCoverage === 'solo') {
    mttd = mttd + 360 * 0.6;
  }

  return Math.round(mttd);
}

function isComplete(inputs: CalcInputs): boolean {
  if (!inputs.monitoringSetup || !inputs.teamCoverage || inputs.monthlyRevenue <= 0) return false;
  if (inputs.monitoringSetup === 'generic_tool' && !inputs.checkInterval) return false;
  return true;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const SELECT_CLS =
  'w-full bg-brand-bg2 border border-brand-line text-brand-text text-[15px] rounded-lg px-4 py-3 outline-none focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all appearance-none cursor-pointer';

export default function DetectionCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>({
    monitoringSetup: '',
    checkInterval: 5,
    monthlyRevenue: 0,
    teamCoverage: '',
  });
  const [revenueDisplay, setRevenueDisplay] = useState('');

  const ready = isComplete(inputs);
  const mttdMinutes = ready ? computeMttd(inputs) : 0;
  const hourlyRevenue = inputs.monthlyRevenue / 730;
  const beaconmonMttd = 2;
  const revenueLost = (hourlyRevenue / 60) * mttdMinutes;
  const barPct = mttdMinutes > beaconmonMttd ? Math.round((beaconmonMttd / mttdMinutes) * 100) : 100;

  return (
    <div className="w-full max-w-[760px]">
      {/* Form */}
      <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 max-[640px]:p-5">
        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
          {/* Monitoring setup */}
          <div className="col-span-2 max-[640px]:col-span-1">
            <label htmlFor="monitoring-setup" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              Current monitoring setup
            </label>
            <div className="relative">
              <select
                id="monitoring-setup"
                value={inputs.monitoringSetup}
                onChange={(e) => setInputs((p) => ({ ...p, monitoringSetup: e.target.value as MonitoringSetup | '' }))}
                className={SELECT_CLS}
              >
                <option value="" disabled>Choose your setup...</option>
                <option value="none">No monitoring, I check manually or wait for complaints</option>
                <option value="manual">Basic checks, I or the team check periodically</option>
                <option value="generic_tool">A monitoring tool (UptimeRobot, Better Uptime, Pingdom, etc.)</option>
                <option value="beaconmon">Beaconmon</option>
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Check interval (conditional) */}
          {inputs.monitoringSetup === 'generic_tool' && (
            <div className="col-span-2 max-[640px]:col-span-1">
              <label htmlFor="check-interval" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
                Check interval
              </label>
              <div className="relative">
                <select
                  id="check-interval"
                  value={inputs.checkInterval}
                  onChange={(e) => setInputs((p) => ({ ...p, checkInterval: Number(e.target.value) as CheckInterval }))}
                  className={SELECT_CLS}
                >
                  <option value={1}>Every 1 minute</option>
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={60}>Every 60 minutes</option>
                </select>
                <ChevronIcon />
              </div>
            </div>
          )}

          {/* Monthly revenue */}
          <div>
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

          {/* Team coverage */}
          <div>
            <label htmlFor="team-coverage" className="block text-[13px] font-semibold text-brand-dim mb-2 uppercase tracking-[0.07em]">
              Who responds to alerts?
            </label>
            <div className="relative">
              <select
                id="team-coverage"
                value={inputs.teamCoverage}
                onChange={(e) => setInputs((p) => ({ ...p, teamCoverage: e.target.value as TeamCoverage | '' }))}
                className={SELECT_CLS}
              >
                <option value="" disabled>Choose...</option>
                <option value="247">24/7 on-call rotation</option>
                <option value="business_hours">Business hours only (9-5)</option>
                <option value="solo">Just me, checking email occasionally</option>
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        {!ready && (
          <p className="mt-5 text-[13px] text-brand-muted">
            Fill in all fields to see your detection time.
          </p>
        )}
      </div>

      {/* Results */}
      {ready && (
        <div className="snap-in mt-5 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
          {/* Headline stats */}
          <div className="grid grid-cols-3 max-[520px]:grid-cols-1 divide-x max-[520px]:divide-x-0 max-[520px]:divide-y divide-brand-line-soft">
            <ResultStat
              label="Your detection time"
              value={formatMinutes(mttdMinutes)}
              accent={mttdMinutes > 30}
              accentColor="red"
            />
            <ResultStat
              label="Revenue lost before you know"
              value={formatMoney(revenueLost)}
              accent={revenueLost > 0}
              accentColor="red"
            />
            <ResultStat
              label="With Beaconmon"
              value="2 min"
              accent
              accentColor="green"
            />
          </div>

          {/* Bar comparison */}
          <div className="px-6 py-6 border-t border-brand-line-soft">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-4">Detection time comparison</h3>
            <div className="space-y-3">
              <BarRow label="Your current setup" minutes={mttdMinutes} widthPct={100} color="red" />
              <BarRow label="Beaconmon" minutes={beaconmonMttd} widthPct={Math.max(barPct, 1)} color="green" />
            </div>
          </div>

          {/* BFCM callout */}
          {inputs.monthlyRevenue > 0 && (
            <div className="px-6 py-5 border-t border-brand-line-soft bg-brand-bg2">
              <p className="text-[14px] text-brand-dim leading-[1.65]">
                On a Black Friday weekend, your store earns roughly 5 to 8 times your normal hourly revenue. At that rate, your current setup means{' '}
                <span className="font-semibold text-brand-text">{formatMoney(revenueLost * 6)}</span>{' '}
                lost before you even get an alert.
              </p>
            </div>
          )}

          {/* CTA seam */}
          <div className="px-6 py-5 border-t border-brand-line bg-brand-bg-section">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[14px] text-brand-dim max-w-[400px] leading-[1.55]">
                Beaconmon checks your store every minute and alerts you within 2 minutes of any outage, any hour of the day.
              </p>
              <a
                href="/sign-up?ref=downtime-detection-calculator"
                className="inline-flex items-center justify-center h-[44px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
              >
                Start monitoring free &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  accentColor: 'red' | 'green';
}) {
  const colorCls = accent
    ? accentColor === 'green'
      ? 'text-brand-green-ink'
      : 'text-brand-red'
    : 'text-brand-text';
  return (
    <div className="px-6 py-5">
      <div className={`font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] ${colorCls}`}>{value}</div>
      <div className="mt-1.5 text-[12px] uppercase tracking-[0.08em] text-brand-muted">{label}</div>
    </div>
  );
}

function BarRow({
  label,
  minutes,
  widthPct,
  color,
}: {
  label: string;
  minutes: number;
  widthPct: number;
  color: 'red' | 'green';
}) {
  const barColor = color === 'green' ? 'bg-brand-green' : 'bg-brand-red';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-brand-dim">{label}</span>
        <span className="text-[13px] font-mono font-semibold text-brand-text">{formatMinutes(minutes)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-brand-bg2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
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

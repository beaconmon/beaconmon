import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Better Uptime (2026) — Comparison for Freelancers & Agencies',
  description: 'Better Uptime vs Beaconmon compared: on-call scheduling, pricing, content monitoring, and which tool is actually built for your use case.',
};

const TABLE_ROWS = [
  {
    feature: 'Free plan',
    beaconmon: '✓ 5 monitors',
    competitor: '✓ 3 monitors',
    beaconmonGood: true,
  },
  {
    feature: 'Check frequency (paid)',
    beaconmon: '30 seconds',
    competitor: '30 seconds',
    beaconmonGood: false,
  },
  {
    feature: 'Multi-location checks',
    beaconmon: '5 regions',
    competitor: '✓ Multiple',
    beaconmonGood: false,
  },
  {
    feature: 'Domain expiry tracking',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Content change monitoring',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Heartbeat monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'On-call scheduling / rotations',
    beaconmon: '—',
    competitor: '✓ Advanced',
    beaconmonGood: false,
  },
  {
    feature: 'Status pages',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'SSL monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'SLO / error budget tracking',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Pro plan price',
    beaconmon: '$15 / month',
    competitor: '$25 / month (Freelancer)',
    beaconmonGood: true,
  },
];

const SWITCH_REASONS = [
  'Beaconmon costs $10/mo less for a comparable feature set.',
  'Domain expiry tracking is missing from Better Uptime — Beaconmon includes it on all plans.',
  'Content change monitoring is a Beaconmon-only feature in this comparison.',
  'You don\'t need on-call scheduling for a one-person or small team setup.',
  'SLO / error budget tracking is included in Beaconmon Pro; not available in Better Uptime.',
  'Beaconmon\'s free plan includes 5 monitors vs 3 in Better Uptime.',
];

export default function VsBetterUptimePage() {
  return (
    <>
      <NavBar />

      {/* Hero */}
      <section className="relative py-[100px] max-[640px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <Link href="/vs/" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All comparisons
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Comparison</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Beaconmon vs Better Uptime —<br />
            <span className="text-brand-green">an honest comparison.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px]">
            Better Uptime has excellent on-call scheduling for large engineering teams. But for freelancers and small agencies, it&apos;s $10/mo more expensive with features you probably won&apos;t use — and it&apos;s missing domain expiry and content monitoring entirely.
          </p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Better Uptime is built for teams that need on-call rotations and escalation policies. If that&apos;s you, it might be worth the extra cost. If you&apos;re a freelancer or a small agency managing client sites, Beaconmon is $10/mo cheaper with more features that matter for that specific job.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">Feature by feature</h2>
          </div>
          <div className="reveal overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1 max-w-[900px] mx-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft w-[40%]">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Better Uptime</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(({ feature, beaconmon, competitor, beaconmonGood }, i) => (
                  <tr key={feature}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] font-medium ${beaconmonGood ? 'text-brand-green' : 'text-brand-dim'} ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{beaconmon}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why people switch */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why people choose Beaconmon over Better Uptime
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Better Uptime shines for large engineering teams. For freelancers and small agencies, the value calculus tips toward Beaconmon.
              </p>
            </div>
            <ul className="space-y-4">
              {SWITCH_REASONS.map((reason, i) => (
                <li key={i} className="reveal flex items-start gap-3 text-[14px] text-brand-dim">
                  <CheckIcon />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: '-40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 500,
            background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">
            Try Beaconmon free.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">5 monitors free forever. 14-day Pro trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs StatusCake (2026) — Uptime Monitoring Comparison',
  description: 'StatusCake vs Beaconmon: pricing, check frequency, content monitoring, and which tool makes more sense for agencies and freelancers.',
};

const TABLE_ROWS = [
  {
    feature: 'Free tier monitors',
    beaconmon: '5 monitors',
    competitor: '10 monitors',
    beaconmonGood: false,
  },
  {
    feature: 'Free check frequency',
    beaconmon: '5 minutes',
    competitor: '5 minutes',
    beaconmonGood: false,
  },
  {
    feature: 'Paid check frequency',
    beaconmon: '30 seconds',
    competitor: '1 minute',
    beaconmonGood: true,
  },
  {
    feature: 'Multi-location checks',
    beaconmon: '5 regions (Pro+)',
    competitor: '✓ (paid)',
    beaconmonGood: false,
  },
  {
    feature: 'Domain expiry tracking',
    beaconmon: '✓ All plans',
    competitor: '✓ Paid only',
    beaconmonGood: false,
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
    competitor: '✓ Paid',
    beaconmonGood: false,
  },
  {
    feature: 'SSL monitoring',
    beaconmon: '✓ All plans',
    competitor: '✓ All plans',
    beaconmonGood: false,
  },
  {
    feature: 'Status pages',
    beaconmon: '✓ All plans',
    competitor: '✓ Paid only',
    beaconmonGood: true,
  },
  {
    feature: 'SLO / error budget tracking',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Paid plan starting price',
    beaconmon: '$15 / month',
    competitor: '$24.99 / month',
    beaconmonGood: true,
  },
];

const SWITCH_REASONS = [
  'StatusCake paid plans start at $24.99 — Beaconmon Pro is $15/mo for more features.',
  'Content change monitoring is completely absent from StatusCake.',
  'Beaconmon checks every 30 seconds on paid plans; StatusCake\'s comparable plan checks every 1 minute.',
  'Status pages are included in all Beaconmon plans — StatusCake requires a paid plan.',
  'SLO tracking and error budget alerts are a Beaconmon-only feature here.',
  'Beaconmon was built specifically for freelancers and agencies; StatusCake targets a broader audience.',
];

export default function VsStatusCakePage() {
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
            Beaconmon vs StatusCake<br />
            <span className="text-brand-green">an honest comparison.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px]">
            StatusCake has a generous free tier with 10 monitors. But once you need faster checks, status pages, or content monitoring, paid plans start at $24.99 and still leave gaps that Beaconmon fills at $15.
          </p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              StatusCake&apos;s free plan is the strongest of any tool in this comparison (10 monitors). But its paid plans are expensive, content monitoring doesn&apos;t exist, and status pages are locked behind a subscription. Beaconmon wins on value for anyone doing professional client work.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">StatusCake</th>
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
                Why people choose Beaconmon over StatusCake
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The free tier is StatusCake&apos;s strongest selling point. Once you upgrade, the value calculus changes fast.
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

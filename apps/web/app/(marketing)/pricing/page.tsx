import NavBar from '@/components/marketing/NavBar';
import PricingCard, { PRICING_TIERS } from '@/components/marketing/PricingCard';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Beaconmon',
  description: 'Simple, transparent pricing. Start free. Upgrade when you need more monitors, faster checks, or more status pages.',
};

const FEATURE_MATRIX = [
  { feature: 'Monitors', free: '5', pro: '25', business: 'Unlimited' },
  { feature: 'Check frequency', free: '5 min', pro: '1 min', business: '30 sec' },
  { feature: 'Monitor types', free: 'All 6', pro: 'All 6', business: 'All 6' },
  { feature: 'Alert channels', free: '1', pro: '5', business: 'Unlimited' },
  { feature: 'Email alerts', free: '✓', pro: '✓', business: '✓' },
  { feature: 'Slack alerts', free: '—', pro: '✓', business: '✓' },
  { feature: 'Webhook alerts', free: '—', pro: '✓', business: '✓' },
  { feature: 'SMS alerts', free: '—', pro: '—', business: '✓' },
  { feature: 'Status pages', free: '1', pro: '3', business: 'Unlimited' },
  { feature: 'Custom status page domain', free: '—', pro: '✓', business: '✓' },
  { feature: 'SSL expiry alerts', free: '✓', pro: '✓', business: '✓' },
  { feature: 'Domain expiry alerts', free: '✓', pro: '✓', business: '✓' },
  { feature: 'Multi-location checks', free: '—', pro: '✓', business: '✓' },
  { feature: 'SLO tracking', free: '—', pro: '✓', business: '✓' },
  { feature: 'Heartbeat monitoring', free: '—', pro: '—', business: '✓' },
  { feature: 'History', free: '7 days', pro: '90 days', business: '1 year' },
  { feature: 'Team members', free: '1', pro: '5', business: 'Unlimited' },
  { feature: 'Multi-client agency dashboard', free: '—', pro: '—', business: '✓' },
  { feature: 'Priority support', free: '—', pro: '✓', business: '✓' },
];

const BILLING_FAQ = [
  {
    id: 'no-cc',
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan is genuinely free — no card, no trial, no expiry. The 14-day Pro trial also starts without a card; you only enter payment details if you decide to upgrade.',
  },
  {
    id: 'trial',
    q: 'How does the 14-day trial work?',
    a: 'When you sign up, your account starts on a full Pro trial automatically. All Pro features are available immediately. If you don\'t upgrade before 14 days, your account reverts to the Free plan — no charge.',
  },
  {
    id: 'switch-plans',
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the end of your current billing period.',
  },
  {
    id: 'payment-methods',
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex). Payments are processed by Paddle, our Merchant of Record, so you never share card details directly with Beaconmon.',
  },
  {
    id: 'annual',
    q: 'Is there annual billing?',
    a: 'Yes — paying annually saves 20% on Pro and Business plans. You can switch to annual billing from the billing settings in your dashboard.',
  },
  {
    id: 'cancel',
    q: 'How do I cancel?',
    a: 'You can cancel any time from the billing portal in your dashboard. Your plan stays active until the end of the period you\'ve already paid for. No cancellation fees, no questions asked.',
  },
];

export default function PricingPage() {
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
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 600,
            background: 'radial-gradient(circle, rgba(0,229,122,0.14), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Pricing</span>
          <h1 className="text-[clamp(40px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5">
            Simple pricing. No surprises.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mx-auto">
            Start free. 14-day Pro trial on every account — no card required. Upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-[80px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5 items-stretch">
            {PRICING_TIERS.map((t) => <PricingCard key={t.tier} {...t} />)}
          </div>
          <p className="text-center mt-8 text-brand-muted text-[13px] max-w-[600px] mx-auto leading-[1.6]">
            All plans include SSL monitoring, domain expiry alerts, and public status pages. Annual billing saves 20%. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Feature matrix */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">Full feature comparison</h2>
            <p className="text-brand-dim text-[15px]">Every feature, side by side.</p>
          </div>
          <div className="reveal max-w-[960px] mx-auto overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft w-[40%]">Feature</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Free</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-green font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.15)]">Pro</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Business</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map(({ feature, free, pro, business }, i) => (
                  <tr key={feature}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < FEATURE_MATRIX.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
                    <td className={`p-4 text-center text-[14px] text-brand-dim ${i < FEATURE_MATRIX.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{free === '✓' ? <span className="text-brand-green font-semibold">✓</span> : free === '—' ? <span className="text-brand-muted">—</span> : free}</td>
                    <td className={`p-4 text-center text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.15)] ${i < FEATURE_MATRIX.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{pro === '✓' ? <span className="text-brand-green font-semibold">✓</span> : pro === '—' ? <span className="text-brand-muted">—</span> : <span className="text-brand-green font-semibold">{pro}</span>}</td>
                    <td className={`p-4 text-center text-[14px] text-brand-dim ${i < FEATURE_MATRIX.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{business === '✓' ? <span className="text-brand-green font-semibold">✓</span> : business === '—' ? <span className="text-brand-muted">—</span> : business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[minmax(0,320px)_1fr] max-[880px]:grid-cols-1 gap-20 max-[880px]:gap-8 max-w-[960px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,38px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Billing<br />questions?
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.6]">
                Payments are handled by Paddle — a trusted Merchant of Record used by thousands of SaaS companies. They handle tax, compliance, and card processing on our behalf.
              </p>
            </div>
            <div className="reveal">
              <Accordion type="single" collapsible defaultValue="no-cc">
                {BILLING_FAQ.map(({ id, q, a }) => (
                  <AccordionItem key={id} value={id} className="border-b border-brand-line-soft">
                    <AccordionTrigger className="text-[16px] font-semibold tracking-[-0.01em] py-5 hover:no-underline text-brand-text">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-brand-dim text-[15px] leading-[1.6] pb-5">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
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
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">5 monitors, no card, no time limit.</p>
          <CtaForm className="mx-auto" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

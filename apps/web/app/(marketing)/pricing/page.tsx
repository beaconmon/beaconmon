import NavBar from '@/components/marketing/NavBar';
import PricingToggle from '@/components/marketing/PricingToggle';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { PRICING } from '@/lib/pricing';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Beaconmon Store & Competitor Monitoring',
  description:
    'Simple pricing for ecommerce website monitoring. 10 monitors free forever. Starter $29/mo, Growth $79/mo AI insights, Scale $199/mo unlimited monitoring.',
  alternates: { canonical: 'https://beaconmon.com/pricing' },
  openGraph: { url: 'https://beaconmon.com/pricing' },
};

type MatrixRow = { feature: string; free: string; starter: string; growth: string; scale: string };

const CORE_MONITORING: MatrixRow[] = [
  { feature: 'Monitors',              free: '10',          starter: '25',        growth: '100',              scale: 'Unlimited' },
  { feature: 'Check interval',        free: '5 min',       starter: '1 min',     growth: '1 min',            scale: '30 sec' },
  { feature: 'History retention',     free: '7 days',      starter: '30 days',   growth: '90 days',          scale: '365 days' },
  { feature: 'Global checks',         free: '—',           starter: '—',         growth: '5 regions',        scale: '5 regions' },
  { feature: 'SSL & domain expiry',   free: '✓',           starter: '✓',         growth: '✓',                scale: '✓' },
  { feature: 'Maintenance windows',   free: '—',           starter: '✓',         growth: '✓',                scale: '✓' },
];

const INTELLIGENCE: MatrixRow[] = [
  { feature: 'Competitor monitors',   free: '1',           starter: '5',         growth: '25',               scale: 'Unlimited' },
  { feature: 'Content monitoring',    free: '—',           starter: '✓',         growth: '✓',                scale: '✓' },
  { feature: 'Weekly Competitor Report',   free: 'Weekly',      starter: 'Weekly',    growth: 'Daily + weekly',   scale: 'Daily + weekly' },
  { feature: 'Smart Setup',           free: 'Template',    starter: 'Template',  growth: 'AI-powered',       scale: 'AI-powered' },
  { feature: 'AI change summaries (what changed, in plain English)',       free: '—',           starter: '—',         growth: '✓',                scale: '✓' },
  { feature: 'Smart Alerts',          free: '—',           starter: '—',         growth: '✓',                scale: '✓' },
  { feature: 'Update-aware alerts',   free: '—',           starter: '✓',         growth: '✓',                scale: '✓' },
  { feature: 'Uptime goals',          free: '—',           starter: '1',         growth: 'Unlimited',        scale: 'Unlimited' },
];

const TEAM_AND_ALERTS: MatrixRow[] = [
  { feature: 'Status pages',          free: '1',           starter: '3',         growth: '10',               scale: 'Unlimited' },
  { feature: 'Team members',          free: '1',           starter: '3',         growth: '10',               scale: 'Unlimited' },
  { feature: 'Alert channels',        free: 'Email only',  starter: 'Unlimited', growth: 'Unlimited',        scale: 'Unlimited' },
  { feature: 'Priority support',      free: '—',           starter: '—',         growth: '—',                scale: '✓' },
];

const BILLING_FAQ = [
  {
    id: 'after-trial',
    q: 'What happens after my trial?',
    a: 'When your 14-day trial ends, your account moves to Free Lite automatically. You keep 1 competitor monitor, uptime checks for up to 10 monitors, and weekly competitor reports. No charge is made unless you choose to upgrade.',
  },
  {
    id: 'what-is-competitor',
    q: 'What counts as a competitor?',
    a: 'A competitor is any brand whose website you want to monitor for price and content changes. You add competitors by domain (e.g., rivalshop.com). Each domain counts as one competitor toward your plan limit.',
  },
  {
    id: 'non-shopify',
    q: 'Does this work for non-Shopify stores?',
    a: 'Yes. Beaconmon works with any publicly accessible website. Smart Setup has first-class detection for Shopify and WooCommerce stores, but competitor tracking and uptime monitoring work for any URL, including marketplaces, direct-to-consumer brands, and manufacturer sites.',
  },
  {
    id: 'html-only',
    q: 'Why is content monitoring HTML-only?',
    a: 'Content change detection works by fetching the HTML of a page and comparing text content against the previous snapshot. This covers the vast majority of pricing and promo copy changes. Full JavaScript rendering would require a headless browser for every check, which is not feasible at the check frequencies and scale we support.',
  },
  {
    id: 'competitor-monitor',
    q: 'What counts as a "competitor monitor"?',
    a: 'Each URL you add for a competitor brand counts as one competitor monitor. A typical setup tracks a competitor\'s pricing page, homepage, and product listing as three separate monitors. Competitor monitors come from your plan\'s competitor monitor quota, not your general monitor quota.',
  },
  {
    id: 'smart-setup',
    q: 'How does Smart Setup work?',
    a: 'Paste your store URL and Beaconmon fetches the page, detects your platform (Shopify, WooCommerce, etc.), and proposes a bundle of monitors covering your homepage, cart, checkout, and key product pages. On Growth and Scale plans, an AI layer also suggests CSS selectors for price and content tracking. You confirm or edit the bundle, then all monitors are created in one click.',
  },
  {
    id: 'screenshots',
    q: 'Do you store screenshots of competitor sites?',
    a: 'No. Beaconmon does not take or store screenshots. Competitor monitoring works by fetching the HTML of competitor pages and comparing selected text content (prices, headings, copy) against the previous snapshot. Only the text content of tracked selectors is stored, not full page captures.',
  },
  {
    id: 'switch-plans',
    q: 'Can I change plans later?',
    a: 'Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the end of your current billing period. You can switch between monthly and annual billing at any time from your billing settings.',
  },
  {
    id: 'scale-contract',
    q: 'Is there a contract for Scale?',
    a: 'No. Scale is month-to-month (or annual if you choose annual billing) like all other plans. No minimum term, no cancellation fees. Cancel any time from the billing portal in your dashboard.',
  },
];

const MONTHLY = { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' };

const PRICING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Beaconmon',
  url: 'https://beaconmon.com/pricing',
  brand: { '@type': 'Brand', name: 'Beaconmon' },
  description:
    'Ecommerce website and competitor monitoring platform. Monitor your store and competitors automatically, uptime, content changes, pricing shifts, SSL expiry, and multi-location checks.',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: String(PRICING.scale.monthly),
    priceCurrency: 'USD',
    offerCount: 4,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: 'https://beaconmon.com/sign-up',
      },
      {
        '@type': 'Offer',
        name: 'Starter',
        price: String(PRICING.starter.monthly),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: 'https://beaconmon.com/sign-up',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(PRICING.starter.monthly),
          priceCurrency: 'USD',
          referenceQuantity: MONTHLY,
        },
      },
      {
        '@type': 'Offer',
        name: 'Growth',
        price: String(PRICING.growth.monthly),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: 'https://beaconmon.com/sign-up',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(PRICING.growth.monthly),
          priceCurrency: 'USD',
          referenceQuantity: MONTHLY,
        },
      },
      {
        '@type': 'Offer',
        name: 'Scale',
        price: String(PRICING.scale.monthly),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: 'https://beaconmon.com/sign-up',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(PRICING.scale.monthly),
          priceCurrency: 'USD',
          referenceQuantity: MONTHLY,
        },
      },
    ],
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: BILLING_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

function renderCell(value: string) {
  if (value === '✓') return <span className="text-brand-green-ink font-semibold">✓</span>;
  if (value === '—') return <span className="text-brand-muted">—</span>;
  return value;
}

function renderGrowthCell(value: string) {
  if (value === '✓') return <span className="text-brand-green-ink font-semibold">✓</span>;
  if (value === '—') return <span className="text-brand-muted">—</span>;
  return <span className="text-brand-green-ink font-semibold">{value}</span>;
}

function MatrixSection({ label, rows }: { label: string; rows: MatrixRow[] }) {
  return (
    <>
      <tr>
        <td colSpan={5} className="px-4 pt-5 pb-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-muted">{label}</span>
        </td>
      </tr>
      {rows.map(({ feature, free, starter, growth, scale }, i) => (
        <tr key={feature}>
          <td className={`p-4 text-[14px] text-brand-dim ${i < rows.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
          <td className={`p-4 text-center text-[14px] text-brand-dim ${i < rows.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{renderCell(free)}</td>
          <td className={`p-4 text-center text-[14px] text-brand-dim ${i < rows.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{renderCell(starter)}</td>
          <td className={`p-4 text-center text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.15)] ${i < rows.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{renderGrowthCell(growth)}</td>
          <td className={`p-4 text-center text-[14px] text-brand-dim ${i < rows.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{renderCell(scale)}</td>
        </tr>
      ))}
    </>
  );
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={PRICING_SCHEMA} />
      <JsonLd data={FAQ_SCHEMA} />
      <JsonLd data={breadcrumbSchema({ name: 'Pricing', path: '/pricing' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Pricing</span>
          <h1 className="text-[clamp(40px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5">
            Start free. One smart price move pays for the year.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mx-auto">
            Every plan includes a weekly competitor report, uptime monitoring, and SSL checks. Free Lite includes 1 competitor monitor. Daily digests and AI-powered insights unlock on Growth and above.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-[80px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <PricingToggle />
          <div className="mt-8 max-w-[540px] mx-auto px-5 py-4 rounded-xl border border-[var(--brand-green-border-20)] bg-[var(--brand-green-glow-04)] text-center">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              Beaconmon watches your competitors&apos; prices, promos, and stock around the clock, so you hear about a change in hours, not after you&apos;ve lost the sale.
            </p>
          </div>
          <p className="text-center mt-6 text-brand-muted text-[13px] max-w-[600px] mx-auto leading-[1.6]">
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft w-[35%]">Feature</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Free</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Starter</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.15)]">Growth</th>
                  <th className="p-4 text-center text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Scale</th>
                </tr>
              </thead>
              <tbody>
                <MatrixSection label="Monitoring & Reporting" rows={INTELLIGENCE} />
                <tr><td colSpan={5} className="border-t border-brand-line-soft" /></tr>
                <MatrixSection label="Core monitoring" rows={CORE_MONITORING} />
                <tr><td colSpan={5} className="border-t border-brand-line-soft" /></tr>
                <MatrixSection label="Team & alerts" rows={TEAM_AND_ALERTS} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[minmax(0,320px)_1fr] max-[880px]:grid-cols-1 gap-20 max-[880px]:gap-8 max-w-[960px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,38px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Questions?
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.6]">
                Payments are handled by Freemius, Inc., a trusted Merchant of Record used by thousands of SaaS companies. They handle tax, compliance, and card processing on our behalf.
              </p>
              <p className="text-brand-dim text-[15px] leading-[1.6] mt-4">
                Read about our infrastructure, encryption, and data handling on the{' '}
                <Link href="/security" className="text-brand-green-ink hover:underline">Security page</Link>.
              </p>
            </div>
            <div className="reveal">
              {BILLING_FAQ.map(({ id, q, a }) => (
                <details key={id} id={id} open className="group border-b border-brand-line-soft">
                  <summary className="flex items-center justify-between py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[16px] font-semibold tracking-[-0.01em] text-brand-text">
                    {q}
                    <svg className="w-4 h-4 shrink-0 text-brand-muted transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <p className="text-brand-dim text-[15px] leading-[1.6] pb-5">{a}</p>
                </details>
              ))}
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
          <p className="text-brand-dim text-[17px] mb-8">10 monitors, no card, no time limit.</p>
          <CtaForm className="mx-auto" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

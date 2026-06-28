import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import CompetitorChangesTool from '@/components/tools/CompetitorChangesTool';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Shopify Competitor Change Checker: Track Price and Promo Changes | Beaconmon',
  description:
    'Free tool to check if a Shopify competitor changed their prices, launched a promotion, or added products. See their change history in seconds. No signup, no app install.',
  alternates: { canonical: 'https://beaconmon.com/tools/shopify-competitor-changes' },
};

const SNAPSHOT_NOW = [
  'Current product count and what is on sale right now',
  'Active promotional markdowns with the percent off',
  'A sample of the catalog with current prices',
  'Recent change history if Beaconmon has monitored this store',
];

const MONITORING_ADDS = [
  'An alert the moment any price drops',
  'A heads up when a promo or sale launches',
  'New product launches as they go live',
  'Price and promo history over weeks and months',
];

const HOW_IT_WORKS = [
  'Paste a competitor\'s Shopify store URL. You can use the bare domain, like competitor-store.com.',
  'Beaconmon reads the store\'s public catalog and checks our change database for recent activity.',
  'If we have history on this store, you see recent price drops, promo launches, and product changes.',
  'Sign up to start capturing future changes with instant alerts and weekly intelligence digests.',
];

const FAQS = [
  {
    q: 'Can I see what changed on a Shopify store?',
    a: 'Yes, if Beaconmon has monitoring history on that store from any prior user. When history exists, you see the last several changes including price drops, sale launches, and new products. For stores we have not monitored yet, you see a current snapshot of their catalog.',
  },
  {
    q: 'Is this free?',
    a: 'The one-time check is completely free with no signup and no app install. Continuous monitoring, which alerts you the moment a price drops or a promo launches, is a paid Beaconmon plan with a free tier.',
  },
  {
    q: 'What kinds of changes does it detect?',
    a: 'Price drops, promotional markdowns, new products added, product removals, and content updates on key pages. The paid monitoring plan captures all of these as they happen and sends instant alerts.',
  },
  {
    q: 'Does it work on non-Shopify stores?',
    a: 'This tool is Shopify-specific because Shopify stores publish a public product catalog. Beaconmon monitoring supports WooCommerce and any website via CSS selector targeting on the pages you choose.',
  },
  {
    q: 'How is this different from other Shopify spy tools?',
    a: 'Most spy tools show static information about a store: its theme, installed apps, or revenue estimates. This tool focuses on what changed over time, which is the intelligence that affects your pricing and promotion decisions.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shopify Competitor Change Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/shopify-competitor-changes',
  description:
    'Free tool to check if a Shopify competitor recently changed their prices, launched a promotion, or added products.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function ShopifyCompetitorChangesPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Shopify Competitor Change Checker', path: '/tools/shopify-competitor-changes' }
        )}
      />
      <NavBar />

      {/* Hero */}
      <section className="relative pt-[88px] pb-[72px] max-[640px]:pt-16 max-[640px]:pb-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-8%',
            width: 680,
            height: 680,
            background: 'radial-gradient(circle, rgba(0,229,122,0.13), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free tool
          </span>
          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[860px] [overflow-wrap:anywhere]">
            See what changed on any Shopify competitor store
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-8">
            Paste a competitor&apos;s store URL. In seconds you see recent price drops, promo launches, and product changes.
            No signup, no app install.
          </p>
          <CompetitorChangesTool />
        </div>
      </section>

      {/* Free vs paid seam */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What a one-time check shows, and what monitoring adds
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              A one-time check surfaces history we already have. Ongoing monitoring means you never miss the moment
              something changes.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-5">
                One-time check, free, right now
              </h3>
              <ul className="space-y-3">
                {SNAPSHOT_NOW.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal bg-brand-bg1 border border-brand-green-border-25 rounded-2xl p-8 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{ top: '-40%', right: '-20%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(0,229,122,0.10), transparent 60%)', filter: 'blur(30px)' }}
              />
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink mb-5 relative">
                Monitoring, continuous
              </h3>
              <ul className="space-y-3 relative">
                {MONITORING_ADDS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                How the Shopify competitor change checker works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most Shopify stores publish their catalog publicly. We read that catalog and cross-check our monitoring
                database to surface any changes we have already logged for that store.
              </p>
            </div>
            <ul className="space-y-4">
              {HOW_IT_WORKS.map((item, i) => (
                <li
                  key={i}
                  className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5"
                >
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[1px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">
              Frequently asked questions
            </h2>
          </div>
          <div className="reveal max-w-[760px] mx-auto space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/tools/shopify-competitor-snapshot" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor snapshot</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Promotion monitoring</Link>
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
            Your competitors are changing prices right now.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches your competitors and alerts you the moment prices or promos change. Free forever for 10
            monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

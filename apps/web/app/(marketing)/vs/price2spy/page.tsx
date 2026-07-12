import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Price2Spy for Shopify Stores (2026)',
  description:
    'Price2Spy vs Beaconmon: catalog-scale price database vs price-plus-context monitoring for Shopify stores. Compare pricing, setup time, and what each tool covers.',
  alternates: { canonical: 'https://beaconmon.com/vs/price2spy' },
  openGraph: { url: 'https://beaconmon.com/vs/price2spy' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ Price + surrounding context',
    competitor: '✓ Catalog-level price database',
    beaconmonGood: true,
  },
  {
    feature: 'Tracks promotional copy changes',
    beaconmon: '✓ Yes, any content element',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Marketplace monitoring (Amazon, Google Shopping, Walmart)',
    beaconmon: 'No',
    competitor: '✓ Yes',
    beaconmonGood: false,
  },
  {
    feature: 'MAP compliance monitoring across resellers',
    beaconmon: 'No',
    competitor: '✓ Yes',
    beaconmonGood: false,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Both included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Setup process',
    beaconmon: 'Enter store and competitor URLs, ~10 minutes',
    competitor: 'SKU catalog import, product matching',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'None',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$157.95/mo',
    beaconmonGood: true,
  },
];

const PRICE2SPY_STRENGTHS = [
  {
    title: 'Catalog-scale price intelligence',
    body: 'Price2Spy is built for retailers tracking thousands of SKUs with long-run price history. If you need structured price data across a large catalog, Price2Spy is purpose-built for that scale in a way Beaconmon is not.',
  },
  {
    title: 'Marketplace monitoring',
    body: 'Price2Spy monitors prices on Amazon, Google Shopping, and Walmart, not just competitor websites. Beaconmon watches specific competitor pages you choose. It does not cover marketplace listings.',
  },
  {
    title: 'MAP compliance across resellers',
    body: 'For brands that need to enforce minimum advertised price policies across a network of resellers, Price2Spy tracks compliance at that level. Beaconmon does not offer MAP compliance monitoring.',
  },
  {
    title: 'Custom data capture and repricing integrations',
    body: 'Price2Spy configures custom data capture for competitor pages with non-standard markup, and integrates with dedicated repricing tools for enterprise workflows. Beaconmon surfaces the change; it does not automate repricing.',
  },
];

const SWITCH_REASONS = [
  "Price2Spy's $157.95/mo minimum is built for retailers with hundreds of SKUs. Stores with a focused catalog of 10 to 50 products are paying for capacity that sits idle.",
  'Price2Spy is a price database with no surrounding context. It does not monitor promotional copy, homepage banners, or the signals that explain why a competitor moved a price.',
  "When your site goes down during a competitor's sale, Price2Spy does not alert you. Uptime and competitor tracking are separate subscriptions with Price2Spy, included together in Beaconmon.",
  'Price2Spy requires importing a product catalog and matching SKUs to competitor listings before the first alert fires, which can take days. Beaconmon setup takes about 10 minutes with no catalog import.',
  'Price2Spy has no consolidated weekly summary. Beaconmon sends a Weekly Competitor Report to Slack or email so you are not checking a dashboard daily.',
];

const FAQ_ITEMS = [
  {
    q: 'Is Beaconmon a Price2Spy replacement for large catalog retailers?',
    a: 'No. Price2Spy is designed for retailers with hundreds or thousands of SKUs who need catalog-level price tracking, MAP monitoring, and marketplace coverage across Amazon, Google Shopping, and Walmart. Beaconmon is the right fit for Shopify stores with a focused set of competitor pages to watch, not catalog-scale price databases.',
  },
  {
    q: 'Does Beaconmon require importing a product catalog like Price2Spy?',
    a: 'No. Beaconmon uses CSS-selector targeting on specific competitor pages. You add a competitor URL, choose what element to watch such as price, stock badge, or promotional copy, and you are done. No catalog import, no SKU matching.',
  },
  {
    q: 'What does Beaconmon offer that Price2Spy does not?',
    a: 'Uptime monitoring, promotional copy and banner change tracking, a Weekly Competitor Report, and a price point that fits small Shopify stores. Price2Spy tracks prices at catalog scale, starts at $157.95/mo, and has no free plan.',
  },
  {
    q: 'When does Price2Spy make more sense than Beaconmon?',
    a: 'Price2Spy is the stronger choice when you need marketplace monitoring on Amazon, Google Shopping, or Walmart, MAP compliance tracking across a reseller network, custom data capture for non-standard page formats, or integrations with dedicated repricing tools. For a large-catalog retailer with enterprise price operations, Price2Spy has more built-in depth.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Price2Spy', item: 'https://beaconmon.com/vs/price2spy' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    },
  ],
};

export default function VsPrice2SpyPage() {
  return (
    <>
      <JsonLd data={schemaData} />
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
          <Link href="/vs" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All comparisons
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Comparison</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Beaconmon vs Price2Spy<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Price2Spy is a catalog-scale price intelligence platform built for retailers with hundreds or thousands of SKUs, marketplace monitoring, and MAP compliance tracking. Beaconmon tracks competitor prices in context, promotional copy, stock badges, and full-page content, at a price point built for small Shopify stores, with uptime monitoring included.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Choose Price2Spy if you manage a large product catalog, need marketplace monitoring across Amazon, Google Shopping, and Walmart, or require MAP compliance tracking across resellers. Choose Beaconmon if you run a Shopify store with a focused set of competitors, want price changes shown with surrounding context, and want competitor monitoring and uptime monitoring in one tool starting at $29 per month.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Price2Spy</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(({ feature, beaconmon, competitor, beaconmonGood }, i) => (
                  <tr key={feature}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] font-medium ${beaconmonGood ? 'text-brand-green-ink' : 'text-brand-dim'} ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{beaconmon}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Where Price2Spy wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Price2Spy genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Price2Spy is stronger in several categories built for large-catalog retailers, and those are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {PRICE2SPY_STRENGTHS.map(({ title, body }) => (
                <div key={title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-2">{title}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why people switch */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why Shopify stores switch to Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Stores switching from Price2Spy usually share the same profile: a focused catalog, not hundreds of SKUs, and a preference for context over a raw price database.
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

      {/* Quote */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <blockquote className="reveal max-w-[700px] mx-auto border-l-2 border-brand-green-ink pl-8 py-2">
            <p className="text-[18px] leading-[1.7] text-brand-dim italic mb-4">
              &ldquo;Price2Spy wanted a full SKU catalog before it would track anything. We only cared about six competitors and their promo pages. Beaconmon had us watching prices and banners the same afternoon, no import required.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United States, migrated 2025</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Price2Spy
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch is straightforward if you are watching a focused set of competitor pages rather than a full SKU catalog.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Price2Spy and note the competitor URLs and products you currently track.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, add the pages you want to watch. The wizard suggests Shopify preset selectors for price, stock, and promotional badges.' },
                { step: '4', text: 'Connect Slack or email and configure your Weekly Competitor Report to replace the Price2Spy dashboard check.' },
                { step: '5', text: 'Run both tools in parallel for a week to confirm coverage, then cancel Price2Spy.' },
              ].map(({ step, text }) => (
                <li key={step} className="reveal flex items-start gap-4 text-[14px] text-brand-dim">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(0,229,122,0.12)] text-brand-green-ink text-[12px] font-bold flex items-center justify-center mt-0.5">{step}</span>
                  <span className="leading-[1.6] pt-1">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-6">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="reveal border-b border-brand-line-soft pb-6">
                  <p className="text-[15px] font-semibold text-brand-text mb-2">{q}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{a}</p>
                </div>
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
            Try Beaconmon free.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">
              See the Shopify-specific setup →
            </Link>
          </p>
        </div>
      </section>

      {/* See also */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceMole</Link>
            <Link href="/vs/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Price Otus</Link>
            <Link href="/alternatives/price2spy" className="text-brand-dim hover:text-brand-text transition-colors">Cheaper alternative to Price2Spy</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

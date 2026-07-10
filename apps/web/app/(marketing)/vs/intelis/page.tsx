import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Intelis for Shopify (2026)',
  description:
    'Intelis AI Dynamic Pricing vs Beaconmon: automated repricing on Google Shopping vs competitor monitoring, uptime, and Intelligence Digest compared.',
  alternates: { canonical: 'https://beaconmon.com/vs/intelis' },
  openGraph: { url: 'https://beaconmon.com/vs/intelis' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Google Shopping + direct sites',
    beaconmonGood: false,
  },
  {
    feature: 'Monitors Google Shopping prices',
    beaconmon: 'No',
    competitor: '✓ Core feature',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (adjusts your prices)',
    beaconmon: 'No',
    competitor: '✓ Rule-based auto-repricing',
    beaconmonGood: false,
  },
  {
    feature: 'AI product matching',
    beaconmon: 'Preset selectors',
    competitor: '✓ Automated AI matching',
    beaconmonGood: false,
  },
  {
    feature: 'Promotional copy and banner monitoring',
    beaconmon: '✓ Any content element',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Intelligence Digest (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: '$29/mo',
    competitor: '$49/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You want automated repricing, not just alerts.',
    body: 'Intelis automatically adjusts your Shopify product prices based on competitor price moves and your margin rules. Beaconmon alerts you to changes; you decide what to do. If you want your prices to update automatically, Intelis is the right tool.',
  },
  {
    title: 'You sell on Google Shopping and want price monitoring there.',
    body: 'Intelis is built around Google Shopping intelligence. It tracks competitor prices on the Shopping network alongside direct sites. Beaconmon monitors direct competitor websites only.',
  },
  {
    title: 'You have a catalog that needs AI product matching.',
    body: 'Intelis automatically matches your products to competitor listings. For stores with many SKUs and complex catalog matching needs, that AI matching is a major time saver.',
  },
];

const SWITCH_REASONS = [
  'You want to know when a competitor changes their homepage banner or launches a promotional campaign, not just when a product price changes. Intelis does not monitor content changes.',
  'Your own store\'s uptime is as important as your competitor\'s prices. Intelis does not monitor uptime. Beaconmon covers both.',
  'You want a weekly Intelligence Digest summarizing every competitor move in Slack, not just individual price alerts.',
  'You do not sell on Google Shopping and do not need repricing automation. Beaconmon is simpler and cheaper for stores that want monitoring without automation.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Intelis and Beaconmon?',
    a: 'Intelis is a repricing tool. It monitors competitor prices and automatically adjusts your Shopify prices based on rules. Beaconmon is a monitoring and alerting tool. It watches competitor prices, promotions, and page changes, and sends you alerts and weekly digests. Beaconmon also monitors your store\'s uptime and SSL status. Intelis does none of that.',
  },
  {
    q: 'Does Beaconmon auto-reprice my Shopify products?',
    a: 'No. Beaconmon alerts you when a competitor changes a price or runs a promotion. Acting on that information is your decision. If you want automatic repricing, Intelis, PriceMole, or Pricefy are purpose-built for that.',
  },
  {
    q: 'Is Intelis better for price tracking than Beaconmon?',
    a: 'For catalog-level price tracking with Google Shopping integration and AI product matching, yes. Intelis is specifically designed for that. Beaconmon is better for monitoring competitor pages in context: price plus promotional copy, banner changes, stock status, and any other content element.',
  },
  {
    q: 'Does Intelis have a free plan?',
    a: 'No. Intelis starts at $49/mo. Beaconmon\'s free plan covers 10 monitors and 1 competitor forever with no credit card.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/intelis',
      name: 'Beaconmon vs Intelis for Shopify (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Intelis', item: 'https://beaconmon.com/vs/intelis' },
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

export default function VsIntelisPage() {
  return (
    <>
      <JsonLd data={schemaData} />
      <NavBar />

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
            Beaconmon vs Intelis<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Intelis auto-reprices your Shopify products based on competitor prices on Google Shopping. Beaconmon monitors competitor pages for price, promotional copy, and content changes, and alerts you when something worth acting on happens. They solve different problems. Here is how to tell which one your store needs.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Intelis is a repricing engine. It is the right choice if you want your Shopify prices to adjust automatically when competitors move on Google Shopping. Beaconmon is an intelligence and monitoring tool. It is the right choice if you want to know when a competitor changes prices, launches a promotion, or edits their product pages, and you want that context alongside uptime and SSL monitoring. Many stores end up running both.
            </p>
          </div>
        </div>
      </section>

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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Intelis</th>
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

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Intelis
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Intelis does things Beaconmon does not. Be clear about where it fits before switching.
              </p>
            </div>
            <div className="space-y-4">
              {STAY_REASONS.map(({ title, body }) => (
                <div key={title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-1">{title}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why ecommerce stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Usually it comes down to needing more than price changes. Promotions, content shifts, and uptime matter just as much.
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

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <blockquote className="reveal max-w-[700px] mx-auto border-l-2 border-brand-green-ink pl-8 py-2">
            <p className="text-[18px] leading-[1.7] text-brand-dim italic mb-4">
              &ldquo;I tried Intelis first because I wanted to track competitor prices. But what I actually needed was to know when they changed their site copy and ran a sale. Beaconmon caught things Intelis was never going to see.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United States, switched mid-2026</cite>
          </blockquote>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Getting started with Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                If you choose Beaconmon, setup takes under 30 minutes. Note: Beaconmon and Intelis can run at the same time if you want monitoring alongside repricing automation.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Sign up for Beaconmon free (no card required). Add your store URL for uptime monitoring.' },
                { step: '2', text: 'Add competitor domains. For each competitor, choose what to track: price, stock, promotional copy, or the full page. Preset selectors handle most Shopify and WooCommerce stores.' },
                { step: '3', text: 'Connect Slack or email. The Intelligence Digest is configured here.' },
                { step: '4', text: 'If you also want auto-repricing, Intelis and Beaconmon can run simultaneously: Beaconmon for monitoring and context, Intelis for the repricing automation.' },
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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/rivalert" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Rivalert</Link>
            <Link href="/alternatives/intelis" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to Intelis</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

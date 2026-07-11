import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to PriceOtus for Shopify Competitor Monitoring (2026)',
  description:
    'PriceOtus is a repricing app for Shopify. Beaconmon covers price, promo, and uptime monitoring with 10 monitors free, no repricing lock-in.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/priceotus' },
  openGraph: { url: 'https://beaconmon.com/alternatives/priceotus' },
};

const TOOL_FACTS = [
  { label: 'Starting paid price', value: '$39/mo (Pro, 200 products)' },
  { label: 'Free plan', value: '5 products, 1 competitor per product, daily updates' },
  { label: 'Core feature', value: 'Competitor discovery, variant matching, and rule-based auto-repricing' },
  { label: 'Content change monitoring', value: 'No, promotional copy and banners are not tracked' },
  { label: 'Uptime monitoring', value: 'No' },
  { label: 'SSL / domain expiry alerts', value: 'No' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'Variant-level tracking', value: 'Yes, a genuine advantage over Beaconmon' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'The free plan covers five products.',
    body: 'PriceOtus\'s free tier is capped at 5 products with 1 competitor each, checked once a day. Beaconmon\'s free plan covers 10 monitors and 1 competitor with no product-count ceiling on what a monitor can watch.',
  },
  {
    heading: 'You are not looking for repricing automation.',
    body: 'PriceOtus is built to adjust your prices automatically. If you want to see a competitor move and decide your own response, that automation is a feature you will not use.',
  },
  {
    heading: 'Promotions and page content go untracked.',
    body: 'PriceOtus watches prices, not promotional banners or product copy. Beaconmon tracks the full page, so a sale campaign or rewritten description gets caught too.',
  },
  {
    heading: 'Uptime monitoring is missing entirely.',
    body: 'PriceOtus has no uptime monitoring at any tier. Beaconmon includes it, along with SSL and domain expiry alerts, on every plan.',
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, forever. No card needed.',
  'Starter at $29/mo, cheaper than PriceOtus\'s $39/mo Pro tier.',
  'Monitors promotional copy, sale banners, and content changes alongside price.',
  'Uptime monitoring and SSL expiry alerts included in every plan.',
  'Domain expiry alerts at 30, 14, and 7 days.',
  'Weekly Competitor Report: a weekly Slack or email summary of every competitor change.',
  'No repricing automation. You decide what to do with the information.',
];

const WHERE_PRICEOTUS_WINS = [
  {
    heading: 'Rule-based auto-repricing.',
    body: 'PriceOtus holds a perfect 5.0 rating across its reviews and is purpose-built for automated price adjustment. If you want your Shopify prices to move on their own, PriceOtus does that and Beaconmon does not.',
  },
  {
    heading: 'Variant-level price comparison.',
    body: 'PriceOtus compares pricing at the variant level, sizes, colors, bundles. Beaconmon\'s per-page monitoring does not natively break out variants the same way.',
  },
  {
    heading: 'Built-in price history charts.',
    body: 'PriceOtus renders price history as charts per product out of the box. Beaconmon logs changes chronologically but does not build dedicated charting.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon auto-reprice my Shopify products like PriceOtus does?',
    a: 'No. Beaconmon monitors competitor pages and alerts you when something changes. PriceOtus automatically adjusts your product prices based on rules. If automation is what you need, PriceOtus is purpose-built for that.',
  },
  {
    q: 'Does Beaconmon track product variants like PriceOtus does?',
    a: 'Not natively at the variant level. Beaconmon monitors the pages and elements you configure per competitor. PriceOtus is built specifically around variant-level comparison, which matters more if your catalog has heavy variant complexity.',
  },
  {
    q: 'Is Beaconmon a good replacement for PriceOtus if I only want monitoring?',
    a: 'Yes. If you want to know when a competitor changes their price, runs a promotion, or updates their website without any auto-repricing, Beaconmon covers that from free, or $29/mo for unlimited competitors.',
  },
  {
    q: 'Can I run Beaconmon and PriceOtus together?',
    a: 'Yes. Use Beaconmon to monitor promotions, content changes, and your own store\'s uptime. Use PriceOtus for the repricing automation on your catalog. They serve different parts of the same workflow.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/priceotus',
      name: 'Free Alternative to PriceOtus for Shopify Competitor Monitoring (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'PriceOtus alternative', item: 'https://beaconmon.com/alternatives/priceotus' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function PriceOtusAlternativePage() {
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free alternative to PriceOtus
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Competitor monitoring for Shopify stores. Without the repricing rules.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            PriceOtus is a solid budget repricing tool. If you want alerts when competitors change prices, run promotions, or update their pages, without automation touching your own prices, Beaconmon covers that from free.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What PriceOtus costs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The pricing facts, without spin.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">PriceOtus</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">$39<span className="text-[18px] font-semibold text-brand-dim">/mo</span></div>
              <p className="text-brand-dim text-[14px] mb-6">Free plan capped at 5 products. Pro Advanced ($89/mo) and Ultimate ($349/mo) scale up to 10,000 products.</p>
              <div className="space-y-2">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-[13px]">
                    <span className="text-brand-muted shrink-0 w-[150px]">{label}</span>
                    <span className="text-brand-dim">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">Free<span className="text-[18px] font-semibold text-brand-dim"> to start</span></div>
              <p className="text-brand-dim text-[14px] mb-6">10 monitors and 1 competitor free forever. Starter at $29/mo unlocks unlimited competitors and Weekly Competitor Report.</p>
              <div className="space-y-3">
                {[
                  'No card required to start',
                  'Competitor content and price monitoring',
                  'Uptime, SSL, and domain expiry alerts',
                  'Weekly Competitor Report on Starter+',
                  'No auto-repricing (you stay in control)',
                  'See pricing details',
                ].map((item, i) =>
                  i === 5 ? (
                    <Link key={item} href="/pricing" className="flex items-start gap-2 text-[13px] text-brand-green-ink hover:underline">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </Link>
                  ) : (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-brand-dim">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Why Shopify stores look for a PriceOtus alternative</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">PriceOtus is built for repricing. Not every store wants automated price changes.</p>
          </div>
          <div className="space-y-4">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon covers instead</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Built for stores that want to watch competitors and stay online, not automate pricing decisions.
            </p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[660px] mx-auto">
            {BEACONMON_WINS.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-xl px-5 py-4">
                <CheckIcon className="mt-[2px] shrink-0 text-brand-green-ink" />
                <p className="text-brand-dim text-[14px] leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center text-brand-muted text-[13px] mt-6">
            Want to track competitor prices specifically?{' '}
            <Link href="/competitor-price-tracking" className="text-brand-green-ink hover:underline">
              See how competitor price tracking works in Beaconmon →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where PriceOtus still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Be honest about this. If PriceOtus is the right fit, we will say so.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_PRICEOTUS_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center mt-8">
            <Link href="/vs/priceotus" className="text-brand-green-ink text-[14px] hover:underline">
              Read the full Beaconmon vs PriceOtus comparison →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
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
            <Link href="/vs/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceOtus</Link>
            <Link href="/alternatives/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to PriceMole</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

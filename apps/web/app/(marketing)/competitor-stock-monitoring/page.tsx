import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Stock Monitoring for Shopify Stores | Beaconmon',
  description:
    'Track when competitor products go out of stock or restock. Beaconmon reads the isAvailable flag from the Shopify product feed and fires an alert the moment any variant flips, at the catalog level with no manual page tracking.',
  alternates: { canonical: 'https://beaconmon.com/competitor-stock-monitoring' },
};

const FEATURES = [
  {
    heading: 'Shopify feed availability monitoring',
    body: "The Shopify /products.json feed includes the isAvailable status for every product variant. Beaconmon reads this structured field and fires an event when any variant flips from in-stock to out-of-stock, or back, across the competitor's full catalog.",
  },
  {
    heading: 'Variant-level coverage with no manual page tracking',
    body: "Add one competitor domain and Beaconmon tracks availability across every variant in their catalog. When a specific colorway, size, or bundle configuration sells out, you see it without adding individual product page URLs.",
  },
  {
    heading: 'Out-of-stock intelligence',
    body: "When a competitor runs out of their best-sellers, that gap is a window for your own promotions, ad targeting, or inventory decisions. Beaconmon surfaces the exact products and variants affected with a timestamp.",
  },
  {
    heading: 'Back-in-stock signals',
    body: "A competitor restocking a product signals renewed demand for that item. Get alerted as soon as they replenish so you can adjust your own positioning, pricing, or ad spend accordingly.",
  },
];

const HOW_IT_WORKS = [
  "Paste a competitor's Shopify store domain and Beaconmon locates the public product feed automatically",
  'Beaconmon polls the feed and records the availability status of every variant on each check',
  'An event fires when any variant changes availability, with product name, variant details, and timestamp',
  'Get instant Slack or email alerts, or review all stock changes in the weekly Intelligence Digest',
];

const FAQS = [
  {
    q: 'What is the isAvailable field in the Shopify product feed?',
    a: "Every variant in the /products.json feed includes an available boolean. Beaconmon reads this field directly rather than parsing page HTML. This means availability is a structured signal, not an inference from scraped text.",
  },
  {
    q: 'Can I track availability for specific products only?',
    a: "The feed monitor covers the full catalog by default. If you only want to track specific products, add the individual product page URLs as content monitors instead. The feed approach gives full coverage; page-level monitors give focused tracking.",
  },
  {
    q: 'Does this work for WooCommerce or other platforms?',
    a: "WooCommerce and most other platforms don't expose a public product feed with structured availability data. For non-Shopify competitors, you can monitor individual product pages for text changes that signal out-of-stock status, but you won't get structured variant-level availability events.",
  },
  {
    q: 'How often does Beaconmon check availability?',
    a: 'Starter plan: every 60 seconds. Growth plan: every 60 seconds. Scale plan: every 30 seconds. Most teams set competitor feed monitors to a 5 to 15 minute interval to reduce noise from minor changes.',
  },
  {
    q: 'What other signals can I get from the Shopify product feed?',
    a: "The same feed monitor also captures new product launches, price changes, variant additions, and product removals. A single domain monitor covers availability, pricing, and launch intelligence in one place.",
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

const MOCKUP_EVENTS: React.ComponentProps<typeof IntelligenceMockup>['events'] = [
  { type: 'competitor', icon: 'x', label: 'Out of stock', detail: 'CompetitorBrand / Air Pro X: sizes S and M went unavailable', timeAgo: '22 min ago', bigText: true },
  { type: 'competitor', icon: '+', label: 'Back in stock', detail: 'CompetitorBrand / Everyday Runner: restocked all sizes', timeAgo: '3 hr ago' },
  { type: 'competitor', icon: 'x', label: 'Catalog-wide shortage', detail: 'CompetitorBrand2: 6 of 8 sizes now out of stock', timeAgo: '6 hr ago' },
  { type: 'alert', icon: '!', label: 'Best-seller out of stock 3 days', detail: 'CompetitorBrand / Trail Runner Pro: still unavailable', timeAgo: '3 days ago' },
];

export default function CompetitorStockMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Stock Monitoring', path: '/competitor-stock-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Stock Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Track When Competitor Products Go Out of Stock or Restock
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            The Shopify product feed carries a structured availability flag for every variant. Beaconmon reads that field and fires an alert the moment any variant flips, covering a competitor&apos;s full catalog from one domain, with no manual page tracking.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Intelligence mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How to monitor competitor stock status and sellout signals</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Structured out-of-stock and restock events from the Shopify feed, variant by variant.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 3, storeChanges: 48, storeChangesLabel: 'variants monitored', smartAlerts: 2, smartAlertsLabel: 'stock changes today' }}
              events={MOCKUP_EVENTS}
              slackNotification={{
                title: 'Out of stock detected',
                body: 'CompetitorBrand Air Pro X: S and M now unavailable.',
                timeAgo: '22 min ago',
                channel: '#intel',
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Availability intelligence from structured feed data</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Set up competitor stock monitoring in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                One domain covers the full catalog. No code, no scraping setup required.
              </p>
            </div>
            <ul className="space-y-4">
              {HOW_IT_WORKS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Frequently asked questions</h2>
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
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor intelligence</Link>
            <Link href="/competitor-product-launch-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor product launch tracking</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/competitor-collections-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor collections monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
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
            Turn competitor stock gaps into your opportunity.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

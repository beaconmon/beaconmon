import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Price Tracking for Shopify Stores | Beaconmon',
  description:
    'Track competitor prices from the Shopify product feed or via CSS selector targeting on any pricing page. Instant Slack alerts when a price drops. No code required.',
  alternates: { canonical: 'https://beaconmon.com/competitor-price-tracking' },
  openGraph: { url: 'https://beaconmon.com/competitor-price-tracking' },
};

const FEATURES = [
  {
    heading: 'Shopify product feed price tracking',
    body: 'Every public Shopify store exposes its catalog at /products.json, including prices and variants. Monitor a competitor domain once and Beaconmon tracks price changes across their entire catalog without adding each product page individually.',
  },
  {
    heading: 'CSS selector targeting for any platform',
    body: 'For WooCommerce, DTC sites, or individual Shopify product pages, target the exact price element with a CSS selector. A change from $79 to $59 shows up as a clean diff.',
  },
  {
    heading: 'Per-page price change history',
    body: 'Every change is logged with a before-and-after diff. Go back through 30, 90, or 365 days of price history depending on your plan.',
  },
  {
    heading: 'AI noise filtering',
    body: 'Growth plan and above: Beaconmon classifies changes as significant or cosmetic. A price change triggers an alert. A footer link update does not.',
  },
];

const HOW_IT_WORKS = [
  "Paste a competitor's Shopify store domain and Beaconmon finds the public product feed automatically",
  'For non-Shopify competitors, add the pricing page URL and enter the CSS selector for the price element',
  'Beaconmon checks at your chosen interval and records every change with a timestamped diff',
  'Review the diff history in the dashboard, or get alerts in Slack and email',
];

const FAQS = [
  {
    q: 'How does Shopify product feed price tracking work?',
    a: 'Every public Shopify store exposes a JSON product catalog at store.myshopify.com/products.json, which includes current prices and variants. Beaconmon monitors this endpoint so any price change across the full catalog triggers a diff, without needing to add each product page individually.',
  },
  {
    q: 'How accurate is CSS selector-based price tracking?',
    a: "If the competitor's site is server-rendered, CSS selector targeting is highly accurate. Beaconmon extracts just the text inside the targeted element, so a price change from $49 to $39 shows up as a clear diff.",
  },
  {
    q: "What if the competitor's site is JavaScript-rendered?",
    a: "Beaconmon uses HTML-only parsing. Most ecommerce pricing pages are server-rendered by default, including Shopify and WooCommerce. If a page requires JavaScript to display prices, CSS selector targeting will not work for that specific element, but full-page monitoring of the Shopify product feed will still capture price changes.",
  },
  {
    q: 'How far back can I see price history?',
    a: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
  },
  {
    q: 'How many competitor pages can I track?',
    a: 'Starter: 5 competitor monitors. Growth: 25. Scale: unlimited.',
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

export default function CompetitorPriceTrackingPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Price Tracking', path: '/competitor-price-tracking' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Price Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Competitor Price Tracking That Reads the Shopify Product Feed
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Every public Shopify store publishes its full product catalog, including prices. Beaconmon monitors that feed so you catch every price change across a competitor&apos;s entire catalog in one monitor, not one page at a time.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How competitor price tracking works with CSS selector monitoring</h2>
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
                How competitor price tracking works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up in minutes, no code required.
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
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
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
            Start tracking competitor prices today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

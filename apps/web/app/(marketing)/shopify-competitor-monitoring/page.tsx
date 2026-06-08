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
  title: 'Shopify Competitor Intelligence | Beaconmon',
  description:
    'Monitor competing Shopify stores across their full product feed. Track price drops, new product launches, and promo changes with AI-summarized diffs and a weekly Intelligence Digest.',
  alternates: { canonical: 'https://beaconmon.com/shopify-competitor-monitoring' },
};

const FEATURES = [
  {
    heading: 'Shopify product feed monitoring',
    body: 'Every public Shopify store exposes its product catalog at /products.json. Add a competitor domain once and Beaconmon watches the entire feed: new products, price changes, and availability updates without adding each page individually.',
  },
  {
    heading: 'CSS selector price targeting',
    body: 'For individual product pages, point Beaconmon at the exact price element. A change from $79 to $59 shows up as a clean diff, not a wall of HTML.',
  },
  {
    heading: 'AI-summarized change diffs',
    body: 'Growth plan and above: when a competitor page changes, Beaconmon generates a plain-English summary. Know whether it was a price cut, a new promo, or a product description update before you open the diff.',
  },
  {
    heading: 'Intelligence Digest',
    body: 'A daily or weekly digest consolidates all competitor activity into one Slack message or email. Every Shopify competitor move in one place, filtered to what actually matters.',
  },
];

const HOW_IT_WORKS = [
  "Paste a competitor's Shopify store domain and Beaconmon finds the public product feed automatically",
  'Add specific product or pricing page URLs for CSS selector-level price targeting',
  'Beaconmon checks on your chosen interval and records every change with a timestamped diff',
  'Get an instant Slack or email alert, or review all competitor moves in the weekly Intelligence Digest',
];

const FAQS = [
  {
    q: 'What is the Shopify product feed and how does Beaconmon use it?',
    a: "Every public Shopify store exposes a JSON product catalog at store.myshopify.com/products.json. Beaconmon monitors this endpoint to detect new product additions, price changes, and availability updates across the competitor's full catalog in a single monitor, without needing to add each product page individually.",
  },
  {
    q: 'How does Shopify competitor intelligence differ from simple price tracking?',
    a: "Price tracking monitors one data point per page. Shopify competitor intelligence covers the full picture: prices across the product catalog, promotions, new product launches, content changes, and homepage repositioning. You see everything moving, not just one listed price.",
  },
  {
    q: 'How often does Beaconmon check competitor pages?',
    a: 'Starter plan: every 60 seconds. Growth plan: every 60 seconds. Scale plan: every 30 seconds. Most teams set competitor monitors to a 5 to 15 minute interval to reduce noise.',
  },
  {
    q: 'Can I track multiple Shopify competitors at once?',
    a: 'Yes. Each competitor product feed or page URL is a separate monitor. Starter plan includes 5 competitor monitors. Growth plan includes 25. Scale plan is unlimited.',
  },
  {
    q: 'Will I get alerted for every small change?',
    a: "Growth plan and above: Beaconmon's AI noise filter classifies changes as significant or minor. A price drop or new product launch fires an alert. A whitespace change or analytics tag update does not.",
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
  { type: 'competitor', icon: '↓', label: '-$20 price drop', detail: 'CompetitorBrand / Air Pro X — $99 → $79', timeAgo: '8 min ago', bigText: true },
  { type: 'competitor', icon: '+', label: 'New product in feed', detail: 'CompetitorBrand added "Summer Bundle"', timeAgo: '2 hr ago' },
  { type: 'competitor', icon: '✎', label: 'Promo banner changed', detail: 'CompetitorBrand homepage sale copy updated', timeAgo: '4 hr ago' },
  { type: 'alert', icon: '⚡', label: 'Flash sale detected', detail: 'CompetitorBrand2 — site-wide 30% off applied', timeAgo: '6 hr ago' },
];

export default function ShopifyCompetitorMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Shopify Competitor Intelligence', path: '/shopify-competitor-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Shopify Competitor Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Shopify Competitor Intelligence:<br />
            <span className="text-brand-green-ink">Track the Full Product Feed, Not Just One Price</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Every public Shopify store exposes its product catalog. Beaconmon monitors that feed alongside individual product and pricing pages, so you catch price drops, new product launches, and promo changes across your entire competitor set.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Get alerts when competitors change prices, launch products, or update their site</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Price drops, new product launches, and promo changes across your Shopify competitor set.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 5, storeChanges: 24, storeChangesLabel: 'products tracked', smartAlerts: 3, smartAlertsLabel: 'price changes today' }}
              events={MOCKUP_EVENTS}
              slackNotification={{
                title: 'Price drop detected',
                body: 'CompetitorBrand cut Air Pro X by $20. Now $79.',
                timeAgo: '8 min ago',
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Intelligence that covers the full competitor picture</h2>
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
                Set up Shopify competitor intelligence in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                No code required. Add a Shopify store domain and Beaconmon handles the rest.
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
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
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
            Know every competitor move as it happens.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

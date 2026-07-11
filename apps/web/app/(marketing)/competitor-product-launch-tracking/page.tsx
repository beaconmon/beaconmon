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
  title: 'Competitor Product Launch Tracking for Shopify Stores | Beaconmon',
  description:
    'Know the moment a competitor adds a new product to their Shopify store. Beaconmon monitors the public product feed and fires a structured alert with product name, variants, and starting price as soon as a new product appears.',
  alternates: { canonical: 'https://beaconmon.com/competitor-product-launch-tracking' },
  openGraph: { url: 'https://beaconmon.com/competitor-product-launch-tracking' },
};

const FEATURES = [
  {
    heading: 'Shopify feed new-product detection',
    body: "Every public Shopify store exposes its product catalog at /products.json. Beaconmon polls this feed and compares each snapshot to the previous one. A new product handle triggers a structured event containing the product title, variants, and starting price, not a raw HTML diff.",
  },
  {
    heading: 'Full catalog coverage from one domain',
    body: "Add a competitor's Shopify domain once and Beaconmon catches every product launch across their entire catalog. No need to add individual product page URLs or check their store manually.",
  },
  {
    heading: 'AI-summarized launch events',
    body: 'Growth plan and above: when a new product appears in the feed, Beaconmon generates a plain-English summary. Know whether it is a new SKU, a bundle, or a full product line expansion before you open the diff.',
  },
  {
    heading: 'Weekly Competitor Report new-launch roll-up',
    body: 'New competitor product launches get their own section in the daily or weekly digest. Every launch across your tracked competitor set in one Slack message or email, filtered to what actually shipped.',
  },
];

const HOW_IT_WORKS = [
  "Paste a competitor's Shopify store domain and Beaconmon locates the public product feed automatically",
  'Beaconmon polls the feed on your chosen interval and compares each snapshot to the previous one',
  'A structured event fires when a new product handle appears, with title, variants, price, and a link to the live listing',
  'Get the alert in Slack or email, or review all competitor launches in the Weekly Competitor Report',
];

const FAQS = [
  {
    q: 'How does Beaconmon know when a competitor adds a new product?',
    a: "Every public Shopify store exposes its product catalog at /products.json. Beaconmon stores a snapshot of the feed after each check and compares product handles. A handle that wasn't in the previous snapshot triggers a new-product event.",
  },
  {
    q: 'What information does a new-product event include?',
    a: 'The event includes the product title, all variants (size, color, style), the starting price for each variant, and a direct link to the live product listing on the competitor store.',
  },
  {
    q: 'Does this work for WooCommerce or other platforms?',
    a: "WooCommerce and most other platforms don't expose a public product feed. For non-Shopify competitors, add individual product or category pages as HTML content monitors. You won't get structured new-product events, but you will see when a page changes.",
  },
  {
    q: 'Can I track only new product launches and ignore price changes?',
    a: 'The Shopify feed monitor captures all feed changes, including price updates and availability flips, in addition to new products. You can filter the Weekly Competitor Report to show only new-product events, or create a dedicated monitor focused on the feed.',
  },
  {
    q: 'How many competitors can I track for product launches?',
    a: 'Starter plan: 5 competitor monitors. Growth plan: 25. Scale plan: unlimited. Each Shopify domain you add counts as one monitor.',
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
  { type: 'competitor', icon: '+', label: 'New product in feed', detail: 'CompetitorBrand added "Trail Runner Pro 2" at $149', timeAgo: '14 min ago', bigText: true },
  { type: 'competitor', icon: '+', label: 'New product in feed', detail: 'CompetitorBrand added "Carbon Insole" at $39', timeAgo: '2 hr ago' },
  { type: 'competitor', icon: '+', label: '3 new variants added', detail: 'CompetitorBrand2 expanded "Summit Pack" with 3 new colors', timeAgo: '5 hr ago' },
  { type: 'alert', icon: '!', label: 'Launch cluster detected', detail: 'CompetitorBrand added 4 products in 24 hrs', timeAgo: '1 day ago' },
];

export default function CompetitorProductLaunchTrackingPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Product Launch Tracking', path: '/competitor-product-launch-tracking' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Product Launch Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Know the Moment a Competitor Adds a New Product to Their Shopify Store
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Every public Shopify store publishes its full product catalog. Beaconmon monitors that feed and fires a structured alert with product name, variants, and starting price the moment a new product appears, covering the full catalog from one domain.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Competitor mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Get alerted when competitors launch new products</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Structured new-product events from the Shopify feed, with title, variants, and price.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 4, storeChanges: 12, storeChangesLabel: 'products tracked', smartAlerts: 2, smartAlertsLabel: 'new launches today' }}
              events={MOCKUP_EVENTS}
              slackNotification={{
                title: 'New product detected',
                body: 'CompetitorBrand added Trail Runner Pro 2 at $149.',
                timeAgo: '14 min ago',
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Structured launch data, not page noise</h2>
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
                Set up competitor product launch tracking in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Add one Shopify domain. Beaconmon finds the feed and starts watching.
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
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/competitor-stock-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor stock monitoring</Link>
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
            Never miss a competitor product launch.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

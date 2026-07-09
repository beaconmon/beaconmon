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
  title: 'WooCommerce Competitor Monitoring | Beaconmon',
  description:
    'Monitor WooCommerce competitor prices, promotions, and content changes. CSS selector targeting on individual product and pricing pages, with Slack alerts and an Intelligence Digest. No product feed available; pages are added individually.',
  alternates: { canonical: 'https://beaconmon.com/woocommerce-competitor-monitoring' },
  openGraph: { url: 'https://beaconmon.com/woocommerce-competitor-monitoring' },
};

const FEATURES = [
  {
    heading: 'CSS selector price targeting',
    body: 'WooCommerce product pages render prices in a predictable element: .woocommerce-Price-amount. Point Beaconmon at that selector and a price change from $79 to $59 shows up as a clean diff, not a wall of HTML noise.',
  },
  {
    heading: 'Page-by-page monitoring',
    body: "WooCommerce doesn't expose a public product feed like Shopify's /products.json. Beaconmon monitors individual product pages, pricing pages, and category pages. Add the URLs you care about most and set the check interval that fits your tracking needs.",
  },
  {
    heading: 'Homepage and promotion page tracking',
    body: "Add a WooCommerce competitor's homepage and key sale pages as content monitors. When they update a promotional banner, change their hero copy, or add a site-wide sale notice, Beaconmon captures the diff.",
  },
  {
    heading: 'Intelligence Digest',
    body: 'All WooCommerce competitor activity rolls up into the same daily or weekly digest alongside any Shopify competitors you track. Every change across your full competitor set in one Slack message or email.',
  },
];

const HOW_IT_WORKS = [
  "Add a WooCommerce competitor's product or pricing page URL as a content monitor",
  'Optionally enter the CSS selector for the price element to get a clean price-only diff',
  'Set your check interval (5 to 15 minutes is typical for competitor pages)',
  'Get instant Slack or email alerts when any monitored page changes, or review diffs in the dashboard',
];

const FAQS = [
  {
    q: 'Does WooCommerce have a product feed like Shopify?',
    a: "WooCommerce does not expose a public product feed by default. Shopify stores publish their full catalog at /products.json, which lets Beaconmon monitor the entire store from one domain. For WooCommerce competitors, you add individual product and pricing page URLs instead.",
  },
  {
    q: 'How do I track prices on a WooCommerce competitor site?',
    a: "Add the product or pricing page URL as a content monitor and enter the CSS selector .woocommerce-Price-amount (or the specific element on that page). Beaconmon extracts just the text inside that element, so a price change from $49 to $39 shows as a precise diff.",
  },
  {
    q: 'Does Beaconmon handle JavaScript-rendered prices?',
    a: "Beaconmon uses HTML-only parsing. Most WooCommerce pricing elements are server-rendered by default, so CSS selector targeting works reliably. If a specific page loads prices via JavaScript after the initial HTML, that element won't be captured.",
  },
  {
    q: 'How many WooCommerce competitor pages can I track?',
    a: 'Starter plan: 5 competitor monitors. Growth plan: 25. Scale plan: unlimited. Each page URL you add counts as one monitor. A typical WooCommerce competitor setup covers 3 to 5 pages: homepage, main pricing or shop page, and 1 to 3 key product pages.',
  },
  {
    q: 'Can I also monitor my own WooCommerce store?',
    a: 'Yes. Beaconmon monitors both your own store and competitors in the same dashboard. For your own WooCommerce store, see the WooCommerce monitoring guide for recommended monitor configurations covering your shop page, checkout, and admin health.',
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
  { type: 'competitor', icon: '↓', label: 'Price drop detected', detail: 'CompetitorBrand / Everyday Tee: $59 changed to $39', timeAgo: '11 min ago', bigText: true },
  { type: 'competitor', icon: '✎', label: 'Sale banner appeared', detail: 'CompetitorBrand homepage: "20% off sitewide" text added', timeAgo: '1 hr ago' },
  { type: 'competitor', icon: '✎', label: 'Pricing page updated', detail: 'CompetitorBrand2 changed their pricing table copy', timeAgo: '4 hr ago' },
  { type: 'alert', icon: '!', label: 'Multiple changes in 24 hrs', detail: 'CompetitorBrand: 3 pages changed since yesterday', timeAgo: '1 day ago' },
];

export default function WooCommerceCompetitorMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'WooCommerce Competitor Monitoring', path: '/woocommerce-competitor-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">WooCommerce Competitor Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Monitor WooCommerce Competitor Prices, Promotions, and Content Changes
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            WooCommerce stores don&apos;t expose a public product feed, so Beaconmon monitors individual pages with CSS selector targeting. Add the product pages and pricing pages that matter most. Get clean price diffs and content change alerts without parsing unrelated HTML noise.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Competitor price drops and content changes, in one feed</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">CSS selector-targeted price diffs and page content changes across your WooCommerce competitor set.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.com"
              stats={{ competitorMoves: 3, storeChanges: 8, storeChangesLabel: 'pages tracked', smartAlerts: 1, smartAlertsLabel: 'price change today' }}
              events={MOCKUP_EVENTS}
              slackNotification={{
                title: 'Price drop detected',
                body: 'CompetitorBrand Everyday Tee dropped from $59 to $39.',
                timeAgo: '11 min ago',
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Page-level monitoring built for WooCommerce</h2>
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
                How to set up WooCommerce competitor monitoring
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Add pages individually. CSS selectors keep the diffs clean. No code required.
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/for/woocommerce" className="text-brand-dim hover:text-brand-text transition-colors">WooCommerce store monitoring</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor promotion monitoring</Link>
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
            Stay ahead of WooCommerce competitors.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

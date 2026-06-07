import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Promotion Monitoring for Ecommerce | Beaconmon',
  description:
    'Detect competitor promotions using two signals: Shopify feed price drops and HTML banner content changes. Catches server-rendered sale notices and feed-level discounts. JavaScript-injected promotions and countdown timers are outside scope.',
  alternates: { canonical: 'https://beaconmon.com/competitor-promotion-monitoring' },
};

const FEATURES = [
  {
    heading: 'Shopify feed price-drop signals',
    body: 'When a Shopify competitor reduces a product price in their feed, Beaconmon flags it as a potential promotion. The event includes which products were discounted and by how much, from the structured feed data, not HTML inference.',
  },
  {
    heading: 'Homepage and sale banner monitoring',
    body: 'Add a competitor homepage or sale page as an HTML content monitor. When server-rendered sale copy appears, a promo banner is added, or a sitewide discount notice is baked into the page, Beaconmon captures the diff.',
  },
  {
    heading: 'Intelligence Digest promotion roll-up',
    body: "Feed price-drop signals and HTML content changes appear together in the weekly digest. You can see whether a competitor's moves look like a coordinated promotional push or a one-off product adjustment.",
  },
  {
    heading: 'What Beaconmon does not detect',
    body: 'Beaconmon uses HTML-only parsing. Promotions delivered via JavaScript after page load, countdown widgets, client-side personalization, and dynamically injected banners are outside what Beaconmon can read. If a sale banner requires JavaScript to render, it will not appear in the diff.',
  },
];

const HOW_IT_WORKS = [
  "Add a competitor's Shopify domain for feed-level price-drop detection across their full product catalog",
  "Add their homepage and key promo pages (e.g. /sale, /collections/sale) as separate HTML content monitors",
  'Beaconmon detects feed price drops and HTML content changes independently on each check',
  'Review both signal types in the dashboard or get them consolidated in the Intelligence Digest',
];

const FAQS = [
  {
    q: 'How does Beaconmon detect a competitor promotion?',
    a: "Beaconmon uses two signals. First, Shopify feed monitoring: when a product price drops in the /products.json feed, that is a direct structured signal of a potential promotion. Second, HTML content monitoring: when a competitor's homepage or sale page HTML changes, the diff may show a new banner, updated promo copy, or a modified call to action.",
  },
  {
    q: 'Can Beaconmon detect flash sales or limited-time countdown timers?',
    a: "If the countdown timer or flash sale notice is rendered in the initial page HTML, Beaconmon will capture it. If it is injected by JavaScript after page load, Beaconmon will not see it. Most Shopify theme sale banners are server-rendered, but some third-party promotion apps inject content client-side.",
  },
  {
    q: 'Does Beaconmon read JavaScript-injected sale banners?',
    a: "No. Beaconmon uses HTML-only parsing and does not execute JavaScript. It reads what is in the server-rendered HTML response. If a sale banner or promotional overlay is added via a JavaScript app or tag, it will not appear in the diff.",
  },
  {
    q: "What if a competitor's promotion is only in their Shopify feed, not on the homepage?",
    a: "Feed-level price drops are captured independently of page content. If a competitor marks down 20 products in their catalog without updating their homepage copy, the Shopify feed monitor will still surface those price changes as individual events.",
  },
  {
    q: 'How is promotion monitoring different from price tracking?',
    a: "Price tracking targets a single number: the listed price. Promotion monitoring looks at both price changes across the catalog (via the Shopify feed) and the surrounding context (via page HTML), such as sale banners, promotional copy, and page layout changes that signal a broader promotional push.",
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

export default function CompetitorPromotionMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Promotion Monitoring', path: '/competitor-promotion-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Promotion Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Detect Competitor Promotions: Feed Price Drops and HTML Banner Changes
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Beaconmon combines two signals: Shopify feed price drops and HTML content monitoring on competitor pages. It catches server-rendered sale banners and feed-level discounts. JavaScript-injected overlays and countdown widgets are outside scope. Here is what you can actually expect.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Two signals, honest about what each covers</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div
                key={heading}
                className={`reveal bg-brand-bg1 border rounded-2xl p-8 ${
                  heading === 'What Beaconmon does not detect'
                    ? 'border-brand-line-soft opacity-80'
                    : 'border-brand-line-soft'
                }`}
              >
                <h3
                  className={`text-[18px] font-bold tracking-[-0.015em] mb-3 ${
                    heading === 'What Beaconmon does not detect'
                      ? 'text-brand-muted'
                      : 'text-brand-green-ink'
                  }`}
                >
                  {heading}
                </h3>
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
                How to set up competitor promotion monitoring
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Feed monitor plus a few HTML monitors covers the most useful signals.
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/woocommerce-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">WooCommerce competitor monitoring</Link>
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
            Catch competitor promotions before your customers do.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

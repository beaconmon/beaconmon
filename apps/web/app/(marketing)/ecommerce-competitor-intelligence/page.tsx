import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecommerce Competitor Intelligence | Beaconmon',
  description:
    'Track every price change, promotion launch, and site update across your competitor set. CSS selector targeting, AI digest, and multi-competitor dashboards for ecommerce teams.',
  alternates: { canonical: 'https://beaconmon.com/ecommerce-competitor-intelligence' },
};

const FEATURES = [
  {
    heading: 'Full-page and element-level tracking',
    body: 'Monitor an entire competitor homepage or target a single CSS selector. Track just the price, the shipping threshold, or the promo banner copy. The granularity is yours to decide.',
  },
  {
    heading: 'Before-and-after diff history',
    body: 'Every change is stored with a before-and-after diff. Browse 30, 90, or 365 days of competitor history per page. See not just what changed, but exactly what it changed from and to.',
  },
  {
    heading: 'AI significance filtering',
    body: 'Growth plan and above: Beaconmon classifies changes as significant or cosmetic before alerting. A price drop or new promo fires an alert. A whitespace change or analytics tag update does not.',
  },
  {
    heading: 'Multi-competitor dashboard',
    body: 'All tracked competitors in one view. Sort by most recently changed, filter by monitor type, and drill into per-page diffs without switching between tabs.',
  },
  {
    heading: 'Slack, email, and webhook alerts',
    body: 'Route competitor change alerts to the channels your team already uses. Configure per-monitor alert channels so pricing changes go to the pricing team and promo changes go to marketing.',
  },
  {
    heading: 'Intelligence Digest',
    body: 'Opt into a daily or weekly digest that consolidates all competitor activity into one structured summary. Ideal for teams who want a briefing rather than a real-time stream of alerts.',
  },
];

const HOW_IT_WORKS = [
  'Add competitor URLs as content monitors: pricing pages, product listings, homepage, or any page you want to track',
  'Optionally enter a CSS selector to target a specific element like a price or promo banner',
  'Beaconmon checks at your chosen interval and records every change with a timestamped diff',
  'Get instant alerts for significant changes, or review the weekly Intelligence Digest in Slack',
];

const SIGNALS = [
  { label: 'Price changes', detail: 'Catch price drops and increases the moment they happen' },
  { label: 'Promotion launches', detail: 'Detect new sale banners, coupon code reveals, and free shipping thresholds' },
  { label: 'Product availability', detail: 'Track sold-out or back-in-stock status on key competitor SKUs' },
  { label: 'Shipping policy changes', detail: 'Know when a competitor raises or lowers their free shipping minimum' },
  { label: 'Homepage copy rewrites', detail: 'See when a competitor repositions their value proposition or headline offer' },
  { label: 'New product additions', detail: 'Monitor category pages for newly listed products' },
];

const FAQS = [
  {
    q: 'What competitor changes does Beaconmon detect?',
    a: 'Beaconmon detects any text or content change on a competitor page: price updates, promotion launches, shipping policy changes, new product additions, homepage copy rewrites, and more. You choose which pages to monitor and how specific to make the targeting.',
  },
  {
    q: 'How is competitor intelligence different from simple price tracking?',
    a: 'Price tracking monitors one data point. Competitor intelligence covers the full picture: prices, promotions, product availability, shipping offers, and site-wide content shifts. Beaconmon lets you monitor any element on any page, so you see everything changing across your competitor set, not just listed prices.',
  },
  {
    q: 'How often does Beaconmon check competitor pages?',
    a: 'Free plan: every 5 minutes. Starter plan: every 1 minute. Growth plan: every 1 minute. Scale plan: every 30 seconds. For competitors running flash sales or limited-time promotions, faster check intervals mean you catch changes before they drive significant volume.',
  },
  {
    q: 'Does Beaconmon work on JavaScript-rendered competitor sites?',
    a: 'Beaconmon uses HTML-only parsing. Most ecommerce storefronts are server-rendered by default, including Shopify and WooCommerce stores. If a competitor page requires JavaScript to display content, full-page monitoring will still work but CSS selector targeting may not capture dynamically injected elements.',
  },
  {
    q: 'How many competitors can I track?',
    a: 'Starter: up to 5 content monitors. Growth: up to 25. Scale: unlimited. Each competitor page (pricing, product listing, homepage) counts as one monitor.',
  },
  {
    q: 'Can I get a weekly summary instead of individual alerts?',
    a: 'Yes. Growth plan and above includes the Intelligence Digest: a daily or weekly summary of all competitor activity, filtered by significance. Instead of a Slack ping for every minor CSS update, you get one consolidated view of what actually changed.',
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

export default function EcommerceCompetitorIntelligencePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Ecommerce Competitor Intelligence', path: '/ecommerce-competitor-intelligence' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Competitor Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Ecommerce Competitor Intelligence That Goes Beyond Price Tracking
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Monitor every price change, promotion launch, and content update across your entire competitor set. CSS selector targeting, AI-filtered alerts, and a weekly Intelligence Digest for ecommerce teams.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* What you can track */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Every signal that matters to your business</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Beaconmon tracks any change on any public competitor page, not just the price on the product listing.</p>
          </div>
          <div className="reveal grid grid-cols-3 max-[880px]:grid-cols-2 max-[560px]:grid-cols-1 gap-4 max-w-[900px] mx-auto">
            {SIGNALS.map(({ label, detail }) => (
              <div key={label} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <p className="text-[15px] font-bold tracking-[-0.01em] mb-1 text-brand-green-ink">{label}</p>
                <p className="text-brand-dim text-[13px] leading-[1.6]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything your team needs to stay ahead</h2>
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
                Set up competitor intelligence in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                No code required. Add a URL, choose what to watch, and Beaconmon handles the rest.
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/pricing-change-alerts" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection</Link>
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
            Start tracking your competitors today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

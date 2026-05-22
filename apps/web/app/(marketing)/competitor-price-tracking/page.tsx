import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Price Tracking for Ecommerce | Beaconmon',
  description: 'Track competitor prices with CSS selector targeting, change history, AI noise filtering, and daily digest. No code required.',
  alternates: { canonical: 'https://beaconmon.com/competitor-price-tracking' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How accurate is CSS selector-based price tracking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "If the competitor's site is server-rendered, CSS selector targeting is highly accurate. Beaconmon extracts just the text inside the targeted element, so a price change from $49 to $39 shows up as a clear diff.",
      },
    },
    {
      '@type': 'Question',
      name: "What if the competitor's site is JavaScript-rendered?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon uses HTML-only parsing. Most ecommerce pricing pages are server-rendered by default. If a page requires JavaScript to display prices, CSS selector targeting will not work for that specific element.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far back can I see price history?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track prices on Amazon or other marketplaces?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon monitors any public URL with a stable HTML structure. Marketplace pages often have dynamic content or bot detection, so results vary. It works best on direct competitor brand sites.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many competitor pages can I track?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Starter: 5 competitor monitors. Growth: 25. Scale: unlimited.',
      },
    },
  ],
};

const FEATURES = [
  {
    heading: 'CSS selector targeting',
    body: 'Point Beaconmon at any element on a competitor page. Track just the price, the shipping cost, or the full pricing table. You control the precision of the alert.',
  },
  {
    heading: 'Per-page change history',
    body: 'Every change is logged with a before-and-after diff. Go back through 30, 90, or 365 days of price history depending on your plan.',
  },
  {
    heading: 'AI noise filtering',
    body: 'Growth plan and above: Beaconmon classifies changes as significant or cosmetic. A price change triggers an alert. A footer link update does not.',
  },
  {
    heading: 'Daily and weekly digest',
    body: 'Instead of an alert for every small change, opt in to a daily or weekly Intelligence Digest that consolidates all competitor activity into one clean summary.',
  },
];

const HOW_IT_WORKS = [
  'Add a competitor pricing page URL to Beaconmon as a content monitor',
  'Enter the CSS selector for the price element, or leave it blank to track the full page',
  'Beaconmon checks at your chosen interval and records every change',
  'Review the diff history in the dashboard, or get alerts in Slack and email',
];

const FAQS = [
  {
    q: 'How accurate is CSS selector-based price tracking?',
    a: "If the competitor's site is server-rendered, CSS selector targeting is highly accurate. Beaconmon extracts just the text inside the targeted element, so a price change from $49 to $39 shows up as a clear diff.",
  },
  {
    q: "What if the competitor's site is JavaScript-rendered?",
    a: 'Beaconmon uses HTML-only parsing. Most ecommerce pricing pages are server-rendered by default. If a page requires JavaScript to display prices, CSS selector targeting will not work for that specific element.',
  },
  {
    q: 'How far back can I see price history?',
    a: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
  },
  {
    q: 'Can I track prices on Amazon or other marketplaces?',
    a: 'Beaconmon monitors any public URL with a stable HTML structure. Marketplace pages often have dynamic content or bot detection, so results vary. It works best on direct competitor brand sites.',
  },
  {
    q: 'How many competitor pages can I track?',
    a: 'Starter: 5 competitor monitors. Growth: 25. Scale: unlimited.',
  },
];

export default function CompetitorPriceTrackingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
            Competitor Price Tracking for Ecommerce Stores
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Target a CSS selector on any competitor pricing page. Get alerted the instant the price changes, or review the full change history in a weekly digest.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Precise, actionable price intelligence</h2>
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
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/pricing-change-alerts" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
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

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Competitor Monitoring | Beaconmon',
  description: 'Track when Shopify competitors change prices, run promotions, or update product pages. Real-time content change alerts with AI-summarized diffs.',
  alternates: { canonical: 'https://beaconmon.com/shopify-competitor-monitoring' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Shopify competitor monitoring work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon fetches the competitor\'s page HTML at regular intervals and compares it to the previous snapshot using a CSS selector you specify. When the content inside that selector changes, you get an alert. No JavaScript rendering is required for most pricing and product pages.',
      },
    },
    {
      '@type': 'Question',
      name: 'How often does Beaconmon check competitor pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Starter plan: every 60 seconds. Growth plan: every 60 seconds. Scale plan: every 30 seconds. For competitor pages, most teams use a 5 to 15 minute interval to reduce noise.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track multiple competitors at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Each competitor URL is a separate content monitor. Starter plan includes 5 competitor monitors. Growth plan includes 25. Scale plan is unlimited.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does competitor monitoring work on JavaScript-rendered pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon uses HTML-only parsing, so it works on server-rendered pages. Most Shopify store pricing and product pages are server-rendered and work without JavaScript.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will I get alerted for every small change?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Growth plan and above: Beaconmon's AI noise filter classifies changes as significant or minor. Noise-classified changes are logged in the diff history but do not trigger an alert.",
      },
    },
  ],
};

const FEATURES = [
  {
    heading: 'Real-time content change alerts',
    body: 'Beaconmon monitors competitor product and pricing pages using CSS selectors. The moment a price changes or a new promotion appears, you get an alert before your customers see it.',
  },
  {
    heading: 'AI-summarized change diffs',
    body: 'Growth plan and above: when a competitor page changes, Beaconmon generates a plain-English summary of what changed. No more reading side-by-side HTML diffs.',
  },
  {
    heading: 'Intelligence Digest email',
    body: 'A daily or weekly digest consolidates all competitor changes into one email or Slack message. No alert fatigue, just a clean summary every morning.',
  },
  {
    heading: 'Slack and email alerts',
    body: 'Competitor move alerts go to email, Slack, or any webhook endpoint. Wire it to your #ecommerce channel and the whole team stays informed.',
  },
];

const HOW_IT_WORKS = [
  'Add a competitor product or pricing URL as a content monitor in Beaconmon',
  'Choose the CSS selector that targets the price, or monitor the full page body',
  'Beaconmon checks the page on your chosen interval and detects any HTML changes',
  'Get an instant alert with a diff showing exactly what changed',
];

const FAQS = [
  {
    q: 'How does Shopify competitor monitoring work?',
    a: "Beaconmon fetches the competitor's page HTML at regular intervals and compares it to the previous snapshot using a CSS selector you specify. When the content inside that selector changes, you get an alert. No JavaScript rendering is required for most pricing and product pages.",
  },
  {
    q: 'How often does Beaconmon check competitor pages?',
    a: 'Starter plan: every 60 seconds. Growth plan: every 60 seconds. Scale plan: every 30 seconds. For competitor pages, most teams use a 5 to 15 minute interval to reduce noise.',
  },
  {
    q: 'Can I track multiple competitors at once?',
    a: 'Yes. Each competitor URL is a separate content monitor. Starter plan includes 5 competitor monitors. Growth plan includes 25. Scale plan is unlimited.',
  },
  {
    q: 'Does competitor monitoring work on JavaScript-rendered pages?',
    a: 'Beaconmon uses HTML-only parsing, so it works on server-rendered pages. Most Shopify store pricing and product pages are server-rendered and work without JavaScript.',
  },
  {
    q: 'Will I get alerted for every small change?',
    a: "Growth plan and above: Beaconmon's AI noise filter classifies changes as significant or minor. Noise-classified changes are logged in the diff history but do not trigger an alert.",
  },
];

export default function ShopifyCompetitorMonitoringPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JsonLd data={breadcrumbSchema({ name: 'Shopify Competitor Monitoring', path: '/shopify-competitor-monitoring' })} />
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
            Shopify Competitor Monitoring: Know Every Price Drop Before Your Customers Do
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Track when competitors change prices, launch promotions, or update product pages. Real-time content alerts with AI-summarized diffs and a weekly Intelligence Digest in Slack.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything you need to track competitors</h2>
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
                How Shopify competitor monitoring works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up a content monitor on any competitor URL and Beaconmon handles the rest.
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

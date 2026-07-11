import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Change Alerts for Ecommerce | Beaconmon',
  description: 'Get notified the moment a competitor changes their price. Weekly Competitor Report, Slack and email delivery, snapshot history, and diff view.',
  alternates: { canonical: 'https://beaconmon.com/pricing-change-alerts' },
  openGraph: { url: 'https://beaconmon.com/pricing-change-alerts' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How fast does Beaconmon detect a pricing change?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On a 1-minute check interval, a pricing change is detected within 60 seconds of it appearing on the page. Most teams use a 5 to 15 minute interval for competitor pages to reduce noise.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get alerts in Slack?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Connect Beaconmon to any Slack channel with incoming webhooks. Pricing change alerts include a link to the diff view so you can see exactly what changed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the diff view show?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The diff view shows a side-by-side or unified diff of the HTML content before and after the change. For a price change, you see the old price crossed out and the new price highlighted.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Beaconmon support webhook delivery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Any alert channel can be configured as a generic webhook. Send pricing change events to your internal systems, Zapier, Make, or any HTTP endpoint.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I pause alerts for a specific competitor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Each monitor can be paused individually from the dashboard. Pausing stops alerts and checks without deleting the monitor or its history.',
      },
    },
  ],
};

const FEATURES = [
  {
    heading: 'Weekly Competitor Report',
    body: 'Consolidate all competitor pricing changes into one daily or weekly Slack or email digest. Stay informed without alert fatigue.',
  },
  {
    heading: 'Slack, email, and webhook delivery',
    body: 'Alerts go wherever your team already works. Send pricing change notifications to a dedicated #pricing-intel Slack channel, your email, or any webhook.',
  },
  {
    heading: 'Content snapshot history',
    body: "Every version of a competitor pricing page is stored with a timestamp. Compare any two snapshots side by side to see exactly what changed and when.",
  },
  {
    heading: 'Visual diff view',
    body: 'Beaconmon shows a colored diff of what was added or removed on the page. See the price that changed, the plan that was renamed, and the feature that was added.',
  },
];

const HOW_IT_WORKS = [
  'Add a competitor pricing page as a content monitor',
  'Set the CSS selector for the price element or monitor the full page',
  'Beaconmon detects any change and sends an alert within minutes',
  'Review the snapshot history and diff view in the dashboard at any time',
];

const FAQS = [
  {
    q: 'How fast does Beaconmon detect a pricing change?',
    a: 'On a 1-minute check interval, a pricing change is detected within 60 seconds of it appearing on the page. Most teams use a 5 to 15 minute interval for competitor pages to reduce noise.',
  },
  {
    q: 'Can I get alerts in Slack?',
    a: 'Yes. Connect Beaconmon to any Slack channel with incoming webhooks. Pricing change alerts include a link to the diff view so you can see exactly what changed.',
  },
  {
    q: 'What does the diff view show?',
    a: 'The diff view shows a side-by-side or unified diff of the HTML content before and after the change. For a price change, you see the old price crossed out and the new price highlighted.',
  },
  {
    q: 'Does Beaconmon support webhook delivery?',
    a: 'Yes. Any alert channel can be configured as a generic webhook. Send pricing change events to your internal systems, Zapier, Make, or any HTTP endpoint.',
  },
  {
    q: 'Can I pause alerts for a specific competitor?',
    a: 'Yes. Each monitor can be paused individually from the dashboard. Pausing stops alerts and checks without deleting the monitor or its history.',
  },
];

export default function PricingChangeAlertsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JsonLd data={breadcrumbSchema({ name: 'Pricing Change Alerts', path: '/pricing-change-alerts' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Pricing Alerts</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Pricing Change Alerts: Get Notified the Moment a Competitor Changes Their Price
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Set up a content monitor on any competitor pricing page. When the price changes, Beaconmon fires an alert to Slack, email, or your webhook within minutes.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything you need to stay ahead on pricing</h2>
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
                How pricing change alerts work
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up in minutes. Alerts arrive before your customers notice the change.
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
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
            React to every competitor pricing move instantly.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

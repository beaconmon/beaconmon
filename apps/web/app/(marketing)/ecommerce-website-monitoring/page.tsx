import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecommerce Website Monitoring | Beaconmon',
  description: 'Catch checkout downtime in under 60 seconds. 30-second checks, keyword monitoring for checkout, multi-location, and smart anomaly alerts.',
  alternates: { canonical: 'https://beaconmon.com/ecommerce-website-monitoring' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How quickly does Beaconmon detect ecommerce downtime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On the Scale plan with 30-second checks, a downtime event is detected within 30 seconds and an alert is sent after 2 consecutive failed checks, so within 60 seconds of the start of an outage.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is keyword monitoring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keyword monitoring checks that a specific word or phrase is present in the HTTP response body. For ecommerce, you use it to confirm that "Add to Cart" is on a product page or "Place order" is on the checkout, even if the server returns 200 OK.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is multi-location monitoring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon sends checks from up to 5 geographic regions simultaneously. If your server is slow in Europe but fast in the US, you see exactly which region is affected, not a global false alarm.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Beaconmon monitor Shopify stores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Beaconmon monitors any HTTP endpoint, including Shopify storefronts, custom stores, WooCommerce, Magento, and headless ecommerce setups.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when a monitor goes down?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon creates an incident, sends alerts to all configured channels, and logs the start time. When the monitor recovers, it sends a recovery alert and records the total downtime duration.',
      },
    },
  ],
};

const FEATURES = [
  {
    heading: '30-second checks',
    body: 'Scale plan checks every page in your funnel every 30 seconds. A checkout failure is detected and alerted within a minute, before more than a handful of customers encounter it.',
  },
  {
    heading: 'Keyword monitoring for checkout',
    body: 'A 200 OK does not mean your checkout is working. Keyword monitoring verifies that "Add to Cart" is on your product page and "Place order" is on your checkout. Catch broken deploys in seconds.',
  },
  {
    heading: 'Multi-location checks',
    body: 'Growth and Scale plans check from 5 regions simultaneously. A slow response from one region while others are fast is flagged as a localized issue, not a false global outage.',
  },
  {
    heading: 'Smart anomaly alerts',
    body: 'Growth and Scale: Beaconmon learns your store\'s normal response time baseline and alerts you when a page is significantly slower than usual, even if it has not gone down.',
  },
];

const HOW_IT_WORKS = [
  'Add your homepage, product page, cart, and checkout as separate HTTP monitors',
  'Enable keyword checks on your cart and checkout to verify critical content',
  'Set alert channels: email, Slack, or webhook',
  'Beaconmon monitors every 30 seconds and alerts your team the moment a check fails',
];

const FAQS = [
  {
    q: 'How quickly does Beaconmon detect ecommerce downtime?',
    a: 'On the Scale plan with 30-second checks, a downtime event is detected within 30 seconds and an alert is sent after 2 consecutive failed checks, so within 60 seconds of the start of an outage.',
  },
  {
    q: 'What is keyword monitoring?',
    a: 'Keyword monitoring checks that a specific word or phrase is present in the HTTP response body. For ecommerce, you use it to confirm that "Add to Cart" is on a product page or "Place order" is on the checkout, even if the server returns 200 OK.',
  },
  {
    q: 'What is multi-location monitoring?',
    a: 'Beaconmon sends checks from up to 5 geographic regions simultaneously. If your server is slow in Europe but fast in the US, you see exactly which region is affected, not a global false alarm.',
  },
  {
    q: 'Does Beaconmon monitor Shopify stores?',
    a: 'Yes. Beaconmon monitors any HTTP endpoint, including Shopify storefronts, custom stores, WooCommerce, Magento, and headless ecommerce setups.',
  },
  {
    q: 'What happens when a monitor goes down?',
    a: 'Beaconmon creates an incident, sends alerts to all configured channels, and logs the start time. When the monitor recovers, it sends a recovery alert and records the total downtime duration.',
  },
];

export default function EcommerceWebsiteMonitoringPage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Ecommerce Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Ecommerce Website Monitoring: Catch Checkout Downtime in Under 60 Seconds
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            30-second checks on your homepage, product pages, and checkout. Keyword monitoring confirms critical content is loading. Multi-location checks eliminate false positives.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for stores that cannot afford downtime</h2>
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
                How ecommerce monitoring works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Monitor every page in your funnel as a separate check. Know exactly which part broke.
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
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection</Link>
            <Link href="/homepage-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Homepage monitoring</Link>
            <Link href="/for/ecommerce" className="text-brand-dim hover:text-brand-text transition-colors">E-commerce monitoring</Link>
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
            Start monitoring your ecommerce store in 5 minutes.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

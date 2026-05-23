import NavBar from '@/components/marketing/NavBar';
import { PRICING } from '@/lib/pricing';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store and Checkout Monitoring for E-commerce | Beaconmon',
  description: 'Monitor your Shopify, WooCommerce, or custom store for outages, checkout failures, pricing changes, and competitor updates. Free for 10 monitors, no card required.',
  alternates: { canonical: 'https://beaconmon.com/for/ecommerce' },
};

const FEATURES = [
  {
    heading: '30-second checks around the clock',
    body: 'Your store never sleeps, and neither does Beaconmon. Checks run every 30 seconds on the Scale plan, and every minute on Starter and Growth. A failed checkout at 3am is caught within a minute, not three hours later when you wake up.',
  },
  {
    heading: 'Keyword monitoring for critical pages',
    body: 'A 200 OK response doesn\'t mean your checkout is working. Keyword monitoring verifies the right content is present: "Add to cart" on your product page and the checkout form on the cart page, so broken deploys are caught in seconds.',
  },
  {
    heading: 'Heartbeat monitoring for your order jobs',
    body: 'Your cron jobs process orders, update inventory, and send receipts. If one stops running, you need to know. Heartbeat monitoring alerts you when a scheduled task misses its window.',
  },
  {
    heading: 'Instant alerts to the whole team',
    body: 'When a checkout page goes down, you want everyone to know at once. Beaconmon fires to email, Slack, or webhook simultaneously. No one has to forward the alert.',
  },
  {
    heading: 'Competitor price and content tracking',
    body: 'Add competitor product pages alongside your own monitors. Get alerted the moment a competitor changes their pricing, runs a promotion, or updates their homepage. Know before your customers notice.',
  },
];

const COST_OF_DOWNTIME = [
  { metric: 'Average cart abandonment on slow pages', value: '53%' },
  { metric: 'Typical conversion drop during checkout errors', value: '100%' },
  { metric: 'Average time before owner discovers self-detected outage', value: '>2 hrs' },
  { metric: 'Beaconmon alert time after confirmed failure', value: '<60 sec' },
];

const HOW_IT_HELPS = [
  'Catch checkout downtime in under 60 seconds, before you lose more than one abandoned cart.',
  'Verify critical page content is loading correctly, not just that the server is responding.',
  'Alert your developer, store manager, and customer support simultaneously the moment something breaks.',
  'Monitor Shopify, WooCommerce, Magento, custom-built stores, or any combination.',
];

export default function ForEcommercePage() {
  return (
    <>
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For E-commerce</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Every minute of checkout downtime is a sale you&apos;ll never recover.<br />
            <span className="text-brand-green-ink">Beaconmon keeps that minute under 60 seconds.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            30-second checks on your store, instant alerts when checkout breaks, and keyword monitoring to catch bad deploys before customers do.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Platform selector */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-8">
            <h2 className="text-[clamp(22px,2.8vw,32px)] tracking-[-0.03em] font-extrabold mb-2">Choose your platform</h2>
            <p className="text-brand-dim text-[15px]">Platform-specific setup guides and monitor templates.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[640px] mx-auto">
            <Link href="/for/shopify" className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 hover:border-brand-green-ink transition-colors group">
              <div className="mb-4 w-10 h-10">
                <Image src="/shopify.svg" alt="Shopify" width={40} height={40} />
              </div>
              <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 group-hover:text-brand-green-ink transition-colors">Shopify</h3>
              <p className="text-brand-dim text-[13px] leading-[1.5]">Monitor setup for Shopify stores. Checkout, competitor tracking, and Intelligence Digest.</p>
              <span className="mt-4 inline-block text-brand-green-ink text-[14px] font-medium">View Shopify setup →</span>
            </Link>
            <Link href="/for/woocommerce" className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 hover:border-brand-green-ink transition-colors group">
              <div className="mb-4 w-10 h-10">
                <Image src="/woocommerce.svg" alt="WooCommerce" width={40} height={40} />
              </div>
              <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 group-hover:text-brand-green-ink transition-colors">WooCommerce</h3>
              <p className="text-brand-dim text-[13px] leading-[1.5]">Monitor setup for WooCommerce stores. Shop, checkout, and competitor price tracking.</p>
              <span className="mt-4 inline-block text-brand-green-ink text-[14px] font-medium">View WooCommerce setup →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cost of downtime */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[860px] mx-auto">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-8 text-center">The real cost of e-commerce downtime</h2>
            <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-4">
              {COST_OF_DOWNTIME.map(({ metric, value }) => (
                <div key={metric} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6 flex flex-col gap-2">
                  <span className="text-[clamp(28px,3.5vw,40px)] font-extrabold tracking-[-0.03em] text-brand-green-ink">{value}</span>
                  <span className="text-brand-dim text-[14px] leading-[1.5]">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for stores that can&apos;t afford downtime</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">A basic ping check isn&apos;t enough for e-commerce. Here&apos;s what Beaconmon adds.</p>
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

      {/* How it helps */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                What Beaconmon does for your store
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up monitors for your homepage, product pages, cart, and checkout separately. Know exactly which part of the funnel is broken, not just that &ldquo;the site is down.&rdquo;
              </p>
            </div>
            <ul className="space-y-5">
              {HOW_IT_HELPS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
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
            Start monitoring your store in 5 minutes.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. Starter plan from ${PRICING.starter.monthly}/mo.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

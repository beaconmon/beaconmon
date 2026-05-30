import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecommerce Uptime Monitoring Guide | Beaconmon',
  description:
    'The complete guide to uptime monitoring for online stores. What to monitor, check intervals, keyword monitoring, multi-location checks, and what downtime actually costs.',
  alternates: { canonical: 'https://beaconmon.com/ecommerce-uptime-monitoring-guide' },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Ecommerce Uptime Monitoring: The Complete Guide for Online Stores',
  description:
    'What uptime monitoring means for ecommerce, what to monitor, check intervals, keyword monitoring, and how to set it up.',
  author: { '@type': 'Organization', name: 'Beaconmon' },
  publisher: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How often should an ecommerce store be checked for uptime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most stores, every 1 to 2 minutes is a reasonable baseline. During peak periods like Black Friday or promotional campaigns, 30-second checks let you catch and respond to outages before losing more than a handful of orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is keyword monitoring and why does it matter for ecommerce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keyword monitoring checks that a specific word or phrase is present in the HTTP response body. For ecommerce, this means verifying that "Add to Cart" is on your product page or "Place order" is on your checkout, even if the server returns a 200 OK status. A broken deploy can return 200 with an error page. Keyword monitoring catches that.',
      },
    },
    {
      '@type': 'Question',
      name: 'What pages should I monitor on my ecommerce store?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At minimum: your homepage, one representative product page, your cart page, and your checkout. Each is a distinct failure point. A checkout outage can occur while your homepage is fully healthy, so monitoring only the homepage misses the revenue-critical failure.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is multi-location monitoring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multi-location monitoring sends checks from multiple geographic regions simultaneously. If your store is slow in Europe but fast in the US, a single-location check from the US would miss the problem entirely. Beaconmon checks from up to 5 regions so you see exactly where performance is degraded.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take Beaconmon to detect and alert on an outage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon requires two consecutive failed checks before creating an incident, which prevents false alarms from transient network errors. On the Scale plan with 30-second checks, detection and alerting happen within 60 seconds of an outage starting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Beaconmon work for Shopify stores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Beaconmon monitors any HTTP endpoint, including Shopify storefronts. Note that Shopify's platform-level outages affect all merchants simultaneously and show up on Shopify's status page. Beaconmon monitors your specific store URL, which catches theme errors, app conflicts, and partial outages that Shopify's status page does not reflect.",
      },
    },
  ],
};

const FUNNEL_MONITORS = [
  {
    page: 'Homepage',
    why: 'First signal of a platform-level failure. Also the page most likely to be cached or served from a CDN, so a homepage outage often indicates something more severe.',
    keyword: '"Shop now" or your primary CTA',
  },
  {
    page: 'Product page',
    why: 'Where most paid traffic lands. A broken product page kills conversion before the customer reaches the cart.',
    keyword: '"Add to Cart"',
  },
  {
    page: 'Cart',
    why: 'Often the first page with session-specific state. Cart failures are invisible to HTTP status checks that return 200.',
    keyword: '"Proceed to checkout"',
  },
  {
    page: 'Checkout',
    why: 'Revenue-critical. A checkout outage that lasts 10 minutes during a promotional period can cost thousands in abandoned carts.',
    keyword: '"Place order" or "Complete purchase"',
  },
];

const FEATURES = [
  {
    heading: '30-second check intervals',
    body: 'Scale plan checks every page in your funnel every 30 seconds. A checkout failure is detected and alerted within 60 seconds, before more than a handful of customers encounter it.',
  },
  {
    heading: 'Keyword monitoring for broken deploys',
    body: 'A 200 OK does not mean your checkout is working. Keyword monitoring verifies that "Add to Cart" is present in the response body. Catch broken deploys and theme errors that HTTP status codes miss.',
  },
  {
    heading: 'Multi-location checks from 5 regions',
    body: 'Growth and Scale plans check from up to 5 geographic regions simultaneously. A slow response from one region while others are fast is flagged as a localized issue, not a global outage, reducing false alarms.',
  },
  {
    heading: 'Two consecutive failures required',
    body: "Beaconmon never marks a monitor down on a single failure. Two consecutive failed checks are required before an incident is created. This eliminates false alarms from transient network errors without meaningfully delaying real outage detection.",
  },
  {
    heading: 'Anomaly detection for slowdowns',
    body: "Growth and Scale: Beaconmon learns your store's normal response time and alerts you when a page is significantly slower than your baseline, even if it has not gone down. Slowdowns during peak traffic are often the first sign of an overloaded server.",
  },
  {
    heading: 'Incident history and postmortems',
    body: 'Every incident is logged with start time, duration, and alert timeline. Review your uptime history by month or export it for internal postmortems and SLA reporting.',
  },
];

const HOW_IT_WORKS = [
  'Add your homepage, product page, cart, and checkout as separate HTTP monitors',
  'Enable keyword checks on your cart and checkout to verify critical content is present',
  'Set check intervals and alert channels: email, Slack, or webhook',
  'Beaconmon monitors continuously and creates an incident after two consecutive failures',
  'Receive an alert the moment downtime is confirmed, and a recovery alert when the monitor comes back up',
];

const FAQS = [
  {
    q: 'How often should an ecommerce store be checked for uptime?',
    a: 'For most stores, every 1 to 2 minutes is a reasonable baseline. During peak periods like Black Friday or promotional campaigns, 30-second checks let you catch and respond to outages before losing more than a handful of orders.',
  },
  {
    q: 'What is keyword monitoring and why does it matter for ecommerce?',
    a: 'Keyword monitoring checks that a specific word or phrase is present in the HTTP response body. For ecommerce, this means verifying that "Add to Cart" is on your product page or "Place order" is on your checkout, even if the server returns a 200 OK status. A broken deploy can return 200 with an error page. Keyword monitoring catches that.',
  },
  {
    q: 'What pages should I monitor on my ecommerce store?',
    a: 'At minimum: your homepage, one representative product page, your cart page, and your checkout. Each is a distinct failure point. A checkout outage can occur while your homepage is fully healthy, so monitoring only the homepage misses the revenue-critical failure.',
  },
  {
    q: 'What is multi-location monitoring?',
    a: 'Multi-location monitoring sends checks from multiple geographic regions simultaneously. If your store is slow in Europe but fast in the US, a single-location check from the US would miss the problem entirely. Beaconmon checks from up to 5 regions so you see exactly where performance is degraded.',
  },
  {
    q: 'How long does it take Beaconmon to detect and alert on an outage?',
    a: 'Beaconmon requires two consecutive failed checks before creating an incident, which prevents false alarms from transient network errors. On the Scale plan with 30-second checks, detection and alerting happen within 60 seconds of an outage starting.',
  },
  {
    q: 'Does Beaconmon work for Shopify stores?',
    a: "Yes. Beaconmon monitors any HTTP endpoint, including Shopify storefronts. Note that Shopify's platform-level outages affect all merchants simultaneously and show up on Shopify's status page. Beaconmon monitors your specific store URL, which catches theme errors, app conflicts, and partial outages that Shopify's status page does not reflect.",
  },
];

export default function EcommerceUptimeMonitoringGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JsonLd data={breadcrumbSchema({ name: 'Ecommerce Uptime Monitoring Guide', path: '/ecommerce-uptime-monitoring-guide' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Uptime Monitoring Guide</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Ecommerce Uptime Monitoring: The Complete Guide
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            What to monitor, check intervals, keyword verification, multi-location checks, and how to set up a monitoring stack that catches real outages without drowning your team in false alarms.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* What is uptime monitoring */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              What is ecommerce uptime monitoring?
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                Uptime monitoring is the practice of automatically checking your store&apos;s pages on a fixed interval and alerting your team when one fails. For a generic website, a single homepage check every 5 minutes is usually enough. For an ecommerce store, the requirements are different.
              </p>
              <p>
                Your homepage, product pages, cart, and checkout are four distinct systems. Any one of them can fail independently. A broken deploy might leave your homepage serving normally while the checkout returns a 500 error. A Shopify app conflict might cause the cart to silently drop items. A 200 OK response does not mean your store is working.
              </p>
              <p>
                Effective ecommerce uptime monitoring treats each step of the purchase funnel as a separate monitor, verifies that critical content is present in the response, and alerts your team fast enough to respond before the outage compounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost of downtime */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              What does ecommerce downtime actually cost?
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                The direct cost is simple to estimate. Take your monthly revenue and divide by 730 (hours in a month). That is your revenue per hour. A store doing $50,000 per month loses roughly $68 per hour of checkout downtime.
              </p>
              <p>
                During peak traffic, the multiplier is higher. When Shopify experienced platform issues during the 2025 Cyber Monday period, merchants with no independent monitoring had no way to know whether their store was affected until customers began complaining. Merchants with 30-second checks knew within a minute and could post to their status page before support tickets started filing in.
              </p>
              <p>
                The indirect costs matter too: lost customer trust, cart abandonment that does not come back, and ad spend that drove traffic to a broken checkout. A one-hour outage during a major sale can cost multiples of what a year of monitoring would cost.
              </p>
            </div>
            <div className="mt-8 bg-brand-bg0 border border-brand-line-soft rounded-2xl p-6">
              <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-3">Quick estimate</p>
              <p className="text-brand-text text-[15px] leading-[1.6]">
                Monthly revenue &divide; 730 = revenue per hour of downtime
              </p>
              <p className="text-brand-dim text-[13px] mt-2">At $50,000/mo that is $68/hr. At $200,000/mo it is $274/hr.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to monitor */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Monitor every step of your purchase funnel</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Each page is a distinct failure point. Monitoring only the homepage misses the failures that actually cost you revenue.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {FUNNEL_MONITORS.map(({ page, why, keyword }) => (
              <div key={page} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 text-brand-green-ink">{page}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65] mb-3">{why}</p>
                <p className="text-[12px] text-brand-muted">
                  <span className="font-semibold text-brand-dim">Keyword to verify:</span> {keyword}
                </p>
              </div>
            ))}
          </div>
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
                How to set up ecommerce uptime monitoring
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Takes about 5 minutes. No code required.
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
            <Link href="/ecommerce-website-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce website monitoring</Link>
            <Link href="/homepage-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Homepage monitoring</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
            <Link href="/for/woocommerce" className="text-brand-dim hover:text-brand-text transition-colors">WooCommerce monitoring</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
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

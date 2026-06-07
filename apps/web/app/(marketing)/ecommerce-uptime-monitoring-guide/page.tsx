import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Uptime Monitoring Guide | Beaconmon',
  description:
    'How to monitor your Shopify store for downtime, broken checkouts, and slow pages. Plus why the merchants gaining ground pair uptime monitoring with competitor price and promotion tracking.',
  alternates: { canonical: 'https://beaconmon.com/ecommerce-uptime-monitoring-guide' },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Shopify Uptime Monitoring: The Complete Guide for Ecommerce Stores',
  description:
    'Funnel-by-funnel monitoring for Shopify stores, check intervals, keyword verification, and why competitor intelligence is the natural next step after uptime.',
  author: { '@type': 'Organization', name: 'Beaconmon' },
  publisher: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

const FUNNEL_MONITORS = [
  {
    page: 'Homepage',
    why: 'First signal of a platform-level failure. Also the page most likely to be cached, so a homepage outage often indicates something more severe further down the stack.',
    keyword: 'Your brand name or primary headline',
  },
  {
    page: 'Product page',
    why: 'Where most paid traffic lands. A broken product page kills conversion before the customer reaches the cart. Shopify app conflicts often surface here first.',
    keyword: '"Add to Cart"',
  },
  {
    page: 'Cart',
    why: 'Often the first page with session-specific state. Cart failures are invisible to HTTP status checks that return 200, so keyword verification matters most here.',
    keyword: '"Proceed to checkout"',
  },
  {
    page: 'Checkout',
    why: 'Revenue-critical. A 10-minute checkout outage during a promotional period can cost thousands in abandoned carts and erode customer trust in ways that last weeks.',
    keyword: '"Place order" or "Complete purchase"',
  },
];

const UPTIME_FEATURES = [
  {
    heading: '30-second checks on your purchase funnel',
    body: 'Scale plan checks every page in your funnel every 30 seconds. A checkout failure is detected and alerted within 60 seconds, before more than a handful of customers encounter it.',
  },
  {
    heading: 'Keyword verification for broken deploys',
    body: 'A 200 OK does not mean your checkout is working. Keyword monitoring verifies that "Add to Cart" is present in the response body. Catch broken Shopify theme deploys and app conflicts that HTTP status codes miss entirely.',
  },
  {
    heading: 'Multi-location checks from 5 regions',
    body: 'Growth and Scale plans check from up to 5 geographic regions simultaneously. A slow response from one region while others are fast is flagged as a localized issue, not a global outage, reducing false alarms.',
  },
  {
    heading: 'Two consecutive failures required',
    body: 'Beaconmon never marks a monitor down on a single failure. Two consecutive failed checks are required before an incident is created. This eliminates false alarms from transient network errors without meaningfully delaying real outage detection.',
  },
];

const INTEL_FEATURES = [
  {
    heading: 'Competitor price and promotion tracking',
    body: 'Add any competitor URL as a content monitor. When they change a price, launch a sale banner, or update their shipping policy, Beaconmon detects it and alerts your team within minutes.',
  },
  {
    heading: 'AI summaries of competitor changes',
    body: 'Instead of reading a raw HTML diff, you see: "The hero changed from free shipping over $50 to free shipping on all orders." Growth plan and above.',
  },
  {
    heading: 'CSS selector targeting',
    body: 'Target just the pricing section or promo banner on a competitor page, not the entire page. Eliminates noise from unrelated changes like blog post timestamps or dynamic navigation.',
  },
  {
    heading: 'Weekly intelligence digests',
    body: 'A weekly email summary of all competitor changes detected in the past 7 days. Share with your team without anyone needing to log in to the dashboard.',
  },
];

const HOW_IT_WORKS = [
  'Add your homepage, product page, cart, and checkout as HTTP monitors with 30-second or 1-minute check intervals',
  'Enable keyword checks on cart and checkout to verify critical content is present, not just that the server responded',
  'Add competitor URLs as content monitors to track their pricing pages, homepage promotions, and shipping policies',
  'Get alerted when your store goes down and when a competitor changes something worth knowing about',
  'Review weekly digests that surface competitor moves across all your monitored URLs',
];

const FAQS = [
  {
    q: 'Does Beaconmon work specifically for Shopify stores?',
    a: "Yes. Beaconmon monitors any HTTP endpoint including Shopify storefronts. Shopify's status page tells you about platform-level incidents, but it does not tell you when your specific store has a theme error, an app conflict, or a broken checkout caused by a recent change. Beaconmon monitors your specific URLs.",
  },
  {
    q: 'How often should I check my Shopify store for uptime?',
    a: 'For most stores, every 1 to 2 minutes is a solid baseline. During peak periods like promotional campaigns or major sale events, 30-second checks let you catch and respond to failures before more than a handful of customers encounter them.',
  },
  {
    q: 'What is keyword monitoring and why does it matter for Shopify?',
    a: 'Keyword monitoring checks that a specific word or phrase is present in the HTTP response body. Shopify app conflicts and failed deploys often leave the server returning 200 OK while the page itself is broken or empty. Verifying that "Add to Cart" is present catches these failures that HTTP status codes miss.',
  },
  {
    q: 'Can Beaconmon track competitor prices and promotions?',
    a: 'Yes. Content monitors watch any URL for changes to the HTML. You can target specific sections like a pricing table or promo banner using CSS selectors. When a competitor changes a price or launches a sale, Beaconmon detects it and sends an alert with a summary of what changed.',
  },
  {
    q: 'Does competitor change detection work on Shopify storefronts?',
    a: 'Yes. Beaconmon uses server-side HTML fetching, which works on the majority of Shopify stores and product pages. Pages that load pricing entirely through JavaScript may not surface all content, but most Shopify product and collection pages are server-rendered and work correctly.',
  },
  {
    q: 'What is the difference between uptime monitoring and content monitoring?',
    a: 'Uptime monitoring checks whether a page responds successfully to an HTTP request and optionally verifies that critical content is present. Content monitoring fetches the page on a regular interval, stores a snapshot, and alerts you when anything changes. Uptime tells you your store is working. Content monitoring tells you what your competitors are doing.',
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

export default function EcommerceUptimeMonitoringGuidePage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Shopify Monitoring Guide</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Shopify Uptime Monitoring: The Complete Guide for Ecommerce Stores
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-8">
            How to monitor your Shopify funnel for downtime, broken checkouts, and slow pages. Plus why the merchants gaining the most ground pair uptime monitoring with competitor price and promotion tracking.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* What Shopify uptime monitoring covers */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              What Shopify uptime monitoring actually covers
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                Shopify&apos;s status page tells you when there is a platform-level incident. It does not tell you when your specific store has a broken checkout from a theme update, an app conflict that silently drops cart items, or a slow product page from a third-party script adding seconds to load time.
              </p>
              <p>
                Effective Shopify uptime monitoring treats your homepage, product pages, cart, and checkout as four distinct systems. Any one of them can fail independently. A broken deploy might leave your homepage serving normally while the checkout returns an error page that still returns 200 OK.
              </p>
              <p>
                The tools that catch these failures are HTTP checks with keyword verification, run at short intervals, across multiple geographic regions. That is the core of what this guide covers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel monitors */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Monitor every step of your purchase funnel</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Each page is a distinct failure point. Monitoring only the homepage misses the failures that actually cost you revenue.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {FUNNEL_MONITORS.map(({ page, why, keyword }) => (
              <div key={page} className="bg-brand-bg0 border border-brand-line-soft rounded-2xl p-7">
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

      {/* Cost of downtime */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              What Shopify downtime actually costs
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                The direct cost is simple. Take your monthly revenue and divide by 730. That is your revenue per hour. A store doing $50,000 per month loses roughly $68 per hour of checkout downtime, and more during promotional periods when traffic is above average.
              </p>
              <p>
                The indirect costs matter too. Cart abandonment that does not come back, ad spend that drove traffic to a broken checkout, and customer support tickets that arrive after the store has recovered. A one-hour outage during a major sale can cost multiples of what a year of monitoring would cost.
              </p>
            </div>
            <div className="mt-8 bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
              <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-3">Quick estimate</p>
              <p className="text-brand-text text-[15px] leading-[1.6]">
                Monthly revenue &divide; 730 = revenue per hour of downtime
              </p>
              <p className="text-brand-dim text-[13px] mt-2">At $50,000/mo that is $68/hr. At $200,000/mo it is $274/hr.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Uptime features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Uptime monitoring built for Shopify stores</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {UPTIME_FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bridge: competitor intelligence */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              Once uptime is covered, the next unlock is competitor intelligence
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                Uptime monitoring tells you when your store is broken. It does not tell you when a competitor quietly drops their prices on your top SKUs, adds free shipping above a new threshold, or launches a sale that starts pulling your customers away.
              </p>
              <p>
                The merchants who respond fastest to competitor moves are the ones who know about them first. Most find out from customers asking why the competitor is cheaper. The rest find out from a weekly manual check. Neither is fast enough during a promotional period.
              </p>
              <p>
                Beaconmon runs the same kind of monitoring on competitor pages that it runs on your own store. When a competitor changes a price, updates a promo banner, or edits their shipping policy, you get an alert with a plain-English summary of exactly what changed.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/ecommerce-competitor-intelligence" className="text-brand-green-ink font-semibold text-[15px] hover:underline">
                See how competitor intelligence works in Beaconmon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor intelligence features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Competitor tracking in the same tool as uptime</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">One dashboard. Your store health and your competitive landscape, side by side.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {INTEL_FEATURES.map(({ heading, body }) => (
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
                Set up in under 10 minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                No code required. Uptime and competitor monitoring in the same workflow.
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
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
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
            Monitor your store and your competitors, starting now.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

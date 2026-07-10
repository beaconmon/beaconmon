import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptime & Competitor Monitoring for Shopify | Beaconmon',
  description:
    'Catch checkout failures in under a minute and know when a competitor drops a price. Beaconmon monitors your Shopify store and your competitors.',
  alternates: { canonical: 'https://beaconmon.com/for/shopify' },
  openGraph: { url: 'https://beaconmon.com/for/shopify' },
};

const TEMPLATE_MONITORS = [
  { name: 'Homepage', type: 'HTTP', interval: '1 min', detail: 'Keyword: "Add to Cart"' },
  { name: 'Cart page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: checkout form present' },
  { name: 'Checkout', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Complete order"' },
  { name: 'Competitor 1 pricing page', type: 'Content', interval: '15 min', detail: 'CSS selector: .price' },
  { name: 'Competitor 2 homepage', type: 'Content', interval: '15 min', detail: 'Full page change detection' },
];

const FEATURES = [
  {
    heading: 'Checkout failures caught in under a minute',
    body: 'Your checkout is the most important page on your store. Beaconmon checks it every 30 seconds on the Scale plan and fires a Slack alert within 60 seconds of a confirmed failure. You find out before the customer complaint arrives.',
  },
  {
    heading: 'Broken deploys caught before customers notice',
    body: 'A 200 OK from Shopify\'s servers does not mean your cart or checkout is working. Keyword monitoring checks that "Add to Cart" is present on your product page and "Complete order" is on your checkout. Catch a broken theme deploy in seconds, not hours.',
  },
  {
    heading: 'Know when a competitor changes their price',
    body: 'Add competitor product and pricing pages as content monitors. Get a Slack alert the moment a competitor drops a price, launches a promotion, or updates their homepage. React before your customers notice.',
  },
  {
    heading: 'One digest instead of a dashboard to babysit',
    body: 'The Intelligence Digest emails you every morning or week with a summary of every competitor change and every anomaly on your own store. One skim with coffee and you are caught up.',
  },
];

export default function ForShopifyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'For Shopify', path: '/for/shopify' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For Shopify Store Owners</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Your Shopify Store Is Live Around the Clock. You&apos;re Not.<br />
            <span className="text-brand-green-ink">Catch checkout failures before a customer does.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Beaconmon watches your checkout and product pages every 30 seconds, and alerts you the moment a competitor changes their price or launches a sale.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Two jobs */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Two things Shopify store owners need to know</h2>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[860px] mx-auto">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">Is your checkout working right now?</h3>
              <p className="text-brand-dim text-[14px] leading-[1.65]">Beaconmon checks your homepage, cart, and checkout every 30 seconds and fires an alert within 60 seconds of a confirmed failure. Not when a customer emails you.</p>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">Did a competitor just move?</h3>
              <p className="text-brand-dim text-[14px] leading-[1.65]">Beaconmon watches competitor product and pricing pages and alerts you the moment something changes: a price drop, a new promo, or a homepage update. You see it before your customers do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Your store and competitors, at a glance</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Every change on a competitor site, every alert on your own store, in one feed.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 3, storeChanges: 1, storeChangesLabel: 'deploy detected', smartAlerts: 2, smartAlertsLabel: 'slow responses' }}
              events={[
                { type: 'competitor', icon: '↓', label: 'Competitor price drop', detail: 'CompetitorBrand cut $20 off AirMax Pro', timeAgo: '12 min ago' },
                { type: 'competitor', icon: '✎', label: 'Hero copy changed', detail: 'CompetitorBrand updated homepage banner', timeAgo: '1 hr ago' },
                { type: 'store', icon: '⚡', label: 'Shopify deploy detected', detail: '14 new product pages added', timeAgo: '3 hr ago' },
                { type: 'alert', icon: '⚠', label: 'Smart alert', detail: 'Checkout response 2.3s above baseline', timeAgo: '5 hr ago' },
              ]}
              slackNotification={{ title: 'Competitor moved', body: 'CompetitorBrand cut $20 off AirMax Pro. Checkout their pricing page.', timeAgo: '12 min ago', channel: '#intel' }}
            />
          </div>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Five monitors most Shopify stores set up first</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Your checkout funnel and your two most important competitors, covered from day one.</p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[700px] mx-auto">
            {TEMPLATE_MONITORS.map((monitor) => (
              <div key={monitor.name} className="bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-bold text-[15px] text-brand-text">{monitor.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        monitor.type === 'Content'
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-[rgba(0,229,122,0.1)] text-brand-green-ink'
                      }`}
                    >
                      {monitor.type}
                    </span>
                    <span className="text-[12px] text-brand-muted">{monitor.interval}</span>
                  </div>
                  <p className="text-[13px] text-brand-dim">{monitor.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon does for your Shopify store</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Protection from the two things that actually cost you money: downtime and competitor moves you missed.</p>
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

      {/* Shopify use cases */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">What Shopify merchants track most</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Four scenarios where Beaconmon pays for itself before the end of the month.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {[
              {
                heading: 'Competitor price drops',
                body: 'Your largest competitor cut their price at midnight. By 9am, customers are asking you to match it. Beaconmon catches price changes on competitor product and pricing pages the moment they happen and fires a Slack alert. You can decide to match, hold, or message your existing customers before they notice.',
              },
              {
                heading: 'New product launches',
                body: "Competitor launches are easy to miss unless you're checking their catalog every day. Beaconmon watches competitor collection and new arrivals pages for content changes. When a new product appears, you see the change in your feed and your next Intelligence Digest, with a diff of exactly what was added.",
              },
              {
                heading: 'Promotional banner changes',
                body: "A competitor's homepage hero is one of the fastest signals that a sale is about to start. Beaconmon monitors the full text of homepage banners. When the copy shifts from evergreen content to a promo announcement, you get an alert within the hour, well before the sale appears in your customers' social feeds.",
              },
              {
                heading: 'Stock changes and sellouts',
                body: 'A competitor selling out of a popular product is a buying window. Beaconmon tracks stock status on competitor product pages using CSS selectors targeting out-of-stock indicators. When a bestseller sells out, you know to promote your own inventory or adjust pricing while demand is unmet.',
              },
            ].map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How to set up Shopify monitoring in three steps</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">No plugins, no DNS changes, no code. Paste, confirm, done.</p>
          </div>
          <div className="reveal grid grid-cols-3 max-[880px]:grid-cols-1 gap-4">
            {[
              {
                num: '01',
                heading: 'Paste your store URL',
                body: "Beaconmon detects your Shopify store automatically and suggests a starter bundle covering your homepage, product pages, cart, and checkout. Confirm the bundle in one click.",
              },
              {
                num: '02',
                heading: 'Add competitors to watch',
                body: 'Enter your competitors by domain. Beaconmon suggests their pricing and product pages to monitor. You pick check frequency and CSS selectors for precise price tracking.',
              },
              {
                num: '03',
                heading: 'Get alerts and your morning brief',
                body: 'Alerts fire to email or Slack within 60 seconds of a confirmed change. Your Intelligence Digest summarizes everything from the past 24 hours every morning at 8am.',
              },
            ].map(({ num, heading, body }) => (
              <div key={num} className="reveal p-8 bg-brand-bg1 border border-brand-line-soft rounded-[14px]">
                <span className="font-mono text-[13px] text-brand-green-ink mb-6 block">{num}</span>
                <h3 className="text-[20px] font-bold tracking-[-0.015em] mb-[10px]">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[780px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Questions from Shopify merchants</h2>
          </div>
          <div className="reveal">
            {[
              {
                q: 'Does Beaconmon require a Shopify app or plugin?',
                a: 'No. Beaconmon works from outside your store by fetching your public pages the same way a browser would. There is nothing to install in your Shopify admin and no impact on your store performance.',
              },
              {
                q: 'Can I track competitor prices on Shopify stores?',
                a: 'Yes. Add any competitor URL as a content monitor with a CSS selector targeting their price element. Beaconmon checks the page on your chosen interval and alerts you the moment the price changes. This works for Shopify and non-Shopify competitors.',
              },
              {
                q: 'What happens if my checkout goes down at 2am?',
                a: 'Beaconmon requires two consecutive failed checks before marking a monitor down, which prevents false alarms from transient blips. With a 1-minute check interval, you get an alert within 2 to 3 minutes of a real checkout failure, typically before any customer complaint arrives.',
              },
              {
                q: 'How is Beaconmon different from Shopify uptime monitoring apps?',
                a: 'Shopify monitoring apps run inside your store and are limited to what the Shopify platform exposes. Beaconmon checks your public URLs from outside, the same way customers and search engines access your store. It also monitors SSL expiry, domain expiry, and competitor pages, none of which Shopify apps can do.',
              },
              {
                q: 'What check intervals are available?',
                a: 'Check intervals range from 5 minutes on the Free plan to 30 seconds on the Scale plan. Most Shopify merchants start with 1-minute checks on the Starter plan, which catches checkout failures before a second customer encounters them.',
              },
            ].map(({ q, a }) => (
              <details key={q} open className="group border-b border-brand-line-soft">
                <summary className="flex items-center justify-between py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[16px] font-semibold tracking-[-0.01em] text-brand-text">
                  {q}
                  <svg className="w-4 h-4 shrink-0 text-brand-muted transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <p className="text-brand-dim text-[15px] leading-[1.6] pb-5">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">Related guides</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor intelligence (deep dive)</Link>
            <Link href="/blog/how-to-monitor-competitor-shopify-store-for-changes" className="text-brand-dim hover:text-brand-text transition-colors">How to monitor a competitor&apos;s Shopify store</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
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
            Start monitoring your Shopify store today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

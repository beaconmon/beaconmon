import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WooCommerce Store Monitoring + Competitor Tracking | Beaconmon',
  description: 'Monitor your WooCommerce store uptime, checkout, and competitor pricing in one place. 30-second checks, Intelligence Digest, and instant Slack alerts.',
  alternates: { canonical: 'https://beaconmon.com/for/woocommerce' },
};

const TEMPLATE_MONITORS = [
  { name: 'Homepage', type: 'HTTP', interval: '1 min', detail: 'Status code + response time' },
  { name: '/shop page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Add to cart"' },
  { name: 'Checkout', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Place order"' },
  { name: 'wp-admin health', type: 'HTTP', interval: '5 min', detail: 'Authenticated endpoint ping' },
  { name: 'Competitor pricing page', type: 'Content', interval: '15 min', detail: 'CSS selector: .price, .woocommerce-Price-amount' },
];

const FEATURES = [
  {
    heading: '30-second shop monitoring',
    body: 'Checks your homepage, /shop, cart, and checkout every 30 seconds on the Scale plan. A failed checkout gets flagged in under a minute, not after a customer reports it.',
  },
  {
    heading: 'wp-admin health monitoring',
    body: 'Monitor your WooCommerce admin endpoint to catch plugin conflicts, failed updates, and server errors before they affect your storefront.',
  },
  {
    heading: 'Competitor price and content tracking',
    body: 'Add competitor product and pricing pages as content monitors. Get alerted the moment a competitor changes their price, launches a sale, or updates their homepage.',
  },
  {
    heading: 'Intelligence Digest',
    body: 'A daily or weekly email and Slack digest summarizing every change detected on your competitors\' sites and any checkout anomalies from your own store.',
  },
];

export default function ForWooCommercePage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For WooCommerce</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            WooCommerce Store Monitoring That Catches Problems Before Customers Do<br />
            <span className="text-brand-green-ink">Checkout monitoring, competitor tracking, and weekly Intelligence Digest.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            30-second checks on your shop, cart, and checkout. Keyword monitoring for critical pages. Competitor content tracking. A weekly digest of every change on competitor sites.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Intelligence mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Your store and competitors, at a glance</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Every change on a competitor site, every smart alert on your own store, summarized in one feed.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.com"
              stats={{ competitorMoves: 2, storeChanges: 1, storeChangesLabel: 'plugin update', smartAlerts: 1, smartAlertsLabel: 'checkout alert' }}
              events={[
                { type: 'competitor', icon: '🏷', label: 'Competitor sale launched', detail: 'CompetitorBrand running 20% sitewide sale', timeAgo: '8 min ago' },
                { type: 'competitor', icon: '✎', label: 'Pricing page updated', detail: 'CompetitorBrand changed pricing structure', timeAgo: '2 hr ago' },
                { type: 'store', icon: '⚡', label: 'WooCommerce plugin update', detail: 'WooCommerce 9.4 detected on your store', timeAgo: '4 hr ago' },
                { type: 'alert', icon: '⚠', label: 'Checkout keyword alert', detail: '"Place order" button missing from checkout', timeAgo: '6 hr ago' },
              ]}
              slackNotification={{ title: 'Competitor moved', body: 'CompetitorBrand launched a sitewide sale. Check their pricing page.', timeAgo: '8 min ago', channel: '#intel' }}
            />
          </div>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Start with a proven WooCommerce monitor template</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">These are the five monitors most WooCommerce stores set up first.</p>
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for WooCommerce stores</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Everything you need to protect your store and stay ahead of competitors.</p>
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

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
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
            Start monitoring your WooCommerce store today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

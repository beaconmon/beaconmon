import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon for DTC Brands | Checkout and Competitor Monitoring',
  description:
    'Monitor your checkout and ad landing pages every 30 seconds. Get a daily digest of every competitor price change and promo update. Built for DTC brands running paid traffic.',
  alternates: { canonical: 'https://beaconmon.com/for/dtc-brands' },
  openGraph: { url: 'https://beaconmon.com/for/dtc-brands' },
};

const TEMPLATE_MONITORS = [
  { name: 'Homepage', type: 'HTTP', interval: '1 min', detail: 'Status code + response time threshold' },
  { name: 'Product page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Add to Cart"' },
  { name: 'Checkout', type: 'HTTP + Keyword', interval: '30 sec', detail: 'Keyword: "Complete order"' },
  { name: 'Ad landing page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Catches broken paid traffic pages' },
  { name: 'Competitor 1 pricing', type: 'Content', interval: '15 min', detail: 'CSS selector: .price' },
  { name: 'Competitor 2 pricing', type: 'Content', interval: '15 min', detail: 'CSS selector: .product-price' },
];

const FEATURES = [
  {
    heading: 'Checkout failures caught in under a minute',
    body: 'On the Scale plan, your checkout is checked every 30 seconds. A broken checkout that lasts ten minutes costs real money. Beaconmon catches it in under a minute, before the customer complaint arrives.',
  },
  {
    heading: 'Ad landing pages watched around the clock',
    body: 'You spend money sending paid traffic to landing pages. Beaconmon checks them every minute on the Growth plan so a 404 or broken form does not quietly drain your ad budget for hours while you are heads-down on something else.',
  },
  {
    heading: 'Competitor price change alerts',
    body: 'Watch competitor product and pricing pages as content monitors. The moment a competitor drops a price, runs a promo, or launches a new SKU, you get a Slack ping. React first.',
  },
  {
    heading: 'Intelligence Digest, daily',
    body: 'One email and Slack post a day with every competitor move, every site change, and every smart alert from the last 24 hours. Skim it with coffee. Skip the dashboard.',
  },
];

export default function ForDtcBrandsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'For DTC Brands', path: '/for/dtc-brands' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For DTC Brands</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Your Ads Are Running. Is Your Landing Page?<br />
            <span className="text-brand-green-ink">Catch failures fast. Know when competitors move.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Beaconmon checks your checkout and ad landing pages every 30 seconds, and alerts you the moment a competitor drops a price or launches a sale. One platform for both sides of your growth.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Your store and your competitors, in one feed</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">A daily summary that tells you what changed overnight and what to do about it.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourbrand.com"
              stats={{ competitorMoves: 4, storeChanges: 1, storeChangesLabel: 'deploy detected', smartAlerts: 2, smartAlertsLabel: 'response anomalies' }}
              events={[
                { type: 'competitor', icon: '↓', label: 'Competitor price drop', detail: 'CompetitorBrand cut $15 off bestseller SKU', timeAgo: '18 min ago' },
                { type: 'competitor', icon: '🏷', label: 'Sitewide promo launched', detail: 'CompetitorBrand running 20% off banner', timeAgo: '2 hr ago' },
                { type: 'alert', icon: '⚠', label: 'Checkout slow', detail: 'Checkout p95 climbed to 2.1s, 3x baseline', timeAgo: '4 hr ago' },
                { type: 'store', icon: '⚡', label: 'Deploy detected', detail: 'Product page templates updated', timeAgo: '6 hr ago' },
              ]}
              slackNotification={{ title: 'Competitor moved', body: 'CompetitorBrand cut $15 off bestseller. Worth a quick price check.', timeAgo: '18 min ago', channel: '#intel' }}
            />
          </div>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">A DTC monitoring template</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Your store, your ad landing pages, and your two biggest competitors, covered from day one.</p>
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for DTC growth teams</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Revenue protection on one side, competitive intelligence on the other.</p>
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
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">For Shopify stores</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
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
            Protect every checkout. Watch every competitor.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

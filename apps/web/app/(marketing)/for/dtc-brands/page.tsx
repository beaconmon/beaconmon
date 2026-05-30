import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Monitoring for DTC Brands | Beaconmon',
  description: 'Website monitoring for DTC brands where checkout conversion is everything. 30-second checkout checks, competitor pricing alerts, and a daily Intelligence Digest.',
  alternates: { canonical: 'https://beaconmon.com/for/dtc-brands' },
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
    heading: '30-second checkout checks',
    body: 'On the Scale plan, your checkout is checked every 30 seconds. A broken checkout that lasts ten minutes costs more than a year of monitoring. Beaconmon flags it in under a minute.',
  },
  {
    heading: 'Competitor price change alerts',
    body: 'Watch competitor product and pricing pages as content monitors. The moment a competitor drops a price, runs a promo, or launches a new SKU, you get a Slack ping. React first.',
  },
  {
    heading: 'Intelligence Digest, daily',
    body: 'One email and Slack post a day with every competitor move, every site change, and every smart alert from the last 24 hours. Skim it with coffee. Skip the dashboard.',
  },
  {
    heading: 'Reliability targets for revenue-critical pages',
    body: 'Set explicit uptime and response time targets on your checkout and product pages. Burn-rate alerts fire when you start eating into your error budget, not after the damage is done.',
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
            Monitoring for DTC Brands Where Every Checkout Counts<br />
            <span className="text-brand-green-ink">Protect revenue. Track competitor moves. Get a daily digest.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Beaconmon watches your checkout, product pages, and ad landing pages every 30 seconds, and tracks every competitor pricing change. One platform for both sides of your growth.
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
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">A daily summary that tells you what changed and what to do about it.</p>
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
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Six monitors covering revenue-critical pages and your two biggest competitors.</p>
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
            <Link href="/pricing-change-alerts" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
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

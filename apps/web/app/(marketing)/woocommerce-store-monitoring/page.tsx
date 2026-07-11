import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WooCommerce Store Monitoring | Uptime, SSL, and Checkout Alerts | Beaconmon',
  description:
    'WooCommerce store monitoring for your own shop: uptime checks on your shop, cart, and checkout, SSL and domain expiry warnings, keyword monitoring, and update-aware alerts. No plugin to install. Free forever for 10 monitors.',
  alternates: { canonical: 'https://beaconmon.com/woocommerce-store-monitoring' },
  openGraph: { url: 'https://beaconmon.com/woocommerce-store-monitoring' },
};

const FEATURES = [
  {
    heading: 'Shop, cart, and checkout uptime checks',
    body: 'Beaconmon checks your shop page, cart, and checkout on an interval as low as 30 seconds on the Scale plan. A non-2xx response or a slow load time fires an alert, so a broken checkout does not sit unnoticed while orders are lost.',
  },
  {
    heading: 'SSL certificate and domain expiry warnings',
    body: 'Beaconmon watches your certificate and domain registration and warns you at 30, 14, and 7 days before either expires. An expired certificate on checkout is a trust problem you want to catch weeks in advance, not the morning it happens.',
  },
  {
    heading: 'Keyword monitoring on cart and checkout',
    body: 'Confirm that "Add to cart" is present on your shop pages and "Place order" is present on checkout. A plugin conflict or a failed WordPress update can leave the page returning 200 OK while the button is gone. Keyword checks catch that a status code alone would miss.',
  },
  {
    heading: 'Update-aware alerts for your own deploys',
    body: 'Updating a plugin, theme, or WordPress core naturally changes your storefront. Update-aware alerts suppress the false positives that come from your own changes, so you are only notified when something is actually broken.',
  },
];

const TEMPLATE_MONITORS = [
  { name: 'Homepage', type: 'HTTP', interval: '1 min', detail: 'Status code + response time' },
  { name: '/shop page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Add to cart"' },
  { name: 'Cart page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: checkout form present' },
  { name: 'Checkout', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Place order"' },
  { name: 'SSL certificate', type: 'SSL', interval: 'Daily', detail: 'Warns at 30, 14, and 7 days before expiry' },
];

const HOW_IT_WORKS = [
  'Paste your WooCommerce store URL and Beaconmon detects your storefront and suggests a starter bundle',
  'Confirm monitors for your shop page, cart, checkout, and any custom API endpoints your store depends on',
  'Set keyword checks so a 200 OK response with a broken page still triggers an alert',
  'Get a Slack or email alert within 60 seconds of a confirmed failure, or check your public status page anytime',
];

const FAQS = [
  {
    q: 'Do I need to install a WordPress plugin for this?',
    a: 'No. Beaconmon monitors your public URLs from outside your store, the same way a browser or search engine would. There is nothing to install on your WordPress site and no impact on storefront performance or your plugin count.',
  },
  {
    q: 'Can Beaconmon catch a plugin conflict that breaks checkout?',
    a: 'Yes, indirectly. Beaconmon does not inspect your WordPress admin, but keyword monitoring confirms that "Place order" or another expected phrase is present on your checkout page. If a plugin conflict removes that element while the page still returns 200 OK, the keyword check catches it.',
  },
  {
    q: 'What is keyword monitoring and why does it matter for WooCommerce?',
    a: 'Keyword monitoring confirms a specific word or phrase is present in the page body, such as "Add to cart" on a shop page. A theme error or a broken plugin update can return a 200 OK status while the actual buy button is missing. Keyword checks catch failures that status code monitoring alone would miss.',
  },
  {
    q: 'How is this different from the broader WooCommerce page on Beaconmon?',
    a: 'This page covers uptime and site health monitoring for your own WooCommerce store only. The Beaconmon for WooCommerce page covers the same uptime checks plus competitor price and promo tracking together, and the WooCommerce competitor monitoring page covers competitor tracking on its own.',
  },
  {
    q: 'How often does Beaconmon check my store?',
    a: 'Check intervals range from 5 minutes on the Free plan to 30 seconds on the Scale plan. Most WooCommerce merchants run 1-minute checks on the Starter plan, which is fast enough to catch a checkout failure before a second customer hits it.',
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

const MOCKUP_EVENTS: React.ComponentProps<typeof IntelligenceMockup>['events'] = [
  { type: 'alert', icon: '⚠', label: 'Checkout keyword missing', detail: '"Place order" not found on checkout page', timeAgo: '4 min ago', bigText: true },
  { type: 'store', icon: '✓', label: 'Recovered', detail: 'Checkout keyword check passing again', timeAgo: '6 min ago' },
  { type: 'store', icon: '🔒', label: 'SSL expiring in 14 days', detail: 'yourstore.com certificate renewal due', timeAgo: '2 hr ago' },
  { type: 'store', icon: '⚡', label: 'Plugin update detected', detail: 'Update-aware alert suppressed 2 expected changes', timeAgo: '5 hr ago' },
];

export default function WooCommerceStoreMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'WooCommerce Store Monitoring', path: '/woocommerce-store-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Uptime and Site Health</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            WooCommerce Store Monitoring for Checkout, Cart, and Uptime
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Beaconmon checks your shop page, cart, and checkout from outside your store, the way a customer would experience them. Catch a broken plugin update, an expiring SSL certificate, or a failed API endpoint before it costs you an order. No plugin to install. Also want competitor monitoring alongside your uptime? See{' '}
            <Link href="/for/woocommerce" className="text-brand-green-ink hover:underline">
              Beaconmon for WooCommerce
            </Link>
            .
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Competitor mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Know the moment your store breaks, not when a customer tells you</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Uptime, SSL, and keyword checks across your shop, cart, and checkout.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstore.com"
              stats={{ competitorMoves: 0, storeChanges: 5, storeChangesLabel: 'monitors active', smartAlerts: 1, smartAlertsLabel: 'alert today' }}
              events={MOCKUP_EVENTS}
              slackNotification={{
                title: 'Checkout keyword missing',
                body: '"Place order" not found on checkout. Two consecutive checks failed.',
                timeAgo: '4 min ago',
                channel: '#alerts',
              }}
            />
          </div>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Five monitors most WooCommerce stores set up first</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Your checkout funnel and your certificate expiry, covered from day one.</p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[700px] mx-auto">
            {TEMPLATE_MONITORS.map((monitor) => (
              <div key={monitor.name} className="bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-bold text-[15px] text-brand-text">{monitor.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        monitor.type === 'SSL'
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Site health monitoring built for how a WooCommerce store actually breaks</h2>
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
                Set up WooCommerce store monitoring in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                No plugin install, no WordPress admin access required. Paste your store URL and confirm the suggested bundle.
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
            <Link href="/for/woocommerce" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon for WooCommerce</Link>
            <Link href="/woocommerce-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">WooCommerce competitor monitoring</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce uptime monitoring guide</Link>
            <Link href="/tools/woocommerce-uptime-test" className="text-brand-dim hover:text-brand-text transition-colors">Free WooCommerce uptime test</Link>
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

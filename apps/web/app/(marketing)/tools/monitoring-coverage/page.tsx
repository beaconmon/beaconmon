import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CoverageAuditor from '@/components/tools/CoverageAuditor';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store Monitoring Coverage Auditor | Beaconmon',
  description:
    'Free monitoring coverage audit for Shopify stores. Check if your homepage, collections, product, cart, and checkout are healthy and what needs monitoring.',
  alternates: { canonical: 'https://beaconmon.com/tools/monitoring-coverage' },
  openGraph: { url: 'https://beaconmon.com/tools/monitoring-coverage' },
};

const FAILURE_STORIES = [
  {
    page: 'Product page',
    story:
      'Returns 404 after a theme update. Customers see an error, not the product. You find out when your conversion rate tanks two days later.',
  },
  {
    page: 'Cart',
    story:
      'Breaks after a Shopify app conflict. Customers add items but cannot checkout. You find out from a support ticket, not an alert.',
  },
  {
    page: 'Collections page',
    story:
      'Goes blank after a tag change. Your navigation is broken. Search engines start deindexing the collection while you are unaware.',
  },
];

const PAGE_TABLE = [
  { page: 'Homepage', why: 'First impression, SEO landing page', pattern: 'yourstore.com/' },
  { page: 'Collections', why: 'Navigation, SEO category pages', pattern: 'yourstore.com/collections' },
  { page: 'Product page', why: 'Direct revenue, SEO', pattern: 'yourstore.com/products/[handle]' },
  { page: 'Cart', why: 'Conversion critical', pattern: 'yourstore.com/cart' },
  { page: 'Checkout', why: 'Revenue critical', pattern: 'yourstore.com/checkouts' },
];

const FAQS = [
  {
    q: 'Which pages should I monitor on my Shopify store?',
    a: 'At minimum, 5 pages: your homepage, one collection page, one product page, the cart, and the checkout entry point. These are the pages where a failure directly costs you revenue, and the audit above checks all 5 in parallel so you can see in seconds which ones are healthy and which need a monitor.',
  },
  {
    q: 'How do I know if my Shopify cart is broken?',
    a: 'Without monitoring, you typically find out when a customer contacts you or when you notice a sudden drop in orders, often hours later. The coverage audit above checks your cart page directly and tells you within seconds whether it is responding, so you do not wait on a support ticket to learn checkout is failing.',
  },
  {
    q: 'Can a Shopify product page go down without the homepage going down?',
    a: 'Yes, and it happens often. Shopify apps, theme liquid errors, and specific product template issues can take down individual product pages while the homepage stays perfectly healthy. Each page has its own rendering stack, which is exactly why monitoring only your homepage leaves most of your revenue-critical pages completely unwatched.',
  },
  {
    q: 'How often do individual Shopify pages break?',
    a: 'Most Shopify outages are not platform-wide. They are localized to specific pages, often triggered by theme updates, app installs, or third-party script errors. App conflicts account for roughly 60% of individual-page failures on Shopify stores. A homepage-only monitor catches almost none of these because each page has its own rendering stack.',
  },
  {
    q: 'Does Beaconmon monitor individual Shopify pages?',
    a: 'Yes. You can set up a separate monitor for each of your critical pages, with 1-minute check intervals and instant alerts via email or Slack. The free tier includes 10 monitors at no cost, which is more than enough to cover the 5 critical pages this audit checks plus a few extras.',
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

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Store Monitoring Coverage Auditor',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/monitoring-coverage',
  dateModified: '2026-06-29',
  description:
    'Free tool to audit monitoring coverage for Shopify stores. Checks homepage, collections, product pages, cart, and checkout entry in seconds.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to audit your Shopify store monitoring coverage',
  step: [
    { '@type': 'HowToStep', name: 'Enter your store domain', text: 'Paste your Shopify store domain, for example mystore.com.' },
    { '@type': 'HowToStep', name: 'Run the audit', text: 'The tool checks your homepage, collections, a product page, cart, and checkout entry in parallel.' },
    { '@type': 'HowToStep', name: 'Review the results', text: 'Each page shows its HTTP status, response time, and whether it is healthy. Any page returning an error is flagged.' },
  ],
};

export default function MonitoringCoveragePage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Store Monitoring Coverage Auditor', path: '/tools/monitoring-coverage' },
        )}
      />
      <NavBar />

      {/* Hero */}
      <section className="relative pt-[88px] pb-[72px] max-[640px]:pt-16 max-[640px]:pb-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-8%',
            width: 680,
            height: 680,
            background: 'radial-gradient(circle, rgba(0,229,122,0.13), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free tool
          </span>
          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[860px] [overflow-wrap:anywhere]">
            Which pages of your Shopify store are actually being monitored?
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[640px] mb-6">
            Most stores only monitor their homepage. Check your cart, product pages, and checkout entry point too. One
            broken page can kill your conversion rate silently.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[640px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Store Monitoring Coverage Auditor checks the 5 critical pages of a Shopify store, homepage, collections, a product page, cart, and checkout entry, and flags any that are not healthy.</span>{' '}
              App conflicts cause roughly 60% of individual-page failures, which a homepage-only monitor never catches.
            </p>
          </div>
          <CoverageAuditor />
        </div>
      </section>

      {/* Why critical pages matter */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              Why individual pages matter
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Homepage-only monitoring misses most real outages. The failures that cost real money happen on the pages
              customers actually buy through.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5">
            {FAILURE_STORIES.map(({ page, story }) => (
              <div
                key={page}
                className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6"
              >
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-red mb-3">
                  {page}
                </span>
                <p className="text-[14px] text-brand-dim leading-[1.65]">{story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pages you should monitor table */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[820px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
              Pages you should monitor
            </h2>
            <p className="text-brand-dim text-[15px] leading-[1.65] mb-8">
              Five pages cover every critical path in a Shopify store. The audit above checks all five in one go.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-brand-line-soft">
                    <th className="py-3 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                      Page
                    </th>
                    <th className="py-3 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                      Why it matters
                    </th>
                    <th className="py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                      Shopify URL pattern
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line-soft">
                  {PAGE_TABLE.map(({ page, why, pattern }) => (
                    <tr key={page}>
                      <td className="py-3 pr-6 font-semibold text-brand-text">{page}</td>
                      <td className="py-3 pr-6 text-brand-dim">{why}</td>
                      <td className="py-3 font-mono text-[12px] text-brand-muted">{pattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">
              Frequently asked questions
            </h2>
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
            <Link
              href="/tools/shopify-uptime-test"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Shopify uptime tester
            </Link>
            <Link
              href="/ecommerce-website-monitoring"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Ecommerce website monitoring
            </Link>
            <Link
              href="/ecommerce-uptime-monitoring-guide"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Uptime monitoring guide
            </Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
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
            One broken page can silently drain your conversion rate for hours.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches every critical page, every minute. Free forever for 10 monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

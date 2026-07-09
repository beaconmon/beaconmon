import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import SnapshotTool from '@/components/tools/SnapshotTool';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Shopify Competitor Snapshot: Product & Price Checker | Beaconmon',
  description:
    'Paste any Shopify store URL to instantly see how many products it sells, what is on sale right now, and a sample of its catalog. Free competitor price checker, no signup, no app install.',
  alternates: { canonical: 'https://beaconmon.com/tools/shopify-competitor-snapshot' },
  openGraph: { url: 'https://beaconmon.com/tools/shopify-competitor-snapshot' },
};

// Snapshot (free, one-time) vs monitoring (paid, continuous) — the conversion seam.
const SNAPSHOT_NOW = [
  'How many products the store sells right now',
  'Which products are discounted today, with the percent off',
  'A sample of the catalog with current prices',
  'Whether items are in stock',
];
const MONITORING_ADDS = [
  'An alert the moment any price drops',
  'A heads up when a promo or sale launches',
  'New product launches as they go live',
  'Price and promo history over weeks and months',
];

const HOW_IT_WORKS = [
  'Paste a competitor’s store URL. You can use the bare domain, like competitor-store.com.',
  'Beaconmon reads the store’s public product catalog the same way a shopper’s browser would.',
  'You get an instant count of live products, everything on sale, and a catalog sample.',
  'To track changes over time, sign up and Beaconmon watches the store for you.',
];

const FAQS = [
  {
    q: 'How many products does a Shopify store have?',
    a: 'Paste the store URL above and the snapshot returns the count of live products it is publishing right now. Very large catalogs are shown as a floor, for example 1,250+, because the tool reads a fast sample rather than the entire catalog on a free scan.',
  },
  {
    q: 'Can I see what a competitor’s Shopify store sells?',
    a: 'Yes. The snapshot shows a sample of the catalog with current prices, plus everything that is discounted at the moment. Roughly 9 in 10 Shopify stores publish a public product catalog that the tool reads directly in under 5 seconds. A small number of large brands use custom headless storefronts that block that endpoint.',
  },
  {
    q: 'Is this Shopify competitor price checker free?',
    a: 'The snapshot is completely free, with no signup and no app install, and you can run it as many times as you like. Continuous monitoring, which alerts you within minutes when a price drops or a promo launches, is a paid Beaconmon plan with a free tier that includes 10 monitors at no cost.',
  },
  {
    q: 'How do I tell if a Shopify store is having a sale?',
    a: 'The snapshot flags every product whose compare-at price is higher than its current price, which is how Shopify records a markdown. You see each discounted item and the exact percent off, for example 20% or 40%, so you can tell at a glance whether a store is running a promotion and how aggressive it is.',
  },
  {
    q: 'Do I need to install an app or sign up to use it?',
    a: 'No. Unlike most of the 100-plus Shopify spy tools and App Store apps, this runs in the browser with no install and no account. You only create an account if you want Beaconmon to keep watching a store continuously and alert you to changes, and even then the free tier covers 10 monitors.',
  },
  {
    q: 'Does the snapshot work on non-Shopify stores?',
    a: 'This tool is built for Shopify stores, which publish a public product catalog at /products.json. For WooCommerce and other platforms, Beaconmon monitoring tracks prices and content using CSS selector targeting on the specific pages you choose, so you can watch any store on any platform from a single dashboard.',
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
  name: 'Shopify Competitor Snapshot',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/shopify-competitor-snapshot',
  dateModified: '2026-06-29',
  description:
    'Free tool to instantly check any Shopify store’s product count, current sales, and catalog sample from its public product feed.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function ShopifyCompetitorSnapshotPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Tools', path: '/tools' }, { name: 'Shopify Competitor Snapshot', path: '/tools/shopify-competitor-snapshot' })} />
      <NavBar />

      {/* Tool hero — the input is the centerpiece */}
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
            See any Shopify store’s products, prices, and live sales
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-6">
            Paste a competitor’s store URL. In seconds you get how many products they sell, what is on sale right
            now, and a sample of the catalog. No signup, no app install.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-5 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Shopify Competitor Snapshot reads any Shopify store’s public product catalog and returns its total product count, everything currently on sale, and a catalog sample, in under 5 seconds.</span>{' '}
              Most Shopify stores publish a public product feed at /products.json that this tool reads directly.
            </p>
          </div>
          <p className="text-[13px] text-brand-muted mb-6">
            Used by 5,000+ Shopify store owners. No signup, no install.
          </p>
          <SnapshotTool />
        </div>
      </section>

      {/* Free vs paid seam */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What a snapshot shows, and what monitoring adds
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              A snapshot is a picture of one moment. The real edge in competitor intelligence is knowing the moment
              something changes.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-5">
                Snapshot, free, right now
              </h3>
              <ul className="space-y-3">
                {SNAPSHOT_NOW.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal bg-brand-bg1 border border-brand-green-border-25 rounded-2xl p-8 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{ top: '-40%', right: '-20%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(0,229,122,0.10), transparent 60%)', filter: 'blur(30px)' }}
              />
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink mb-5 relative">
                Monitoring, continuous
              </h3>
              <ul className="space-y-3 relative">
                {MONITORING_ADDS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                How the Shopify store product checker works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most Shopify stores publish their catalog, including prices and which items are on sale. The
                snapshot reads only what is already public, so there is nothing to install and no account to create.
              </p>
            </div>
            <ul className="space-y-4">
              {HOW_IT_WORKS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[1px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Promotion monitoring</Link>
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
            Stop checking. Start watching.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches your competitors and alerts you the moment prices or promos change. Free forever for 10
            monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Collections and Category Page Monitoring | Beaconmon',
  description:
    'Monitor competitor Shopify collection pages and category pages for assortment changes, featured product shifts, and catalog restructuring. HTML diff on any URL, no product feed required.',
  alternates: { canonical: 'https://beaconmon.com/competitor-collections-monitoring' },
  openGraph: { url: 'https://beaconmon.com/competitor-collections-monitoring' },
};

const FEATURES = [
  {
    heading: 'Collection and category page HTML monitoring',
    body: 'Add a competitor collection or category page URL and Beaconmon tracks every change to the rendered HTML: products appearing, products disappearing, item order shifts, and new section headings.',
  },
  {
    heading: 'Featured product detection',
    body: 'When a competitor moves a product to the top of a collection or adds it to a featured section, the page diff surfaces the change. Consistent repositioning of the same product is a signal they are pushing it.',
  },
  {
    heading: 'Collection structure tracking',
    body: 'Monitor a navigation page or collections index to catch when a competitor creates a new collection, renames one, or restructures their catalog hierarchy. Catalog reorganization often precedes a promotional push.',
  },
  {
    heading: 'Works for any URL, any platform',
    body: 'Collection monitoring is HTML diffing on any page. Shopify collections, WooCommerce category pages, and custom category pages all work. No feed access required.',
  },
];

const HOW_IT_WORKS = [
  'Add a competitor collection or category page URL as a content monitor',
  'Set a check interval (5 to 15 minutes is typical for collection pages)',
  'Beaconmon records a diff whenever the page HTML changes',
  'Review the diff to see which products were added, removed, or rearranged, then decide whether to act',
];

const FAQS = [
  {
    q: 'What is collection monitoring and why does it matter?',
    a: "A competitor's collection or category page reflects their merchandising decisions. Which products are featured, which are buried, and how collections are named all signal strategic priorities. Monitoring these pages gives you early visibility into assortment changes before they show up in your own analytics.",
  },
  {
    q: 'Does Beaconmon work for non-Shopify category pages?',
    a: 'Yes. Collection monitoring is HTML diffing on any URL. WooCommerce category pages, DTC site category pages, and any server-rendered collection listing work the same way. You add the URL and Beaconmon tracks changes to the page HTML.',
  },
  {
    q: 'How often should I check a competitor collection page?',
    a: 'Most teams use a 15 to 30 minute interval for collection pages. Collection changes are typically deliberate and infrequent, so shorter intervals add noise without adding useful signal. For high-velocity competitors during a sale period, a 5 minute interval may be worth it.',
  },
  {
    q: 'Can I monitor multiple collections per competitor?',
    a: 'Yes. Each collection page URL is a separate monitor. A typical setup might cover a main /collections/all page, one or two category-specific pages (such as /collections/sale or /collections/new-arrivals), and the site navigation if it is rendered in the page HTML.',
  },
  {
    q: 'How is collection monitoring different from Shopify product feed monitoring?',
    a: "The Shopify product feed gives structured data about individual products: prices, availability, and product handles. Collection page monitoring captures what a competitor is surfacing to shoppers at the category level. Product feed and collection monitoring cover complementary angles and work well together.",
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

export default function CompetitorCollectionsMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Collections Monitoring', path: '/competitor-collections-monitoring' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Collection Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Monitor Competitor Collections and Category Pages for Assortment Changes
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            A competitor&apos;s collection page reflects their current merchandising priorities. Beaconmon diffs the HTML on any collection or category page so you see when products are added, removed, or repositioned, and when catalog structure changes.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How to track which products competitors are actively promoting</h2>
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
                Set up collection page monitoring in minutes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Paste a URL. Set an interval. Beaconmon handles the rest.
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
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor intelligence</Link>
            <Link href="/competitor-product-launch-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor product launch tracking</Link>
            <Link href="/competitor-stock-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor stock monitoring</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor promotion monitoring</Link>
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
            See competitor assortment changes as they happen.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

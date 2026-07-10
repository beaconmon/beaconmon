import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cheaper Alternative to Price2Spy for Small Shopify Stores (2026)',
  description:
    'Price2Spy starts at $157 per month. Beaconmon tracks competitor prices and page changes for Shopify stores from $29 per month, with uptime monitoring.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/price2spy' },
  openGraph: { url: 'https://beaconmon.com/alternatives/price2spy' },
};

const TOOL_FACTS = [
  { label: 'Starting price', value: '$157.95/mo (Basic plan)' },
  { label: 'Top plan', value: '$947.95/mo' },
  { label: 'Free plan', value: 'None' },
  { label: 'Primary use case', value: 'Catalog-level price intelligence, MAP compliance, marketplace monitoring' },
  { label: 'Uptime monitoring', value: 'Not included' },
  { label: 'Content change monitoring', value: 'Not included' },
  { label: 'Intelligence Digest', value: 'Not included' },
  { label: 'Setup required', value: 'SKU catalog import, product matching' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'Paying for scale you do not need.',
    body: "Price2Spy's $157/mo minimum is designed for retailers with hundreds of SKUs. Stores with a focused catalog of 10 to 50 products are paying for capacity that sits idle.",
  },
  {
    heading: 'Price tracking with no context.',
    body: 'Price2Spy is a price database. It does not monitor promotional copy, homepage banners, or the surrounding signals that explain why a competitor moved their price.',
  },
  {
    heading: 'No uptime monitoring.',
    body: "When your site goes down during a competitor's sale, Price2Spy does not alert you. Uptime and competitor tracking are separate subscriptions.",
  },
  {
    heading: 'Setup takes days, not minutes.',
    body: 'Price2Spy requires importing a product catalog and matching SKUs to competitor listings. For a Shopify store owner, that process can take days before the first alert fires.',
  },
  {
    heading: 'No digest, just a dashboard.',
    body: 'Monitoring a dashboard is a recurring daily task. Price2Spy does not send a consolidated weekly summary to Slack or email.',
  },
];

const BEACONMON_WINS = [
  {
    heading: '5x cheaper on paid plans.',
    body: 'Beaconmon Starter is $29/mo. Price2Spy starts at $157.95/mo. For a small Shopify store tracking a handful of competitors, that is a significant difference.',
  },
  {
    heading: 'Free plan with no time limit.',
    body: '10 monitors and 1 competitor, free forever. No catalog import, no card required to start.',
  },
  {
    heading: 'Tracks prices and surrounding context.',
    body: 'Beaconmon monitors price changes, promotional banners, stock status, product copy, and full-page content. CSS-selector targeting means you see the exact element that changed.',
  },
  {
    heading: 'Uptime monitoring at no extra cost.',
    body: 'HTTP checks, SSL expiry alerts at 30, 14, and 7 days, and domain expiry alerts are included in every Beaconmon plan.',
  },
  {
    heading: 'Intelligence Digest on Starter.',
    body: 'A weekly Slack or email digest consolidates every competitor change into a readable summary. No dashboard to check.',
  },
  {
    heading: 'Setup in under 10 minutes.',
    body: 'Enter your store URL and competitor domains. The onboarding wizard suggests Shopify preset selectors. Connect Slack or email. Done.',
  },
  {
    heading: 'AI significance scoring on Growth.',
    body: 'On Growth and above, an AI reads each detected change and classifies what it likely means: clearance push, margin test, new campaign, or minor copy tweak.',
  },
];

const WHERE_PRICE2SPY_WINS = [
  'Price2Spy is a purpose-built price intelligence platform for large-catalog retailers. It handles thousands of SKUs, monitors marketplaces including Amazon, Google Shopping, and Walmart, tracks MAP compliance across resellers, and maintains long-run price history. For retailers who need that, Beaconmon is not a substitute.',
  'Price2Spy offers custom data capture for non-standard page formats. If competitor sites serve prices in unusual markup, the Price2Spy team handles the configuration.',
  'For enterprise-level repricing workflows, Price2Spy integrates with dedicated repricing tools. Beaconmon surfaces the intelligence; it does not automate repricing.',
];

const FAQ_ITEMS = [
  {
    q: 'Is Beaconmon a Price2Spy replacement for large catalog retailers?',
    a: 'No. Price2Spy is designed for retailers with hundreds or thousands of SKUs who need catalog-level price tracking, MAP monitoring, and marketplace coverage. Beaconmon is the right fit for Shopify stores with a focused set of competitor pages to watch, not for catalog-scale price databases.',
  },
  {
    q: 'Does Beaconmon require importing a product catalog like Price2Spy?',
    a: 'No. Beaconmon uses CSS-selector targeting on specific competitor pages. You add a competitor URL, choose what element to watch such as price, stock badge, or promotional copy, and you are done. No catalog import, no SKU matching.',
  },
  {
    q: 'What does Beaconmon offer that Price2Spy does not?',
    a: 'Uptime monitoring, promotional copy and banner change tracking, Intelligence Digest, and a price point that fits small Shopify stores. Price2Spy tracks prices only, starts at $157/mo, and is built for large-catalog operations.',
  },
  {
    q: 'How long does Beaconmon setup take?',
    a: 'For a typical Shopify store owner, the onboarding wizard takes under 10 minutes. You enter your store URL and competitor domains, the wizard suggests Shopify preset selectors, and you connect Slack or email. Price2Spy requires catalog import and SKU matching, which can take days.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/price2spy',
      name: 'Cheaper Alternative to Price2Spy for Small Shopify Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Price2Spy alternative', item: 'https://beaconmon.com/alternatives/price2spy' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function AlternativesPrice2SpyPage() {
  return (
    <>
      <JsonLd data={schemaData} />
      <NavBar />

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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            <Link href="/alternatives" className="hover:underline">Alternatives</Link>
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            A cheaper alternative to Price2Spy for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Price2Spy starts at $157/mo and is built for enterprise retailers with large SKU catalogs. Beaconmon tracks competitor prices and page changes for Shopify stores from $29/mo, with uptime monitoring included.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Price2Spy</span>
              <p className="text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-none mb-2">$157</p>
              <p className="text-brand-dim text-[14px] mb-4">per month, Basic plan. No free tier.</p>
              <ul className="space-y-2 text-[13px] text-brand-dim">
                {TOOL_FACTS.map(({ label, value }) => (
                  <li key={label} className="flex gap-2">
                    <span className="text-brand-muted shrink-0">{label}:</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <p className="text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-none mb-2 text-brand-green-ink">Free</p>
              <p className="text-brand-dim text-[14px] mb-4">10 monitors, 1 competitor forever. Starter from $29/mo.</p>
              <ul className="space-y-2 text-[13px] text-brand-dim">
                {[
                  'CSS-selector price and content tracking',
                  'Uptime, SSL, and domain expiry alerts',
                  'Intelligence Digest on Starter',
                  'AI significance scoring on Growth',
                  'Shopify preset selectors built in',
                  'Setup in under 10 minutes',
                  'No catalog import required',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon className="text-brand-green-ink mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for a Price2Spy alternative
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Price2Spy is a strong tool for the right use case. These are the reasons small store owners decide it is not the right fit.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon covers instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">
              Built for Shopify store owners who want competitor intelligence and uptime in one tool, at a price that makes sense for their store size.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {BEACONMON_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[15px] font-bold tracking-[-0.015em] mb-2 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[13px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <div className="reveal mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-block text-[14px] font-semibold text-brand-green-ink hover:underline"
            >
              See all plan features and pricing →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-[640px]:p-7">
            <h2 className="text-[clamp(22px,2.8vw,32px)] tracking-[-0.03em] font-extrabold mb-4">
              Where Price2Spy still wins
            </h2>
            <p className="text-brand-dim text-[15px] leading-[1.65] mb-6">
              Beaconmon is not the right choice for every use case. Here is where Price2Spy is stronger.
            </p>
            <ul className="space-y-4">
              {WHERE_PRICE2SPY_WINS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-brand-muted text-[18px] leading-none mt-0.5 shrink-0">→</span>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{item}</p>
                </li>
              ))}
            </ul>
            <p className="text-brand-muted text-[13px] mt-6">
              Need catalog-scale price intelligence? Price2Spy is built for that.{' '}
              <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">
                Read how Beaconmon approaches competitor monitoring for Shopify stores →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Common questions
            </h2>
          </div>
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/alternatives/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Cheaper alternative to Prisync</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking for Shopify</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MAP Violation Monitoring: Track Minimum Advertised Price | Beaconmon',
  description:
    'MAP compliance means resellers agree not to advertise below your minimum price. Beaconmon watches reseller and retailer pages for price changes so you can check compliance yourself.',
  alternates: { canonical: 'https://beaconmon.com/map-monitoring' },
  openGraph: { url: 'https://beaconmon.com/map-monitoring' },
};

const FEATURES = [
  {
    heading: 'CSS selector price tracking on any reseller page',
    body: "Point Beaconmon at a reseller or retailer's product page and target the price element with a CSS selector. Any change to the listed price is captured as a timestamped diff, so you can check it against the minimum advertised price you set with that partner.",
  },
  {
    heading: 'Shopify feed monitoring for resellers on Shopify',
    body: 'If a reseller runs their storefront on Shopify, add their domain once and Beaconmon reads the public product feed, covering price changes across their whole catalog instead of one product page at a time.',
  },
  {
    heading: 'Per-page price change history',
    body: 'Every price change is logged with a before-and-after diff, so you can see when a reseller dropped a price and by how much, not just that something changed.',
  },
  {
    heading: 'What Beaconmon does not do',
    body: 'Beaconmon does not run a dedicated MAP violation algorithm, does not maintain a reseller network directory, and has no brand portal. It monitors the pages you point it at and shows you the price change. Deciding whether a change is a MAP violation is still on you.',
  },
];

const HOW_IT_WORKS = [
  'List the reseller and retailer pages where your product is sold and add each one as a price monitor',
  "For resellers on Shopify, add their store domain once to cover their full product feed. For anyone else, target the price element with a CSS selector",
  'Beaconmon checks at your chosen interval and logs a diff every time a listed price changes',
  'Review each price change against your MAP policy in the dashboard, in Slack or email alerts, or in the Weekly Competitor Report',
];

const FAQS = [
  {
    q: 'What is MAP compliance monitoring?',
    a: 'MAP, or minimum advertised price, is an agreement where a brand sets a floor below which resellers and retailers may not advertise a product. MAP compliance monitoring means regularly checking whether those resellers are honoring the agreement.',
  },
  {
    q: 'How does Beaconmon detect MAP violations?',
    a: "Beaconmon does not run a dedicated MAP violation algorithm. It monitors a reseller's product page for price changes, using CSS selector targeting or the Shopify product feed, and logs every change as a diff. You review each price change against your MAP policy to decide whether it is a violation.",
  },
  {
    q: 'Can I monitor multiple resellers?',
    a: "Yes. Add each reseller's page as its own monitor. Free accounts get 10 monitors total. Paid plans raise that limit, so you can track price changes across a larger reseller list.",
  },
  {
    q: 'Does Beaconmon automatically flag a MAP violation for me?',
    a: 'No. Beaconmon tells you when a price changed, not whether that price breaks your MAP agreement. There is no reseller network directory or brand portal built into Beaconmon. It gives you the price change data; the MAP judgment call is still yours.',
  },
  {
    q: 'Does this work for reseller sites that are not on Shopify?',
    a: 'Yes. Beaconmon uses HTML-only parsing, so CSS selector targeting works on any server-rendered pricing page, including WooCommerce and other DTC platforms. If a reseller loads price with JavaScript after the page renders, CSS selector targeting will not catch it.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/map-monitoring',
      name: 'MAP Violation Monitoring: Track Minimum Advertised Price',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'MAP monitoring', item: 'https://beaconmon.com/map-monitoring' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function MapMonitoringPage() {
  return (
    <>
      <JsonLd data={schemaData} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">MAP Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            MAP Violation Monitoring for Resellers and Retailers
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[640px] mb-4">
            MAP, or minimum advertised price, is an agreement where resellers agree not to advertise your product below a price you set. MAP violation monitoring is the practice of checking whether they are actually honoring that agreement.
          </p>
          <p className="text-[16px] leading-[1.6] text-brand-dim max-w-[640px] mb-8">
            Beaconmon does not have a dedicated MAP compliance product. What it has is price monitoring: watch a reseller or retailer's page, get a diff the moment the price changes, and check it against your MAP policy yourself. Here is how that works.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How Beaconmon's price monitoring applies to MAP compliance</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div
                key={heading}
                className={`reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 ${
                  heading === 'What Beaconmon does not do' ? 'opacity-80' : ''
                }`}
              >
                <h3
                  className={`text-[18px] font-bold tracking-[-0.015em] mb-3 ${
                    heading === 'What Beaconmon does not do' ? 'text-brand-muted' : 'text-brand-green-ink'
                  }`}
                >
                  {heading}
                </h3>
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
                How to set up MAP monitoring with Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                One monitor per reseller page, no code required.
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
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor promotion monitoring</Link>
            <Link href="/pricing-change-alerts" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
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
            Start tracking reseller prices today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

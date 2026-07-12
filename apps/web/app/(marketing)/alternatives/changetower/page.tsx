import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to ChangeTower for Shopify Competitor Monitoring (2026)',
  description:
    'ChangeTower combines generic page-change and uptime monitoring from $9/mo. Beaconmon adds Shopify-native competitor price, promo, and stock tracking, free to start.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/changetower' },
  openGraph: { url: 'https://beaconmon.com/alternatives/changetower' },
};

const TOOL_FACTS = [
  { label: 'Starting price', value: '$9/mo (paid tier, after free plan)' },
  { label: 'Free plan', value: '3 monitored URLs' },
  { label: 'Core feature', value: 'Generic web page change detection plus uptime monitoring' },
  { label: 'Shopify / WooCommerce presets', value: 'No, generic page diffing only' },
  { label: 'Competitor price extraction', value: 'No, detects that a page changed, not what field changed' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'AI significance scoring', value: 'No' },
  { label: 'Custom / enterprise plan', value: 'Yes, above the $9/mo tier' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'It tells you a page changed, not what changed.',
    body: "ChangeTower's core mechanism is generic diffing: it flags that something on a monitored page is different. Beaconmon targets specific fields with CSS selectors, so an alert says the price dropped from $48 to $42, not just that the page looks different.",
  },
  {
    heading: 'No ecommerce presets.',
    body: "Beaconmon ships with preset selectors for Shopify and WooCommerce product pages: price, stock status, promotional banners. Setting up the same coverage in ChangeTower means manually selecting regions on every competitor page yourself.",
  },
  {
    heading: 'No Weekly Competitor Report.',
    body: 'ChangeTower sends per-page change notifications. Beaconmon rolls every competitor change from the week into one Slack or email digest, so you are not sorting through individual alerts.',
  },
  {
    heading: 'The free plan caps out fast.',
    body: "ChangeTower's free plan covers 3 URLs. Beaconmon's free plan covers 10 monitors and 1 competitor with no time limit, and Starter at $29/mo adds unlimited competitors, well past what ChangeTower's $9/mo entry tier covers.",
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, forever. No card needed.',
  'Preset selectors for Shopify and WooCommerce competitor pages.',
  'Field-level alerts: price, stock status, and promo copy, not just "page changed."',
  'Weekly Competitor Report rolls up every change into one digest.',
  'AI significance scoring on Growth and Scale plans.',
  'Uptime monitoring and SSL / domain expiry alerts included in every plan.',
];

const WHERE_CHANGETOWER_WINS = [
  {
    heading: 'Works for any website, not just ecommerce.',
    body: 'ChangeTower is a general-purpose tool. If you need to monitor government filings, legal terms pages, job listings, or any non-ecommerce site alongside uptime, it is built for that broader use case in a way Beaconmon, which is ecommerce-focused, is not.',
  },
  {
    heading: 'Cheapest entry point for pure content-plus-uptime monitoring.',
    body: 'At $9/mo, ChangeTower undercuts Beaconmon Starter if all you need is generic page-change detection and basic uptime checks with no competitor-specific context.',
  },
  {
    heading: 'Established track record.',
    body: 'ChangeTower has a longer operating history and an established presence on review sites like G2 and Capterra, with enterprise custom plans for teams that need SLAs or procurement-friendly terms.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon do the same thing as ChangeTower?',
    a: 'Both combine content-change and uptime monitoring in one subscription, which is the closest positioning match between the two. The difference is depth: ChangeTower detects generic page changes on any site, while Beaconmon extracts specific ecommerce fields (price, stock, promo copy) using Shopify and WooCommerce presets.',
  },
  {
    q: 'Can Beaconmon replace ChangeTower for non-ecommerce monitoring?',
    a: 'It can technically monitor any URL with a CSS selector, but Beaconmon is built and priced around ecommerce competitor tracking. If you are monitoring government pages, legal documents, or general web content unrelated to a store, ChangeTower is the more purpose-built tool.',
  },
  {
    q: 'Is Beaconmon cheaper than ChangeTower?',
    a: "For ecommerce competitor monitoring, yes, in value if not sticker price. ChangeTower's $9/mo tier only covers generic page diffing. Beaconmon's free plan (10 monitors, 1 competitor) covers real ecommerce use cases with no card required, and Starter at $29/mo adds the Weekly Competitor Report and unlimited competitors.",
  },
  {
    q: 'Does ChangeTower track competitor prices specifically?',
    a: 'No. It flags that a monitored region changed but does not extract or label the price field. Beaconmon\'s CSS-selector targeting and Shopify/WooCommerce presets return the actual price, stock status, or promo text that changed.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/changetower',
      name: 'Free Alternative to ChangeTower for Shopify Competitor Monitoring (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'ChangeTower alternative', item: 'https://beaconmon.com/alternatives/changetower' },
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

export default function ChangeTowerAlternativePage() {
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
            Free alternative to ChangeTower
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Content and uptime monitoring, built for ecommerce competitors.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            ChangeTower combines generic page-change and uptime monitoring for any website. Beaconmon does the same combo but built specifically for Shopify and WooCommerce competitor tracking, free to start.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What ChangeTower costs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The pricing facts, without spin.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">ChangeTower</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">$9<span className="text-[18px] font-semibold text-brand-dim">/mo</span></div>
              <p className="text-brand-dim text-[14px] mb-6">Free plan capped at 3 URLs. Custom/enterprise pricing above the $9/mo tier for higher volume and SLAs.</p>
              <div className="space-y-2">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-[13px]">
                    <span className="text-brand-muted shrink-0 w-[190px]">{label}</span>
                    <span className="text-brand-dim">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">Free<span className="text-[18px] font-semibold text-brand-dim"> to start</span></div>
              <p className="text-brand-dim text-[14px] mb-6">10 monitors and 1 competitor free forever. Starter at $29/mo unlocks unlimited competitors and Weekly Competitor Report.</p>
              <div className="space-y-3">
                {[
                  'No card required to start',
                  'Shopify and WooCommerce preset selectors',
                  'Field-level alerts, not just "page changed"',
                  'Weekly Competitor Report on Starter+',
                  'Uptime, SSL, and domain expiry alerts included',
                  'See pricing details',
                ].map((item, i) =>
                  i === 5 ? (
                    <Link key={item} href="/pricing" className="flex items-start gap-2 text-[13px] text-brand-green-ink hover:underline">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </Link>
                  ) : (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-brand-dim">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Why Shopify stores look for a ChangeTower alternative</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">ChangeTower is a generic monitor. Ecommerce competitor tracking needs more context than a diff.</p>
          </div>
          <div className="space-y-4">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon covers instead</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              The same content-plus-uptime combo, built around the fields that actually matter for an ecommerce competitor.
            </p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[660px] mx-auto">
            {BEACONMON_WINS.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-xl px-5 py-4">
                <CheckIcon className="mt-[2px] shrink-0 text-brand-green-ink" />
                <p className="text-brand-dim text-[14px] leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center text-brand-muted text-[13px] mt-6">
            Want to track competitor prices specifically?{' '}
            <Link href="/competitor-price-tracking" className="text-brand-green-ink hover:underline">
              See how competitor price tracking works in Beaconmon →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where ChangeTower still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Be honest about this. If ChangeTower is the right fit, we will say so.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_CHANGETOWER_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center mt-8">
            <Link href="/vs/changetower" className="text-brand-green-ink text-[14px] hover:underline">
              Read the full Beaconmon vs ChangeTower comparison →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-3">{q}</h3>
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
            <Link href="/vs/changetower" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs ChangeTower</Link>
            <Link href="/alternatives/lurk" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to Lurk</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

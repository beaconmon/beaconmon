import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs ChangeTower for Shopify (2026)',
  description:
    'ChangeTower combines generic content and uptime monitoring from $9/mo. Beaconmon adds Shopify-native competitor price, promo, and stock tracking, from free.',
  alternates: { canonical: 'https://beaconmon.com/vs/changetower' },
  openGraph: { url: 'https://beaconmon.com/vs/changetower' },
};

const TABLE_ROWS = [
  {
    feature: 'Content change detection',
    beaconmon: '✓ Field-level, via CSS selectors',
    competitor: '✓ Generic page diffing',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Shopify / WooCommerce preset selectors',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Competitor price extraction',
    beaconmon: '✓ Labeled price, stock, promo fields',
    competitor: 'Detects the page changed, not the field',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'AI significance scoring',
    beaconmon: '✓ Growth+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'Not confirmed',
    beaconmonGood: true,
  },
  {
    feature: 'Works for non-ecommerce sites',
    beaconmon: 'Possible via manual selectors, not the focus',
    competitor: '✓ General-purpose',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: '3 URLs',
    beaconmonGood: true,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: '$9/mo',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You are not monitoring an ecommerce store.',
    body: 'ChangeTower is a general-purpose tool built for any website: government pages, legal terms, job listings, news. If your monitoring needs span beyond competitor storefronts, its broader scope is a genuine advantage.',
  },
  {
    title: 'You only need to know that a page changed, not what changed.',
    body: 'For simple watch-and-notify use cases, generic diffing at $9/mo is a cheap, established option. ChangeTower has real G2 and Capterra presence and enterprise plans for teams that need SLAs.',
  },
  {
    title: 'You want the lowest possible entry price for content plus uptime.',
    body: "ChangeTower's $9/mo tier undercuts Beaconmon Starter if competitor-specific context is not a requirement.",
  },
];

const SWITCH_REASONS = [
  'You want to know the price dropped from $48 to $42, not just that a competitor page looks different. Field-level CSS-selector targeting gets you the labeled value, not a raw diff.',
  'Setting up competitor monitoring should not mean manually selecting a region on every product page. Beaconmon\'s Shopify and WooCommerce presets do that for you.',
  'A Weekly Competitor Report rolls every change into one digest instead of a stream of per-page notifications to sort through.',
  'AI significance scoring on Growth and Scale tells you which changes are worth acting on, not just that something moved.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the core difference between ChangeTower and Beaconmon?',
    a: 'Both combine content-change and uptime monitoring in one subscription, the closest positioning match between any tool in this space and Beaconmon. The difference is depth: ChangeTower is a generic page-diff tool that works on any website, while Beaconmon extracts specific fields (price, stock, promo copy) using Shopify and WooCommerce presets.',
  },
  {
    q: 'Is ChangeTower cheaper than Beaconmon?',
    a: "At the entry tier, yes. ChangeTower starts at $9/mo versus Beaconmon Starter at $29/mo. But Beaconmon's free plan (10 monitors, 1 competitor, no card required) covers more real ecommerce use cases than ChangeTower's 3-URL free plan, and the paid tier adds ecommerce-specific context ChangeTower does not have at any price.",
  },
  {
    q: 'Does ChangeTower have Shopify-specific features?',
    a: 'No. ChangeTower is a general-purpose content and uptime monitor with no ecommerce presets. You would configure a generic page-region watch yourself for each competitor product page, and it would flag that something changed without labeling what field moved.',
  },
  {
    q: 'Can I use Beaconmon to monitor non-ecommerce websites like ChangeTower does?',
    a: "Technically, yes, with manual CSS selectors on any URL. But Beaconmon's presets, pricing, and Weekly Competitor Report are all built around ecommerce competitor tracking. If most of what you monitor is unrelated to a store, ChangeTower's general-purpose approach fits better.",
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/changetower',
      name: 'Beaconmon vs ChangeTower for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs ChangeTower', item: 'https://beaconmon.com/vs/changetower' },
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

export default function VsChangeTowerPage() {
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <Link href="/vs" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All comparisons
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Comparison</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Beaconmon vs ChangeTower<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            ChangeTower combines generic page-change detection with uptime monitoring for any website, starting at $9/mo. Beaconmon runs the same content-plus-uptime combo but built specifically for Shopify and WooCommerce competitor tracking, with field-level alerts instead of raw page diffs.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              ChangeTower is the right pick if you need to monitor a mix of ecommerce and non-ecommerce pages and want the cheapest possible combined content-and-uptime tool. Beaconmon is the right pick if every monitor is a Shopify or WooCommerce competitor and you want labeled price, stock, and promo alerts instead of a generic "this page changed" notification. The two share the same basic shape, content monitoring plus uptime in one subscription, which makes this the closest head-to-head positioning match in this comparison set.
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">Feature by feature</h2>
          </div>
          <div className="reveal overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1 max-w-[900px] mx-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft w-[40%]">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">ChangeTower</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(({ feature, beaconmon, competitor, beaconmonGood }, i) => (
                  <tr key={feature}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] font-medium ${beaconmonGood ? 'text-brand-green-ink' : 'text-brand-dim'} ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{beaconmon}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on ChangeTower
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                ChangeTower's broader scope is real. Here is where it fits better than Beaconmon.
              </p>
            </div>
            <div className="space-y-4">
              {STAY_REASONS.map(({ title, body }) => (
                <div key={title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-1">{title}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why some stores pick Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                A generic diff tells you something changed. An ecommerce store needs to know what.
              </p>
            </div>
            <ul className="space-y-4">
              {SWITCH_REASONS.map((reason, i) => (
                <li key={i} className="reveal flex items-start gap-3 text-[14px] text-brand-dim">
                  <CheckIcon />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-6">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="reveal border-b border-brand-line-soft pb-6">
                  <p className="text-[15px] font-semibold text-brand-text mb-2">{q}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{a}</p>
                </div>
              ))}
            </div>
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
            <Link href="/vs/lurk" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Lurk</Link>
            <Link href="/vs/changedetection-io" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs changedetection.io</Link>
            <Link href="/alternatives/changetower" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to ChangeTower</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

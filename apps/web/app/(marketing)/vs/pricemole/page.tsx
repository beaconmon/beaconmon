import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs PriceMole for Shopify (2026)',
  description:
    'PriceMole starts at $99/mo with no free plan. Beaconmon monitors competitor prices, promos, and uptime from free, Starter at $29/mo.',
  alternates: { canonical: 'https://beaconmon.com/vs/pricemole' },
  openGraph: { url: 'https://beaconmon.com/vs/pricemole' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Anti-bot crawling',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (adjusts your prices)',
    beaconmon: 'No',
    competitor: '✓ AI dynamic pricing rules',
    beaconmonGood: false,
  },
  {
    feature: 'Marketplace tracking (Amazon, eBay, Walmart)',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'MAP compliance monitoring',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Promotional copy and banner monitoring',
    beaconmon: '✓ Any content element',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'None (14-day trial only)',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: '$29/mo',
    competitor: '$99/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You sell across Amazon, eBay, and Walmart, not just your own store.',
    body: 'PriceMole tracks pricing across multiple marketplaces and channels alongside your direct competitors. Beaconmon monitors competitor websites only, not marketplace listings.',
  },
  {
    title: 'You need MAP compliance monitoring.',
    body: 'If resellers or distributors are violating minimum advertised price agreements, PriceMole flags it. Beaconmon has no MAP-specific workflow.',
  },
  {
    title: 'You want an embeddable price comparison widget.',
    body: 'PriceMole lets you show competitor prices directly on your own product pages. That is a distinct feature Beaconmon does not offer.',
  },
];

const SWITCH_REASONS = [
  'PriceMole starts at $99/mo with no free plan, only a 14-day trial. Beaconmon is free to start and $29/mo unlocks unlimited competitors.',
  'A competitor changing their promo copy or homepage banner matters even when price does not move. PriceMole tracks price, not content.',
  'Your own store\'s uptime is worth watching too. PriceMole has no uptime monitoring. Beaconmon covers both in one subscription.',
  'You want a Weekly Competitor Report that summarizes every change in one place, not a dashboard you have to check.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between PriceMole and Beaconmon?',
    a: 'PriceMole is a repricing and marketplace price intelligence tool, tracking Google Shopping, Amazon, eBay, and Walmart alongside direct competitors, then adjusting your prices with AI rules. Beaconmon monitors competitor websites for price, promotional content, and page changes, then alerts you or sends a weekly digest. Beaconmon also monitors your own store\'s uptime and SSL status. PriceMole does not.',
  },
  {
    q: 'Does Beaconmon have a free plan like PriceMole?',
    a: 'Beaconmon has a genuine free plan: 10 monitors and 1 competitor, no time limit, no card required. PriceMole has no free plan, only a 14-day trial before its $99/mo Starter tier kicks in.',
  },
  {
    q: 'Is PriceMole better for marketplace price tracking?',
    a: 'Yes. If your pricing strategy spans Amazon, eBay, Walmart, and Google Shopping, PriceMole is purpose-built for that. Beaconmon tracks direct competitor websites only.',
  },
  {
    q: 'Can I use Beaconmon instead of PriceMole if I just want alerts, not repricing?',
    a: 'Yes. If you want to know when a competitor changes a price or runs a promotion without any auto-repricing, Beaconmon covers that from free, and Starter at $29/mo is a fraction of PriceMole\'s $99/mo entry tier.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/pricemole',
      name: 'Beaconmon vs PriceMole for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs PriceMole', item: 'https://beaconmon.com/vs/pricemole' },
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

export default function VsPriceMolePage() {
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
            Beaconmon vs PriceMole<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            PriceMole tracks and adjusts prices across your store, Google Shopping, Amazon, eBay, and Walmart, starting at $99/mo. Beaconmon monitors direct competitor prices, promos, and content changes, plus your own store\'s uptime, starting free. Different scope, different price, and one has no free plan.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              PriceMole earns its 4.8 stars from stores that sell across marketplaces and need MAP compliance plus automated repricing across every channel. That is a real, well-served use case at $99 to $499/mo. Beaconmon is built for stores that want to watch competitor websites, promotions, and their own uptime without paying for marketplace tracking they will not use. If your business lives on Shopify and a handful of direct competitors, Beaconmon is the cheaper, simpler tool for that job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">PriceMole</th>
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
                When to stay on PriceMole
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                PriceMole covers ground Beaconmon has no plans to cover. Here is where the $99/mo starts to pay for itself.
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
                Why smaller stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most Shopify stores watch a handful of direct competitors, not five marketplaces at once.
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
            <Link href="/vs/pricefy" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pricefy</Link>
            <Link href="/vs/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceOtus</Link>
            <Link href="/alternatives/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to PriceMole</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

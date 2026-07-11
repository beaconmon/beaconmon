import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs PriceOtus for Shopify (2026)',
  description:
    'PriceOtus auto-reprices from a 5-product free plan. Beaconmon monitors competitor prices, promos, and uptime with 10 monitors free, Starter at $29/mo.',
  alternates: { canonical: 'https://beaconmon.com/vs/priceotus' },
  openGraph: { url: 'https://beaconmon.com/vs/priceotus' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Channel-based tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (adjusts your prices)',
    beaconmon: 'No',
    competitor: '✓ Rule-based repricing',
    beaconmonGood: false,
  },
  {
    feature: 'Variant-level price comparison',
    beaconmon: 'Per-page selector',
    competitor: '✓ Built for variants',
    beaconmonGood: false,
  },
  {
    feature: 'Price history charts',
    beaconmon: 'Change log',
    competitor: '✓ Dedicated charts',
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
    competitor: '5 products, 1 competitor per product',
    beaconmonGood: true,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: '$39/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You want automated repricing on a tight budget.',
    body: 'PriceOtus is the cheapest dedicated repricing app in this comparison set, with a Pro tier at $39/mo for 200 products. If automated price adjustment is what you need and you are cost-conscious, PriceOtus is a real option.',
  },
  {
    title: 'You sell products with many variants.',
    body: 'PriceOtus is built to compare pricing across product variants, sizes, colors, bundles, in a way Beaconmon\'s page-level monitoring does not replicate natively.',
  },
  {
    title: 'You want visual price history charts out of the box.',
    body: 'PriceOtus renders price history as charts per product. Beaconmon logs changes in a timeline but does not build dedicated charting.',
  },
];

const SWITCH_REASONS = [
  'A competitor\'s new promo banner or rewritten product copy matters as much as a price change. PriceOtus tracks price only.',
  'Your own store going down costs more than most competitor price moves. PriceOtus has no uptime monitoring. Beaconmon covers both.',
  'You want to see what changed and decide your own response, not hand pricing decisions to a rules engine.',
  'You want a Weekly Competitor Report that rolls every change into one digest, not per-product price alerts to sort through.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the core difference between PriceOtus and Beaconmon?',
    a: 'PriceOtus tracks competitor prices per product and variant, then can auto-adjust your prices with rules. Beaconmon tracks competitor prices, promotions, and page content, then alerts you or sends a weekly digest without touching your prices. Beaconmon also monitors your store\'s uptime and SSL status.',
  },
  {
    q: 'Does Beaconmon auto-reprice like PriceOtus does?',
    a: 'No. Beaconmon is a monitoring tool by design. If you want your Shopify prices to adjust automatically when a competitor moves, PriceOtus, Pricefy, or PriceMole are built for that.',
  },
  {
    q: 'Which has the more generous free plan?',
    a: 'PriceOtus\'s free plan covers 5 products with 1 competitor each, checked once daily. Beaconmon\'s free plan covers 10 monitors and 1 competitor with hourly checks on paid plans. Neither free plan is built for a large catalog.',
  },
  {
    q: 'Can I run Beaconmon and PriceOtus together?',
    a: 'Yes. Some stores use Beaconmon for promo and content monitoring plus uptime alerts, and PriceOtus for automated repricing on their core catalog.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/priceotus',
      name: 'Beaconmon vs PriceOtus for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs PriceOtus', item: 'https://beaconmon.com/vs/priceotus' },
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

export default function VsPriceOtusPage() {
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
            Beaconmon vs PriceOtus<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            PriceOtus discovers and matches competitor products, then reprices yours with rules you set. Beaconmon watches competitor prices, promotions, and page content, and adds uptime and SSL monitoring to the same plan. One adjusts your prices automatically. The other tells you what moved and leaves the decision with you.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              PriceOtus is a smaller player, 13 reviews at a perfect 5.0 stars, but its tiering is honest and its repricing automation is real. If you want prices to adjust on their own and your catalog has meaningful variant complexity, PriceOtus is worth trying. Beaconmon does not compete on repricing at all. It is the tool for stores that want to see every competitor move, price and otherwise, and keep a human in the loop on what to do about it.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">PriceOtus</th>
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
                When to stay on PriceOtus
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                A small review count with a perfect rating is worth paying attention to. Here is where PriceOtus fits.
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
                Repricing automation is not for everyone. Some stores just want visibility.
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
            <Link href="/vs/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceMole</Link>
            <Link href="/vs/pricefy" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pricefy</Link>
            <Link href="/alternatives/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to PriceOtus</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

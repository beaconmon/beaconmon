import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Pricefy for Shopify (2026)',
  description:
    'Pricefy auto-reprices your Shopify catalog from $49/mo. Beaconmon monitors competitor prices, promos, and uptime without touching your prices, from free.',
  alternates: { canonical: 'https://beaconmon.com/vs/pricefy' },
  openGraph: { url: 'https://beaconmon.com/vs/pricefy' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ AI auto-matching',
    beaconmonGood: false,
  },
  {
    feature: 'Automatic competitor product discovery',
    beaconmon: 'Manual selector setup',
    competitor: '✓ AI discovery and matching',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (adjusts your prices)',
    beaconmon: 'No',
    competitor: '✓ Rule-based repricing',
    beaconmonGood: false,
  },
  {
    feature: 'Google Shopping / Channable integration',
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
    competitor: '50 SKUs, 3 competitors',
    beaconmonGood: false,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: '$49/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You want your prices to move on their own.',
    body: 'Pricefy is built around automated repricing. Set a rule, and when a tracked competitor drops their price, your Shopify price adjusts within the constraints you define. Beaconmon does not touch your prices. It tells you what happened and leaves the decision to you.',
  },
  {
    title: 'Your catalog is too large to match manually.',
    body: 'Pricefy uses AI to find and match competitor products against your SKUs automatically, which matters once you are past a few hundred products. Beaconmon relies on selectors you configure per monitored page, which stays manageable for a focused competitor list but becomes work at catalog scale.',
  },
  {
    title: 'You already sell through Google Shopping or Channable.',
    body: 'Pricefy plugs into Google Shopping and Channable feeds directly. If your pricing strategy already runs through those channels, that native integration is worth something Beaconmon does not offer.',
  },
];

const SWITCH_REASONS = [
  'A competitor rewriting their homepage copy or launching a flash sale matters to your business even when no price changes. Pricefy has no content or promo monitoring built in.',
  'Your own store going down costs you more per hour than most competitor price moves. Pricefy has no uptime monitoring. Beaconmon watches both from one dashboard.',
  'You want to see a change and decide what to do with it, not hand pricing decisions to a rules engine. Some stores want that control.',
  'You want a Weekly Competitor Report that rolls up every change, not a stream of individual price alerts to sort through.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the core difference between Pricefy and Beaconmon?',
    a: 'Pricefy watches competitor prices and adjusts yours automatically based on rules you set. Beaconmon watches competitor prices, promotions, and page content, then alerts you or sends a weekly digest. Beaconmon does not change your prices. Pricefy does not track promotional content or your store\'s uptime.',
  },
  {
    q: 'Does Beaconmon auto-reprice like Pricefy does?',
    a: 'No, and that is intentional. Beaconmon is a monitoring tool. If you want your Shopify prices to adjust automatically when a competitor moves, Pricefy, PriceMole, or PriceOtus are built for that. Beaconmon tells you the change happened and you make the call.',
  },
  {
    q: 'Is Beaconmon cheaper than Pricefy?',
    a: 'For monitoring-only use, yes. Beaconmon Starter is $29/mo versus Pricefy at $49/mo, and Beaconmon has a free plan Pricefy also offers at a similar scope. Pricefy\'s higher tiers ($99 and $189/mo) unlock more SKUs and repricing rules that Beaconmon does not compete on, because it is not a repricing tool.',
  },
  {
    q: 'Can I run Beaconmon and Pricefy at the same time?',
    a: 'Yes. Some stores use Beaconmon for the promo and content monitoring plus uptime alerts, and Pricefy for the repricing automation on their core catalog. The two do not overlap much in what they actually do.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/pricefy',
      name: 'Beaconmon vs Pricefy for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Pricefy', item: 'https://beaconmon.com/vs/pricefy' },
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

export default function VsPricefyPage() {
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
            Beaconmon vs Pricefy<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Pricefy auto-reprices your Shopify catalog against tracked competitors. Beaconmon watches competitor prices, promotions, and page content, and adds uptime and SSL monitoring to the same subscription. One changes your prices for you. The other tells you what to look at and lets you decide.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Pricefy is the right pick if you want your Shopify prices to adjust automatically when competitors move, and your catalog is large enough that AI product matching saves real time. Beaconmon is the right pick if you want to know when a competitor changes anything, price, promo copy, stock status, and want that alongside uptime monitoring, without an algorithm touching your prices. 80 reviews at 4.7 stars tells you Pricefy has real traction with stores that want the automation. Not every store does.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Pricefy</th>
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
                When to stay on Pricefy
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Pricefy does things Beaconmon has no intention of doing. Here is where it earns its 4.7 stars.
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
                Not every store wants an algorithm setting prices. Some just want to see what competitors are doing.
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
            <Link href="/vs/intelis" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Intelis</Link>
            <Link href="/alternatives/pricefy" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to Pricefy</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

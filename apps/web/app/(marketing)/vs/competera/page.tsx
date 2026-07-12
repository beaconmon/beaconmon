import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Competera for Shopify Stores (2026)',
  description:
    'Competera is enterprise AI repricing, sales call only, no public pricing. Beaconmon monitors competitor prices, promos, and uptime, free to start, self-serve.',
  alternates: { canonical: 'https://beaconmon.com/vs/competera' },
  openGraph: { url: 'https://beaconmon.com/vs/competera' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ AI-driven crawling, refreshed roughly every 2 hours',
    beaconmonGood: false,
  },
  {
    feature: 'Elasticity-based AI price optimization',
    beaconmon: 'No',
    competitor: '✓ ML-driven, models price sensitivity',
    beaconmonGood: false,
  },
  {
    feature: 'Rule-based repricing engine',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'KVI (key value item) management',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Promotional copy and content monitoring',
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
    feature: 'Self-serve signup',
    beaconmon: '✓ Free, no card required',
    competitor: 'No, sales call required',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo, self-serve signup',
    competitor: 'Custom quote, sales call required',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You need elasticity-based AI price optimization across a large catalog.',
    body: "Competera models how demand responds to price changes and uses that to recommend or automatically apply price adjustments. If you are running price sensitivity modeling across thousands of SKUs, that is a genuinely different capability than Beaconmon offers. Beaconmon monitors and alerts, it does not optimize or set prices for you.",
  },
  {
    title: 'You manage key value items (KVIs) across a large assortment.',
    body: 'Competera\'s KVI management identifies which products in your catalog are the most price-sensitive to shoppers, so you can prioritize where competitive pricing accuracy matters most. This is built for retailers with assortments too large to review manually, which is not the problem Beaconmon is built to solve.',
  },
  {
    title: 'You run a large multi-location retail chain on an in-house catalog or ERP.',
    body: 'Competera is platform-agnostic and built for enterprise retailers in categories like automotive, grocery, and apparel, often with catalogs that live in an ERP rather than Shopify or WooCommerce. Beaconmon is built specifically for Shopify and WooCommerce stores, and is not designed for ERP-scale catalog integration.',
  },
];

const SWITCH_REASONS = [
  'Competera has no public pricing. Getting a quote means booking a sales call and going through a market test. Beaconmon shows its pricing openly and you can sign up free in minutes.',
  'Competera\'s site targets enterprise retailers in categories like automotive, grocery, and apparel chains, with no SMB tier and no mention of Shopify or WooCommerce anywhere. Beaconmon is built for Shopify and WooCommerce stores from day one.',
  'You want to know when a competitor changes promotional copy or a homepage banner, not just when a price number moves. Competera is focused on price data, not broader content changes.',
  'You want your own store\'s uptime and SSL expiry covered in the same subscription as competitor monitoring, instead of a separate tool.',
  'You want a Weekly Competitor Report delivered to Slack or email that summarizes changes, not an enterprise dashboard built for a pricing analyst team.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Competera and Beaconmon?',
    a: 'Competera is an enterprise AI-driven dynamic pricing and repricing platform built for large retailers. It tracks competitor prices, uses elasticity-based machine learning to optimize prices, and can apply rule-based repricing automatically, refreshing data roughly every 2 hours. Beaconmon is a competitor monitoring and alerting tool for Shopify and WooCommerce stores: it tracks price, promotional content, and page changes, then notifies you or sends a weekly digest. Beaconmon does not optimize or set prices for you.',
  },
  {
    q: 'How much does Competera cost compared to Beaconmon?',
    a: 'Competera does not publish pricing. Getting a number requires a sales call and a market test process. Beaconmon publishes its pricing openly: free for 10 monitors and 1 competitor, then $29/mo for the Starter plan, with self-serve signup and no card required to start.',
  },
  {
    q: 'Is Competera built for Shopify or WooCommerce stores?',
    a: 'No mentions of Shopify or WooCommerce appear anywhere on Competera\'s site. It is platform-agnostic and built for large retailers with in-house catalogs or ERP systems, targeting categories like automotive, grocery, and apparel chains rather than SMB e-commerce stores. Beaconmon is built specifically for Shopify and WooCommerce.',
  },
  {
    q: 'Should a small or mid-size store use Competera instead of Beaconmon?',
    a: 'Probably not. Competera is designed for enterprise retailers managing price elasticity and KVIs across large assortments, with no SMB tier and a sales-call-only signup process. If you are a Shopify or WooCommerce store that wants to watch a handful of direct competitors and your own uptime without an enterprise sales cycle, Beaconmon is the simpler, self-serve fit.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/competera',
      name: 'Beaconmon vs Competera for Shopify Stores (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Competera', item: 'https://beaconmon.com/vs/competera' },
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

export default function VsCompeteraPage() {
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
          <Link href="/vs" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All comparisons
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Comparison</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Beaconmon vs Competera<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Competera is an enterprise AI repricing platform built for large retailers, with elasticity-based price optimization and KVI management, priced through a sales call with no public number. Beaconmon monitors competitor prices, promotions, and content for Shopify and WooCommerce stores, plus your own uptime, starting free with self-serve signup. Different scale, different buying process, different price.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Competera is a serious tool for large retailers who need elasticity-based price optimization, KVI management, and automated repricing across a big catalog. That is a real, well-served use case, sold through an enterprise sales process with no public pricing. Beaconmon is built for a different buyer: a Shopify or WooCommerce store that wants to watch a handful of direct competitors and its own uptime, sign up in minutes, and see the price before talking to anyone.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison table */}
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Competera</th>
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

      {/* When to stay on Competera */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When Competera is the right choice
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Competera covers ground that Beaconmon does not attempt to cover. Here is where the enterprise sales process and price tag start to make sense.
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

      {/* Why people switch */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why Shopify and WooCommerce stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores evaluating Competera are not enterprise retailers with an ERP catalog, they just want to know what a few direct competitors are doing.
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

      {/* Quote */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <blockquote className="reveal max-w-[700px] mx-auto border-l-2 border-brand-green-ink pl-8 py-2">
            <p className="text-[18px] leading-[1.7] text-brand-dim italic mb-4">
              &ldquo;We booked a call with Competera and it was clear halfway through that we were the wrong size customer. We just wanted to know when two competitors changed their prices, not a full repricing engine. Beaconmon was live in under ten minutes, no call required.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, apparel, mid 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Choosing Beaconmon instead of an enterprise sales cycle
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                If you started looking at Competera and realized you just need competitor visibility, not a repricing engine, the switch to Beaconmon is quick.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'List the competitors you actually care about watching. Most Shopify and WooCommerce stores track a handful of direct competitors, not a full category.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required, no sales call). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages you want to watch: product pages, category pages, pricing pages. The wizard suggests CSS selectors for price and availability on Shopify and WooCommerce stores.' },
                { step: '4', text: 'Turn on your own store\'s uptime and SSL expiry monitoring in the same setup, at no extra cost on paid plans.' },
                { step: '5', text: 'Configure your Weekly Competitor Report in Slack or email so changes land in your inbox instead of a dashboard you have to check.' },
              ].map(({ step, text }) => (
                <li key={step} className="reveal flex items-start gap-4 text-[14px] text-brand-dim">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(0,229,122,0.12)] text-brand-green-ink text-[12px] font-bold flex items-center justify-center mt-0.5">{step}</span>
                  <span className="leading-[1.6] pt-1">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
            Try Beaconmon free.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">
              See the Shopify-specific setup →
            </Link>
          </p>
        </div>
      </section>

      {/* See also */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceMole</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceOtus</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

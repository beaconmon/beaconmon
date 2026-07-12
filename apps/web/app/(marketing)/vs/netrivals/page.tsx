import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs NetRivals for Shopify Stores (2026)',
  description:
    'NetRivals is enterprise price intelligence and repricing, quote only, no self-serve signup. Beaconmon monitors prices, content, and uptime, free to start.',
  alternates: { canonical: 'https://beaconmon.com/vs/netrivals' },
  openGraph: { url: 'https://beaconmon.com/vs/netrivals' },
};

const TABLE_ROWS = [
  {
    feature: 'Large-scale catalog price monitoring',
    beaconmon: 'CSS-selector targeting per URL',
    competitor: '✓ Marketplace and catalog scale',
    beaconmonGood: false,
  },
  {
    feature: 'MAP / RRP compliance alerts',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Repricing engine integration',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Dynamic pricing recommendations',
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
    competitor: 'No, demo call required',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo, self-serve signup',
    competitor: 'Custom quote, not publicly listed',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You need marketplace-scale price monitoring across a large catalog.',
    body: 'NetRivals is built to track prices across marketplaces and competitor sites at a scale most small stores never approach, thousands of SKUs monitored continuously. Beaconmon targets specific pages you point it at, which is the right fit for a handful of direct competitors, not a full marketplace sweep.',
  },
  {
    title: 'You need MAP or RRP compliance alerts.',
    body: 'If you are a brand enforcing minimum advertised price or recommended retail price across a network of resellers, NetRivals flags violations directly. Beaconmon has no compliance alerting built for that use case.',
  },
  {
    title: 'You want repricing engine integration and dynamic pricing recommendations.',
    body: 'NetRivals connects price intelligence to a repricing engine so pricing decisions can be automated or recommended based on market data. Beaconmon monitors and alerts, it does not feed a repricing system or recommend price changes.',
  },
  {
    title: 'You run a mid-market or enterprise retail operation with dedicated pricing staff.',
    body: 'NetRivals is sold through a demo call with custom onboarding and dedicated account management, which fits a retailer with a pricing team evaluating vendors. Beaconmon is built for a solo founder or small team who wants to sign up and start monitoring the same day.',
  },
];

const SWITCH_REASONS = [
  'NetRivals has no publicly listed pricing and no self-serve signup. Getting a number means booking a demo call. Beaconmon shows its pricing openly and you can sign up free in minutes.',
  'NetRivals is built for mid-market and enterprise retailers and brands, not solo Shopify or WooCommerce store owners. Beaconmon is built specifically for small e-commerce teams from day one.',
  'NetRivals is a pricing-intelligence-only tool. It does not track promotional copy, product listing changes, or general page content, and it does not monitor your own store uptime or SSL and domain expiry.',
  'Beaconmon covers competitor price and content monitoring plus your own store uptime and SSL and domain expiry in one subscription, instead of a separate enterprise pricing platform.',
  'The Weekly Competitor Report gives you a plain-language summary of every change detected, sent to email or Slack, instead of an enterprise dashboard built for a dedicated pricing analyst.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between NetRivals and Beaconmon?',
    a: 'NetRivals is a Barcelona-based competitive price intelligence platform built for mid-market and enterprise retailers and brands. It monitors prices across marketplaces and competitor sites at catalog scale, alerts on MAP and RRP compliance, and integrates with repricing engines for dynamic pricing recommendations. Beaconmon is a self-serve monitoring tool for Shopify and WooCommerce stores that tracks competitor prices, promotional content, and page changes, plus your own store uptime and SSL and domain expiry, with alerts sent to email or Slack.',
  },
  {
    q: 'How much does NetRivals cost compared to Beaconmon?',
    a: 'NetRivals does not publish pricing. It is custom and quote-based, requiring a demo call and onboarding process. Beaconmon publishes its pricing openly: free for 10 monitors and 1 competitor, then $29/mo for the Starter plan, with self-serve signup and no card required to start.',
  },
  {
    q: 'Does NetRivals require a sales call to get started?',
    a: 'Yes. NetRivals is sales-led with quote-only pricing, a required demo call, custom onboarding, and dedicated account management. There is no self-serve signup and no free trial. Beaconmon has a permanent free plan you can activate without talking to anyone.',
  },
  {
    q: 'Can NetRivals track uptime, SSL expiry, or general content changes?',
    a: 'No. NetRivals is a pricing-intelligence-only platform focused on catalog price monitoring, MAP compliance, and repricing. It does not do uptime or downtime monitoring, SSL or domain expiry tracking, or content monitoring outside of pricing and catalog data. Beaconmon covers all three alongside competitor price tracking.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/netrivals',
      name: 'Beaconmon vs NetRivals for Shopify Stores (2026)',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs NetRivals', item: 'https://beaconmon.com/vs/netrivals' },
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

export default function VsNetRivalsPage() {
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
            Beaconmon vs NetRivals<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            NetRivals is a Barcelona-based competitive price intelligence platform built for mid-market and enterprise retailers, with catalog-scale price monitoring, MAP compliance, and repricing engine integration, sold through a demo call with pricing that is custom and not publicly listed. Beaconmon monitors competitor prices, promotions, and content for Shopify and WooCommerce stores, plus your own uptime, starting free with self-serve signup. Different scale, different buying process, different price.
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
              NetRivals is a serious tool for mid-market and enterprise retailers that need catalog-scale price monitoring, MAP compliance alerts, and repricing engine integration. That is a real use case, sold through an enterprise sales process with no public pricing. Beaconmon is built for a different buyer: a Shopify or WooCommerce store that wants to watch a handful of direct competitors and its own uptime, sign up in minutes, and see the price before talking to anyone.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">NetRivals</th>
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

      {/* When to stay on NetRivals */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When NetRivals is the right choice
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                NetRivals covers ground that Beaconmon does not attempt to cover. Here is where the enterprise sales process and price tag start to make sense.
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
                Most stores evaluating NetRivals are not mid-market or enterprise retailers with a dedicated pricing team, they just want to know what a few direct competitors are doing.
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
              &ldquo;We booked a demo with NetRivals and it was clear we were the wrong size customer. They wanted to talk about MAP compliance across a catalog we do not have. We just wanted to know when two competitors changed their prices. Beaconmon was live the same afternoon, no call required.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, home goods, mid 2026</cite>
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
                If you started looking at NetRivals and realized you just need competitor visibility, not a repricing engine or MAP compliance system, the switch to Beaconmon is quick.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'List the competitors you actually care about watching. Most Shopify and WooCommerce stores track a handful of direct competitors, not a full marketplace catalog.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required, no demo call). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages you want to watch: product pages, category pages, pricing pages. The wizard suggests CSS selectors for price and availability on Shopify and WooCommerce stores.' },
                { step: '4', text: 'Turn on your own store\'s uptime and SSL and domain expiry monitoring in the same setup, at no extra cost on paid plans.' },
                { step: '5', text: 'Configure your Weekly Competitor Report in Slack or email so changes land in your inbox instead of a dashboard built for a pricing analyst team.' },
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
            <Link href="/vs/competera" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Competera</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/priceva" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Priceva</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

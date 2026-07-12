import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Wiser for Shopify Stores (2026)',
  description:
    'Wiser is an enterprise price intelligence platform with no published pricing and no self-serve signup. Beaconmon monitors competitor prices and promos free, Starter at $29/mo.',
  alternates: { canonical: 'https://beaconmon.com/vs/wiser' },
  openGraph: { url: 'https://beaconmon.com/vs/wiser' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Crawling at massive scale',
    beaconmonGood: false,
  },
  {
    feature: 'Scale (products tracked)',
    beaconmon: 'Built for a handful of direct competitors',
    competitor: '✓ Claims 10B+ products, 200M+ prices daily',
    beaconmonGood: false,
  },
  {
    feature: 'Data refresh frequency',
    beaconmon: 'Plan-based interval',
    competitor: '✓ Hourly',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (pushes to your listings)',
    beaconmon: 'No',
    competitor: '✓ Direct push to Amazon, eBay, Magento',
    beaconmonGood: false,
  },
  {
    feature: 'Promotional copy and banner monitoring',
    beaconmon: '✓ Any content element',
    competitor: 'Not the focus',
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
    feature: 'Enterprise SSO and access controls',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Self-serve signup',
    beaconmon: '✓ Instant, no sales call',
    competitor: 'No, sales call required',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo, self-serve signup',
    competitor: 'Not published, sales call required (third-party estimates suggest $699+/mo)',
    beaconmonGood: true,
  },
];

const WISER_STRENGTHS = [
  {
    title: 'You operate at massive scale across billions of SKUs.',
    body: 'Wiser claims 10B+ products and 200M+ prices tracked daily, with customer logos like Best Buy, Home Depot, and Tractor Supply. That kind of catalogue scale and cross-channel coverage is a genuine strength for a large multi-channel retailer. Beaconmon is built to watch a handful of direct competitor sites, not millions of SKUs.',
  },
  {
    title: 'You need repricing pushed directly to Amazon, eBay, and Magento.',
    body: 'Wiser can push price changes straight into your marketplace listings on Amazon, eBay, and Magento with hourly data refresh. Beaconmon sends you an alert when a competitor changes their price; it does not adjust or push anything to your own listings.',
  },
  {
    title: 'You need enterprise SSO and access controls.',
    body: 'Wiser is built for large organizations, with SSO and enterprise-grade access controls for teams that need that level of governance. Beaconmon does not offer SSO at this time, so a large enterprise IT team with strict access requirements is better served by Wiser.',
  },
];

const SWITCH_REASONS = [
  'Wiser has no published pricing and no self-serve signup, only a sales call. Beaconmon is free to start and you can sign up right now, no call required.',
  'You track a handful of direct competitors, not a catalogue of millions of SKUs. Wiser is built for enterprise retailers running massive multi-channel operations, which is more than most Shopify stores need.',
  'You want promotional copy, banner, and page content changes tracked, not just a price number. Wiser is focused on price data and repricing, not surrounding content.',
  'You want your own store\'s uptime and SSL expiry watched too, in the same subscription. Wiser has no uptime monitoring.',
  'You don\'t need automated repricing pushed to marketplaces. You want an alert you can review and act on yourself, at a price a single-store operator can justify.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Wiser and Beaconmon?',
    a: 'Wiser is an enterprise price intelligence and repricing platform, built to track billions of products and push automated price changes directly to marketplaces like Amazon, eBay, and Magento. Beaconmon is a competitor monitoring tool built for individual Shopify and WooCommerce stores, tracking competitor prices, promotional content, and page changes, plus your own store\'s uptime and SSL status. Wiser operates at a scale and price point built for large retailers. Beaconmon is priced and scoped for a single store watching a handful of direct competitors.',
  },
  {
    q: 'Does Wiser have a free plan or self-serve signup like Beaconmon?',
    a: 'No. Wiser does not publish pricing on its site and requires a sales call to get a quote, with no self-serve signup found. Beaconmon has a genuine free plan, 10 monitors and 1 competitor, no time limit and no card required, and you can sign up in minutes.',
  },
  {
    q: 'Is Wiser better for large multi-channel retailers?',
    a: 'Yes, for that use case Wiser is purpose-built. It claims to track over 10 billion products and 200 million prices daily, refreshes hourly, and can push repricing directly to Amazon, eBay, and Magento. Its customer base, including names like Best Buy and Home Depot, reflects an enterprise focus with SSO and enterprise-grade access controls. Beaconmon does not compete at that scale.',
  },
  {
    q: 'Can I use Beaconmon instead of Wiser if I run a small or mid-size Shopify store?',
    a: 'In most cases, yes. If you want to know when a specific competitor changes a price or runs a promotion, without a sales call, without published enterprise pricing, and without needing automated repricing across marketplaces, Beaconmon covers that from free, with Starter at $29/mo. Wiser\'s scale and repricing integrations are built for a different kind of business.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Wiser', item: 'https://beaconmon.com/vs/wiser' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    },
  ],
};

export default function VsWiserPage() {
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
            Beaconmon vs Wiser<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Wiser is an enterprise price intelligence and repricing platform, tracking billions of products for retailers like Best Buy and Home Depot, with hourly refresh and no published pricing, sales call required. Beaconmon monitors direct competitor prices, promos, and content changes, plus your own store\'s uptime, starting free with self-serve signup. Different scale, different audience, and one requires a sales call to even see a price.
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
              Wiser is a legitimate enterprise tool for large, multi-channel retailers that need to track billions of products and automate repricing across Amazon, eBay, and Magento. That scale and those integrations come with enterprise pricing and a sales-only process. Beaconmon is built for a single Shopify or WooCommerce store watching a handful of direct competitors, with a free plan, self-serve signup, and no sales call. If you are the size of Best Buy, Wiser fits. If you are a growing eCommerce store, Beaconmon is the tool built for your scale and your budget.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Wiser</th>
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

      {/* Where Wiser wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Wiser wins
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Wiser is a real enterprise platform with genuine strengths at a scale Beaconmon does not attempt to serve.
              </p>
            </div>
            <div className="space-y-4">
              {WISER_STRENGTHS.map(({ title, body }) => (
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
                Why smaller stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most Shopify stores watch a handful of direct competitors, not a catalogue of billions of products.
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
              &ldquo;We booked a call with Wiser to see pricing and realized halfway through that we just wanted to know when one competitor changed their price. Beaconmon let us sign up and set that up in five minutes, no call needed.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, US, switched early 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Wiser
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                If you were on a sales call with Wiser but have not signed, or you are simply evaluating whether you need enterprise-scale price intelligence, here is the faster path for a single-store setup.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'List the specific competitors and product or category pages you actually need to watch. Most single-store operators need a handful of pages, not a catalogue-wide feed.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required, no sales call). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages you want to watch. The wizard suggests CSS selectors for price and availability on Shopify and WooCommerce stores.' },
                { step: '4', text: 'Configure your Weekly Competitor Report in Slack or email so changes land in one summary instead of a dashboard you have to check.' },
                { step: '5', text: 'If you later grow into needing marketplace repricing across Amazon, eBay, and Magento at scale, that is when a platform like Wiser becomes worth the sales call.' },
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

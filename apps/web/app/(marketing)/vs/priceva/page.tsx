import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Priceva for Shopify Stores (2026)',
  description:
    'Priceva has a free tier and rule-based repricing across marketplaces. Beaconmon is Shopify/WooCommerce-native with uptime, SSL alerts, and a Weekly Competitor Report.',
  alternates: { canonical: 'https://beaconmon.com/vs/priceva' },
  openGraph: { url: 'https://beaconmon.com/vs/priceva' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Automated web scraping',
    beaconmonGood: false,
  },
  {
    feature: 'Auto-repricing (adjusts your prices)',
    beaconmon: 'No',
    competitor: '✓ Rule-based repricing',
    beaconmonGood: false,
  },
  {
    feature: 'MAP compliance monitoring',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Marketplace tracking (Amazon, eBay, Walmart, etc.)',
    beaconmon: 'No',
    competitor: '✓ 9 marketplaces + 10,000+ stores',
    beaconmonGood: false,
  },
  {
    feature: 'Shopify/WooCommerce-native monitor presets',
    beaconmon: '✓ Included',
    competitor: 'No explicit presets found',
    beaconmonGood: true,
  },
  {
    feature: 'Promotional copy and content monitoring',
    beaconmon: '✓ Any content element',
    competitor: 'No, price and availability focused',
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
    competitor: 'No weekly digest',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor, free forever',
    competitor: '20 products/competitors, 6,200 checks/mo, free forever',
    beaconmonGood: false,
  },
  {
    feature: 'Starting price (paid tier)',
    beaconmon: '$29/mo',
    competitor: '$99/mo (Business)',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You want automated repricing rules, not just alerts.',
    body: "Priceva's rule-based repricing engine can adjust your own prices automatically when a competitor moves. Beaconmon has no repricing feature. It sends the alert; acting on the price change is manual.",
  },
  {
    title: 'You need MAP compliance monitoring.',
    body: 'If resellers or distributors are violating minimum advertised price agreements, Priceva flags it out of the box. Beaconmon has no MAP-specific workflow.',
  },
  {
    title: 'You sell across marketplaces, not just your own store.',
    body: 'Priceva tracks Amazon, eBay, Walmart, Google Shopping, Home Depot, Costco, Wayfair, Target Plus, Newegg, and 10,000+ general online stores. Beaconmon monitors competitor websites you configure directly, not marketplace listings.',
  },
];

const SWITCH_REASONS = [
  'Your competitors are Shopify or WooCommerce stores, not marketplace listings. Beaconmon\'s onboarding suggests presets for these platforms; Priceva is a general-purpose scraper with no platform-specific setup.',
  'You want to know when a competitor changes promotional copy, a banner, or shipping messaging, not just when a price number moves. Priceva is price and availability focused.',
  'You want your own store\'s uptime and SSL/domain expiry watched too. Priceva has no uptime monitoring at all.',
  'You want a Weekly Competitor Report that summarizes every change, price, promo, and content, in one place, not a dashboard you have to check.',
  'You want competitor monitoring and uptime monitoring under one $29/mo subscription instead of jumping from Priceva\'s free 20-item cap straight to its $99/mo Business tier.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Priceva and Beaconmon?',
    a: 'Priceva is a price intelligence and repricing tool. It scrapes prices from your competitors and marketplaces like Amazon, eBay, and Walmart, then can automatically adjust your own prices with rule-based repricing. Beaconmon monitors competitor websites for price, promotional content, and page changes, tuned for Shopify and WooCommerce stores, and also watches your own store\'s uptime and SSL status. Priceva does not offer uptime monitoring.',
  },
  {
    q: 'Does Priceva have a free plan?',
    a: 'Yes. Priceva\'s Starter plan is genuinely free, no credit card required, covering up to 20 tracked products or competitors and 6,200 price checks per month. Beaconmon\'s free plan covers 10 monitors and 1 competitor, also free forever with no card required. Both have real free tiers.',
  },
  {
    q: 'Is Priceva better for repricing and marketplace tracking?',
    a: 'Yes. If you need rule-based automated repricing, MAP compliance monitoring, or coverage across Amazon, eBay, Walmart, and other marketplaces, Priceva is purpose-built for that. Beaconmon tracks direct competitor websites you configure and does not touch your pricing automatically.',
  },
  {
    q: 'Can I use Beaconmon instead of Priceva if I just want price and content alerts for a few direct competitors?',
    a: 'Yes. If you are tracking a handful of Shopify or WooCommerce competitors and want alerts on price, promo copy, and page changes without repricing or marketplace coverage, Beaconmon covers that from free, plus it watches your own store\'s uptime and SSL expiry in the same subscription.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/priceva',
      name: 'Beaconmon vs Priceva for Shopify Stores (2026)',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Priceva', item: 'https://beaconmon.com/vs/priceva' },
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

export default function VsPricevaPage() {
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
            Beaconmon vs Priceva<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Priceva tracks prices across marketplaces like Amazon, eBay, and Walmart plus 10,000+ stores, and can automatically reprice your products with rule-based rules, starting from a genuine free tier. Beaconmon watches direct competitor websites for price, promo, and content changes with Shopify and WooCommerce presets, plus your own store\'s uptime and SSL status, also starting free. Different scope, and only one of them touches your pricing automatically.
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
              Choose Priceva if you need automated repricing, MAP compliance monitoring, or price tracking across Amazon, eBay, Walmart, and other marketplaces, its 4.6-star G2 rating reflects real strengths there, plus a genuinely free entry tier. Choose Beaconmon if your competitors are other Shopify or WooCommerce stores, you want to see promotional copy and content changes alongside price, and you want your own store\'s uptime and SSL expiry watched in the same $29/mo subscription.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Priceva</th>
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

      {/* When to stay on Priceva */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Priceva
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Priceva covers ground Beaconmon has no plans to cover. Here is where its repricing and marketplace reach earns its rating.
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
                Most small ecommerce stores watch a handful of direct competitors on their own websites, not repricing across marketplaces.
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
              &ldquo;Priceva told me a competitor's price dropped. It didn't tell me they'd also rewritten their homepage banner and added a countdown timer. Beaconmon caught both, and that context is what actually changed how I responded.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, Canada, migrated early 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Priceva
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch is straightforward if you are focused on direct competitor websites rather than marketplace-wide repricing.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Export your tracked competitor list from Priceva. Note which ones are direct Shopify or WooCommerce stores rather than marketplace listings.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages you want to watch: product pages, pricing pages, promo banners. The wizard suggests CSS selectors for price and content on Shopify and WooCommerce stores.' },
                { step: '4', text: 'Configure your Weekly Competitor Report in Slack or email. This replaces manual Priceva dashboard checks with a delivered weekly summary.' },
                { step: '5', text: 'If you rely on repricing, MAP monitoring, or marketplace coverage, keep Priceva running for those and use Beaconmon alongside it for direct competitor and uptime monitoring.' },
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

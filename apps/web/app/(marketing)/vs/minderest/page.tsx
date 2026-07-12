import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Minderest for Shopify Stores (2026)',
  description:
    'Minderest is a custom-quote, sales-assisted enterprise price intelligence platform. Beaconmon is self-serve competitor and uptime monitoring, free to start.',
  alternates: { canonical: 'https://beaconmon.com/vs/minderest' },
  openGraph: { url: 'https://beaconmon.com/vs/minderest' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices, promos, and stock',
    beaconmon: '✓ Any content element',
    competitor: '✓ Enterprise-scale crawling',
    beaconmonGood: false,
  },
  {
    feature: 'Multi-country, multi-currency monitoring',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Dynamic repricing engine',
    beaconmon: 'No',
    competitor: '✓ Reactev, elasticity-based',
    beaconmonGood: false,
  },
  {
    feature: 'MAP/MSRP compliance monitoring',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Marketplace seller benchmarking',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Digital shelf and assortment intelligence',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'In-store price checks',
    beaconmon: 'No',
    competitor: '✓ InStore',
    beaconmonGood: false,
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
    feature: 'Self-serve signup',
    beaconmon: '✓ Instant, no sales call',
    competitor: 'No, sales-assisted only',
    beaconmonGood: true,
  },
  {
    feature: 'Setup time',
    beaconmon: 'Minutes',
    competitor: 'Weeks for large catalogs',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'None, no free trial',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo',
    competitor: 'Custom quote only',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You need multi-country, multi-currency price monitoring at scale',
    body: 'Minderest is built for retailers tracking prices across dozens of countries and currencies at once. Its named customers, including Leroy Merlin, Decathlon, Carrefour, HP, and L\'Oreal, run exactly this kind of large multinational catalog. Beaconmon has no multi-currency or multi-country tracking layer.',
  },
  {
    title: 'You want a dynamic repricing engine, not just alerts',
    body: 'Minderest\'s Reactev engine adjusts your prices automatically based on elasticity modeling. Beaconmon tells you when a competitor changes price, but acting on it, including any repricing, is manual on your end.',
  },
  {
    title: 'You need digital shelf, assortment, and in-store intelligence together',
    body: 'Minderest combines marketplace seller benchmarking, catalogue and assortment intelligence, digital shelf analysis, and in-person price checks through its InStore product. That is a full enterprise pricing operation, not something Beaconmon attempts to replicate.',
  },
];

const SWITCH_REASONS = [
  'Minderest has no published pricing. Every quote is custom and requires a sales call and demo before you know what it costs. Beaconmon is free to start and Starter is $29/mo, listed on the pricing page.',
  'Minderest\'s onboarding is sales-assisted, with the company citing a team of 100 pricing experts managing implementation, and large catalogs can take weeks to go live. Beaconmon signup is self-serve and takes minutes.',
  'You want your own store\'s uptime and SSL/domain expiry covered in the same tool as competitor monitoring, not a separate subscription.',
  'You are watching a handful of direct competitors on Shopify or WooCommerce, not running a multinational catalog across dozens of countries that needs a dedicated implementation team.',
  'You want a Weekly Competitor Report delivered to Slack or email without needing an account manager to configure it.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Minderest and Beaconmon?',
    a: 'Minderest is an enterprise price intelligence platform built for large multinational retailers. It covers multi-country and multi-currency price monitoring, MAP/MSRP compliance, a dynamic repricing engine called Reactev, marketplace seller benchmarking, digital shelf analysis, and in-store price checks. Setup is sales-assisted and can take weeks for large catalogs. Beaconmon is a self-serve tool for monitoring a handful of direct competitors on Shopify or WooCommerce, plus your own store\'s uptime and SSL expiry, starting free with signup in minutes.',
  },
  {
    q: 'How much does Minderest cost compared to Beaconmon?',
    a: 'Minderest does not publish pricing. Cost is fully custom, based on the number of SKUs tracked, competitors monitored, and monitoring frequency, and you only find out after a sales call and demo. There is no free trial or free tier. Beaconmon has a genuine free plan, 10 monitors and 1 competitor, and Starter is a listed $29/mo.',
  },
  {
    q: 'Is Minderest a good fit for small or mid-size Shopify stores?',
    a: 'Minderest is built for enterprise retailers with large, complex catalogs and multi-country operations. Its named customers are large retail and brand names, not small or mid-size single-storefront businesses. If you run a Shopify store watching a few direct competitors, Beaconmon\'s self-serve, transparently priced approach is a closer fit.',
  },
  {
    q: 'Does Beaconmon offer dynamic repricing like Minderest\'s Reactev?',
    a: 'No. Beaconmon detects and alerts you to competitor price and content changes. Minderest\'s Reactev engine goes a step further and automatically adjusts your prices based on elasticity modeling. If automated repricing is what you need, Minderest covers that and Beaconmon does not.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/minderest',
      name: 'Beaconmon vs Minderest for Shopify Stores (2026)',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Minderest', item: 'https://beaconmon.com/vs/minderest' },
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

export default function VsMinderestPage() {
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
            Beaconmon vs Minderest<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Minderest is an enterprise price intelligence platform for large multinational retailers, with multi-country monitoring, a dynamic repricing engine, and digital shelf intelligence. Pricing is custom quote only, and setup is a sales-assisted process that can take weeks. Beaconmon is self-serve competitor and uptime monitoring for Shopify and WooCommerce stores, free to start, live in minutes.
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
              Minderest earns its 4.7 stars on Capterra from enterprise retailers who need multi-country price monitoring, dynamic repricing, and assortment intelligence across huge catalogs, backed by a team of pricing experts managing the rollout. That is a real capability with a real cost and a multi-week implementation. Beaconmon is built for stores that want to watch a handful of direct competitors and their own uptime, sign up without a sales call, and see a transparent price before committing. If you are not running an enterprise catalog across dozens of countries, Beaconmon gets you monitoring in minutes instead of weeks.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Minderest</th>
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

      {/* When to stay on Minderest */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When Minderest is the right choice
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Minderest is built for a different scale of business. Here is where its enterprise feature set and custom pricing make sense.
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
                Most single-storefront stores watch a handful of direct competitors, not a multinational catalog, and would rather not sit through a sales process to find out the price.
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
              &ldquo;We requested a Minderest demo and never got a price without booking a call first. We just needed to watch three competitors on Shopify, not run a multi-country pricing operation. Beaconmon had us monitoring within the hour.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, evaluated both in 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                If you were evaluating Minderest and want a faster start
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                If a sales call and a custom quote is more process than your store needs, here is how to get monitoring live today instead.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'List the competitors and pages you actually care about, likely a handful of product or pricing pages, not a full multi-country catalog.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required, no sales call). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages to watch: pricing pages, product pages, promo banners. The wizard suggests CSS selectors for Shopify and WooCommerce stores.' },
                { step: '4', text: 'Set up your Weekly Competitor Report in Slack or email so changes land in one summary instead of a dashboard you have to check.' },
                { step: '5', text: 'If you later grow into a catalog that needs multi-country repricing or digital shelf intelligence, that is when a platform like Minderest starts to make sense.' },
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

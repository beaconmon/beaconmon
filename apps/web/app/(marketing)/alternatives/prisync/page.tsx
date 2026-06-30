import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cheaper Alternative to Prisync for Shopify Stores (2026)',
  description:
    'Prisync starts at $99/month. Beaconmon tracks competitor prices, promotions, and page changes from $29/month, with uptime monitoring included. Try free, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/prisync' },
};

const REASONS_TO_SWITCH = [
  {
    heading: '$99/mo minimum for under 100 SKUs.',
    body: 'Many Shopify stores run a focused catalog. At $99/mo you pay for capacity you never use.',
  },
  {
    heading: 'Price tracking without context.',
    body: 'If a competitor drops a price and launches a homepage promotion at the same time, Prisync catches the price. The campaign context is invisible.',
  },
  {
    heading: 'No uptime monitoring.',
    body: 'You need a separate tool to know when your own store is down. That means two subscriptions and two dashboards.',
  },
  {
    heading: 'Steep pricing cliffs.',
    body: 'Moving from 100 products to 101 doubles your bill. The jump from $99 to $199 happens the moment you exceed the lower tier.',
  },
  {
    heading: 'No plain-language digest.',
    body: 'Prisync delivers a dashboard. Beaconmon delivers a Slack or email summary of every competitor move, grouped and readable.',
  },
];

const BEACONMON_WINS = [
  'Starts at $29/mo on Starter, 3x cheaper than Prisync\'s entry price',
  'Free plan with 10 monitors and 1 competitor, no card required',
  'Tracks price changes plus promotional copy, banners, stock status, and full-page content changes on competitor sites',
  'Uptime monitoring included in every plan at no extra cost',
  'SSL and domain expiry alerts at 30, 14, and 7 days',
  'Intelligence Digest: a weekly Slack or email summary of every competitor move in plain language, available on Starter and above',
  'AI significance scoring on Growth+ classifies each change as clearance push, margin test, new campaign, or minor tweak',
];

const WHERE_PRISYNC_WINS = [
  {
    heading: 'Catalog-scale price history.',
    body: 'Prisync is a price database. It holds long-run price history across every SKU in your catalog, supports marketplace price tracking on Amazon and Google Shopping, and integrates with repricing tools. For stores running a catalog repricing strategy at scale, Prisync is purpose-built for that. Beaconmon is not.',
  },
  {
    heading: 'Dynamic repricing automation.',
    body: 'Prisync can automatically update your prices when a competitor changes theirs. Beaconmon monitors and alerts only. If automated repricing is your primary need, Prisync, Intelis, or PriceMole are the right tools.',
  },
  {
    heading: 'Marketplace price tracking.',
    body: 'Prisync tracks prices on Amazon and Google Shopping. Beaconmon monitors direct competitor websites only.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What does Beaconmon track that Prisync does not?',
    a: "Beaconmon tracks the full context of a competitor's page: price changes, promotional banners, stock status copy, product description updates, and homepage campaigns. Prisync tracks prices only. If a competitor drops a price at the same time they launch a site-wide promotion, Beaconmon surfaces both signals. Prisync surfaces only the price.",
  },
  {
    q: 'Does Beaconmon do dynamic repricing?',
    a: 'No. Beaconmon monitors and alerts. It does not automatically change your Shopify prices. If automated repricing is your primary need, Prisync, Intelis, or PriceMole are better fits.',
  },
  {
    q: "How does Beaconmon's price tracking work compared to Prisync?",
    a: "Prisync scrapes product pages and builds a price history database across your catalog. Beaconmon uses CSS-selector targeting to watch specific competitor pages and fires an alert when the value changes, including the old and new value. Beaconmon is better for tracking a focused set of competitor pages in context. Prisync is better for catalog-level price history at scale.",
  },
  {
    q: 'Can Beaconmon track competitor prices on Amazon or Google Shopping?',
    a: 'No. Beaconmon monitors direct competitor websites. For marketplace price tracking, Prisync is the right tool.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/prisync',
      name: 'Cheaper Alternative to Prisync for Shopify Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Prisync',
      applicationCategory: 'BusinessApplication',
      description: 'SKU-level competitor price tracking and dynamic repricing platform for ecommerce businesses with large product catalogs.',
      url: 'https://prisync.com',
      offers: { '@type': 'Offer', price: '99', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Prisync alternative', item: 'https://beaconmon.com/alternatives/prisync' },
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

export default function PrisyncAlternativePage() {
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
            Alternatives
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            A cheaper alternative to Prisync for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Prisync starts at $99/month. Beaconmon covers competitor prices, promotions, and page changes from $29/month, with uptime monitoring included.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[64px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-3 max-[640px]:grid-cols-1 gap-4">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 text-center">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3">Prisync</p>
              <p className="text-[40px] font-extrabold tracking-[-0.03em] mb-1">$99</p>
              <p className="text-brand-muted text-[14px]">per month, entry tier</p>
              <p className="text-brand-muted text-[13px] mt-3">100 products, price tracking only</p>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8 text-center">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3">Beaconmon Starter</p>
              <p className="text-[40px] font-extrabold tracking-[-0.03em] mb-1 text-brand-green-ink">$29</p>
              <p className="text-brand-muted text-[14px]">per month</p>
              <p className="text-brand-muted text-[13px] mt-3">Unlimited competitors, uptime, digest</p>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8 text-center">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3">Beaconmon Free</p>
              <p className="text-[40px] font-extrabold tracking-[-0.03em] mb-1 text-brand-green-ink">$0</p>
              <p className="text-brand-muted text-[14px]">forever</p>
              <p className="text-brand-muted text-[13px] mt-3">10 monitors, 1 competitor, no card</p>
            </div>
          </div>
          <p className="text-center text-brand-muted text-[13px] mt-5">
            See full plan details on the{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Why stores look for a Prisync alternative
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              The most common reasons Shopify owners start searching.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon covers instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Specifics, not marketing copy. Each of these is a real feature.
            </p>
          </div>
          <div className="reveal bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8 space-y-4">
            {BEACONMON_WINS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckIcon className="flex-shrink-0 mt-0.5 text-brand-green-ink" />
                <p className="text-[15px] text-brand-dim leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Where Prisync is still the better tool
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Honest. There are cases where Prisync is the right choice and Beaconmon is not.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_PRISYNC_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3 text-brand-text">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div aria-hidden className="absolute pointer-events-none" style={{ bottom: '-40%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)', filter: 'blur(40px)' }} />
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
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync (full comparison)</Link>
            <Link href="/alternatives/price2spy" className="text-brand-dim hover:text-brand-text transition-colors">Cheaper alternative to Price2Spy</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking for Shopify</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

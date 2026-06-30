import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon as an Alternative to Visualping, Prisync, Distill, and Hexowatch (2026)',
  description:
    'Looking for an alternative to Visualping, Prisync, Distill.io, Hexowatch, UptimeRobot, BetterStack, or Rivalert? Beaconmon is built for Shopify and WooCommerce stores: competitor price tracking, uptime monitoring, and weekly Intelligence Digest. Try free.',
  alternates: { canonical: 'https://beaconmon.com/alternatives' },
};

const ALTERNATIVES = [
  {
    name: 'Visualping',
    slug: 'visualping',
    positioning: 'Visualping compares screenshots pixel by pixel. It tells you that something in a region changed. Beaconmon targets specific HTML elements with CSS selectors, so it tells you exactly what changed: a price, a stock badge, a promotional headline. For Shopify stores that need to understand competitor moves rather than just detect them, Beaconmon is the more precise fit.',
    beaconmonEdge: 'HTML-selector precision, uptime monitoring, Intelligence Digest',
    limitation: 'Beaconmon does not do visual pixel-diffing. For non-structured visual changes, Visualping catches things Beaconmon does not.',
  },
  {
    name: 'Prisync',
    slug: 'prisync',
    positioning: "Prisync is a price intelligence database: it scrapes competitor prices, builds history, and integrates with repricing tools. Beaconmon tracks price in context. If a competitor drops their price and adds a promotional banner at the same time, Beaconmon captures both changes and an AI classifies what the move likely means. For stores that need full-catalogue SKU-level price history, Prisync is the better tool. For stores that want to understand why a competitor changed their pricing, Beaconmon goes deeper.",
    beaconmonEdge: 'Price-plus-context tracking, AI significance scoring, uptime monitoring, from $29/mo',
    limitation: 'Beaconmon is not a price database. For long-run pricing trend analysis across hundreds of SKUs, Prisync is purpose-built for that.',
  },
  {
    name: 'Distill.io',
    slug: 'distill',
    positioning: 'Distill renders JavaScript before capturing a page snapshot. This makes it more flexible for monitoring sites that load content client-side. Beaconmon uses HTML-only monitoring, which is faster, more scalable, and sufficient for most Shopify and WooCommerce stores that serve prices and inventory in the initial server-rendered HTML. Beaconmon adds uptime monitoring, a weekly Intelligence Digest, and AI change summaries that Distill does not offer.',
    beaconmonEdge: 'Shopify preset selectors, Intelligence Digest, uptime monitoring, AI summaries',
    limitation: 'Beaconmon does not render JavaScript. If a competitor uses a headless frontend that loads prices client-side, Distill will catch changes Beaconmon will not. We are transparent about this.',
  },
  {
    name: 'Hexowatch',
    slug: 'hexowatch',
    positioning: 'Hexowatch is a broad web intelligence platform with many monitor types: visual, API, keyword, content, and availability. Beaconmon is narrower and deeper, built specifically for Shopify and WooCommerce competitor tracking. It ships with preset selectors for Shopify product price and stock, delivers a weekly Intelligence Digest to Slack or email, and includes AI significance scoring on every detected change. If you run an ecommerce store and want a tool shaped around that workflow, Beaconmon fits better.',
    beaconmonEdge: 'Ecommerce-native UX, preset Shopify selectors, Intelligence Digest, AI scoring',
    limitation: 'Hexowatch covers more monitor types. If you need API monitoring, visual monitoring, or keyword tracking alongside content watching, Hexowatch offers more in one subscription.',
  },
  {
    name: 'UptimeRobot',
    slug: 'uptimerobot',
    positioning: "UptimeRobot's free plan became non-commercial in October 2024. Shopify stores running free UptimeRobot monitors need to switch. Beaconmon replaces UptimeRobot's uptime monitoring with no commercial restrictions on the free plan, and adds competitor price and page change monitoring that UptimeRobot does not offer at any tier.",
    beaconmonEdge: 'No non-commercial restriction, competitor monitoring included, Intelligence Digest, SSL + domain expiry alerts',
    limitation: "UptimeRobot's paid plans scale to hundreds of monitors cheaply and integrate with PagerDuty and DevOps tooling that Beaconmon does not support.",
  },
  {
    name: 'BetterStack',
    slug: 'betterstack',
    positioning: "BetterStack has expanded far beyond uptime monitoring into log management, distributed tracing, and on-call scheduling. For Shopify stores that want uptime alerts and competitor monitoring without an enterprise observability stack, Beaconmon is simpler and cheaper. BetterStack's free plan is the same 10 monitors as Beaconmon's, but Beaconmon adds competitor tracking.",
    beaconmonEdge: 'Competitor monitoring included, ecommerce-native, simpler UX, Intelligence Digest',
    limitation: 'BetterStack is a far more capable infrastructure platform. Log management, tracing, metrics, and on-call scheduling are outside Beaconmon scope.',
  },
  {
    name: 'Rivalert',
    slug: 'rivalert',
    positioning: "Rivalert is a 2026 Shopify-native price and product tracker. It is the closest competitor to Beaconmon at the low end. Rivalert covers price changes, new products, and stock levels. Beaconmon adds promotional copy and banner monitoring, uptime monitoring, SSL alerts, an Intelligence Digest, and a free plan that Rivalert does not offer.",
    beaconmonEdge: 'Free plan (Rivalert has none), uptime monitoring, promo/content monitoring, hourly checks on entry plan vs Rivalert 12-hour',
    limitation: "Rivalert's $19/mo Starter is cheaper than Beaconmon Starter. It includes 30-180 days of price history. For price-and-stock-only tracking, Rivalert is the lower-cost option.",
  },
  {
    name: 'Panoramata',
    slug: 'panoramata',
    positioning: "Panoramata is the most comprehensive ecommerce competitive intelligence platform: it monitors competitor emails, ad creatives, SMS, and landing pages. Beaconmon focuses on competitor website monitoring and your own store uptime. If you primarily need website change and price alerts rather than email and ad creative tracking, Beaconmon covers that at $29/mo versus Panoramata's $89/mo entry.",
    beaconmonEdge: 'Website-level precision (CSS-selector), uptime monitoring, SSL alerts, Intelligence Digest, free plan, 3x cheaper entry',
    limitation: 'Panoramata is the right tool for email campaign tracking, email flow monitoring, and ad creative intelligence. Beaconmon does not touch these channels.',
  },
  {
    name: 'Intelis',
    slug: 'intelis',
    positioning: "Intelis is a 4.9-star Shopify App Store repricing tool. It monitors Google Shopping and direct competitor prices, then automatically adjusts your product prices. Beaconmon is a monitoring tool, not a repricing tool: it alerts you to changes and you decide how to respond. For stores that want alerts without automation, Beaconmon is $29/mo versus Intelis's $49/mo.",
    beaconmonEdge: 'Free plan, $20/mo cheaper entry, promo/content monitoring, uptime monitoring, Intelligence Digest',
    limitation: "Intelis's auto-repricing and Google Shopping intelligence are market-leading. If automated price adjustment is your goal, Intelis is purpose-built and Beaconmon is not a replacement.",
  },
  {
    name: 'Price2Spy',
    slug: 'price2spy',
    positioning: "Price2Spy is an enterprise price intelligence platform starting at $157/mo. It handles large-catalog SKU tracking, MAP compliance monitoring, and marketplace coverage. For Shopify stores with a focused set of competitors and no need for enterprise-scale catalog management, Beaconmon covers price monitoring plus promotional context and uptime at $29/mo.",
    beaconmonEdge: '5x cheaper entry, no catalog setup required, promotional content monitoring, uptime monitoring, Intelligence Digest',
    limitation: "Price2Spy is built for retailers with hundreds or thousands of SKUs, long-run price history requirements, MAP compliance workflows, and marketplace tracking. Beaconmon is not a substitute at that scale.",
  },
];

const WHAT_BEACONMON_DOES = [
  {
    heading: 'Competitor price and content tracking.',
    body: 'Track when a competitor changes prices, product descriptions, promotional banners, or stock status. CSS-selector targeting means you get the specific value that changed, not just a diff.',
  },
  {
    heading: 'Intelligence Digest, delivered.',
    body: 'A scheduled Slack or email digest grouping every competitor change from the past week into a readable summary. No dashboard to check. Available on Starter and above.',
  },
  {
    heading: 'AI significance scoring.',
    body: 'On Growth and Scale plans, an AI reads each change and classifies whether it matters: clearance push, margin test, new campaign, or minor copy tweak. Signal over noise.',
  },
  {
    heading: 'Uptime, SSL, and domain expiry.',
    body: 'Competitor intelligence and uptime monitoring in one subscription. SSL and domain expiry warnings at 30, 14, and 7 days so a forgotten renewal never breaks your checkout.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Beaconmon vs alternatives',
      itemListElement: ALTERNATIVES.map(({ name, slug }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Beaconmon vs ${name}`,
        url: `https://beaconmon.com/vs/${slug}`,
      })),
    },
  ],
};

export default function AlternativesPage() {
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Alternatives</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Beaconmon as an alternative to popular monitoring tools.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Built for Shopify and WooCommerce stores. Honest about where the alternatives are better.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* What Beaconmon does */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon does</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The four things that make Beaconmon different from generic monitoring tools.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {WHAT_BEACONMON_DOES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternatives detail */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">How Beaconmon compares</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Each comparison includes where the alternative is genuinely stronger.</p>
          </div>
          <div className="space-y-6 max-w-[900px] mx-auto">
            {ALTERNATIVES.map(({ name, slug, positioning, beaconmonEdge, limitation }) => (
              <div key={slug} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="flex items-start justify-between gap-4 mb-5 max-[640px]:flex-col">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1 block">Alternative</span>
                    <h3 className="text-[22px] font-bold tracking-[-0.02em]">Beaconmon vs {name}</h3>
                  </div>
                  <Link
                    href={`/vs/${slug}`}
                    className="flex-shrink-0 inline-flex items-center gap-2 text-[13px] font-semibold text-brand-green-ink hover:underline"
                  >
                    Full comparison →
                  </Link>
                </div>
                <p className="text-[15px] leading-[1.65] text-brand-dim mb-6">{positioning}</p>
                <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-4">
                  <div className="bg-[rgba(0,229,122,0.05)] border border-[rgba(0,229,122,0.15)] rounded-xl p-4">
                    <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-2 block">Beaconmon edge</span>
                    <p className="text-[13px] text-brand-dim leading-[1.5]">{beaconmonEdge}</p>
                  </div>
                  <div className="bg-brand-bg border border-brand-line-soft rounded-xl p-4">
                    <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-2 block">Where {name} wins</span>
                    <p className="text-[13px] text-brand-dim leading-[1.5]">{limitation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Beaconmon is for */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
              Who Beaconmon is built for
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.65] max-w-[580px] mx-auto">
              Beaconmon is the right choice if you run a Shopify or WooCommerce store and want competitor intelligence and uptime monitoring in one tool designed around the ecommerce workflow. It is not the right choice if you need long-run price history across hundreds of SKUs, full-browser JavaScript rendering for SPA-heavy sites, or a wide range of non-content monitor types.
            </p>
          </div>
          <div className="reveal grid grid-cols-3 max-[640px]:grid-cols-1 gap-4 text-center">
            {[
              { label: 'Shopify stores', check: true },
              { label: 'WooCommerce stores', check: true },
              { label: 'DTC brands', check: true },
              { label: 'Solo founders', check: true },
              { label: 'Ecommerce agencies', check: true },
              { label: 'DevOps / SRE teams', check: false },
            ].map(({ label, check }) => (
              <div
                key={label}
                className={`rounded-xl border p-4 text-[14px] font-medium ${check ? 'bg-[rgba(0,229,122,0.05)] border-[rgba(0,229,122,0.2)] text-brand-green-ink' : 'bg-brand-bg1 border-brand-line-soft text-brand-muted'}`}
              >
                <span className="mr-2">{check ? '✓' : '×'}</span>
                {label}
              </div>
            ))}
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
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">Full comparisons</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/distill" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Distill</Link>
            <Link href="/vs/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Hexowatch</Link>
            <Link href="/vs/rivalert" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Rivalert</Link>
            <Link href="/vs/panoramata" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Panoramata</Link>
            <Link href="/vs/intelis" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Intelis</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

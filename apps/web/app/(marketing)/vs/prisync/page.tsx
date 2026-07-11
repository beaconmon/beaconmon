import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Prisync for Shopify Stores (2026): Honest Comparison',
  description:
    'Prisync vs Beaconmon: price-only tracking vs price-plus-context with AI significance scoring. Competitor monitoring, uptime, and Digest compared.',
  alternates: { canonical: 'https://beaconmon.com/vs/prisync' },
  openGraph: { url: 'https://beaconmon.com/vs/prisync' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor prices',
    beaconmon: '✓ Price + surrounding context',
    competitor: '✓ Price database',
    beaconmonGood: true,
  },
  {
    feature: 'Tracks promotional copy changes',
    beaconmon: '✓ Yes, any content element',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'AI change significance scoring',
    beaconmon: '✓ Growth+ (classifies impact)',
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
    feature: 'Weekly Competitor Report (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No weekly digest',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Both included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Price history depth',
    beaconmon: 'Plan retention window',
    competitor: 'Longer history available',
    beaconmonGood: false,
  },
  {
    feature: 'Dynamic repricing integrations',
    beaconmon: 'No',
    competitor: '✓ Yes (pricing rules)',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'No (trial only)',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$59/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You need long price history for market trend analysis',
    body: "Prisync stores historical price data across many competitors and lets you spot longer-term trends. If you need months of price history for category-level analysis or buying decisions, Prisync's database model is built for that.",
  },
  {
    title: 'You want automatic repricing rules',
    body: "Prisync integrates with platforms to trigger automatic price adjustments when a competitor changes their price. If hands-off dynamic repricing is the goal, Prisync has that workflow. Beaconmon sends the alert; acting on it is manual.",
  },
  {
    title: 'You track hundreds of competitor SKUs',
    body: 'For large catalogues where you need structured price data across dozens of competitors at the SKU level, Prisync is purpose-built for that scale. Beaconmon is better suited to watching specific pages and product categories rather than full catalogue price matching.',
  },
];

const SWITCH_REASONS = [
  'You want to know not just that a price changed, but also whether a competitor updated their promotional copy, added a sale badge, or changed their shipping messaging at the same time.',
  'You want an AI to read each competitor change and tell you whether it is likely a clearance push, a margin test, or a seasonal promotion, not just a price difference.',
  'You want your uptime monitoring, SSL expiry alerts, and competitor monitoring in one tool, not separate subscriptions.',
  'You want a Weekly Competitor Report delivered to Slack or email that groups every competitor change into a readable summary.',
  'You want to track fewer competitors deeply, with full page context and AI summaries, rather than many SKUs shallowly.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Prisync and Beaconmon?',
    a: "Prisync is a price intelligence platform. It scrapes prices into a database, tracks history, and can trigger repricing rules. Beaconmon is a broader competitor monitoring tool that tracks price changes in context: what promotional copy surrounds the price, did the sale badge appear at the same time, and an AI classifies what the change likely means. Beaconmon also covers uptime monitoring and SSL expiry, which Prisync does not.",
  },
  {
    q: 'Does Beaconmon replace Prisync for large catalogues?',
    a: 'Not for every use case. If you are tracking hundreds of competitor SKUs at the price level across many competitors, Prisync is purpose-built for that. Beaconmon is better suited to stores that want to watch specific pages, product categories, and promotional activity with deep context rather than wide SKU-level price surveillance.',
  },
  {
    q: 'Does Beaconmon track price history?',
    a: 'Yes, within your plan retention window. Beaconmon records every detected change with a before/after snapshot. This is sufficient for reviewing recent competitor moves and understanding pricing patterns over the past weeks or months. For multi-year pricing trend analysis, a dedicated price intelligence platform will serve you better.',
  },
  {
    q: 'What is AI change significance scoring?',
    a: "On Growth and Scale plans, Beaconmon sends each detected change to an AI that reads the before/after content and classifies the change. For a price drop with a new 'Limited time offer' badge added at the same time, it will flag this as a likely promotional push. For a minor copy tweak with no price movement, it will classify it as low significance. The goal is to cut noise so you act on the changes that actually matter.",
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Prisync', item: 'https://beaconmon.com/vs/prisync' },
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

export default function VsPrisyncPage() {
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
            Beaconmon vs Prisync<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Prisync is a price intelligence database: it tracks competitor prices, builds history, and can trigger repricing rules. Beaconmon tracks price in context, the surrounding promotional copy, the timing of a badge appearing next to the price, and an AI classifies what each change likely means. If a competitor drops price and adds a sale banner simultaneously, Beaconmon tells you; Prisync tells you the number changed.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Choose Prisync if you need structured price data across hundreds of SKUs, long price history, or automated repricing integrations. Choose Beaconmon if you want to understand competitor moves in full context, get AI significance scoring on each change, and combine competitor monitoring with uptime monitoring in one tool starting at $29 per month.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Prisync</th>
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

      {/* When to stay on Prisync */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Prisync
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Prisync is a legitimate price intelligence tool with specific strengths. Before switching, be clear about what you actually need.
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
                Why ecommerce stores switch to Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Usually it comes down to context: a price change means more when you can see what else the competitor changed at the same time.
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
              &ldquo;Prisync told me the price dropped. Beaconmon told me the price dropped and they added a banner saying &lsquo;clearance&rsquo; and changed their homepage hero. That context completely changes how I respond.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">WooCommerce store owner, Australia, migrated mid 2025</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Prisync
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch is straightforward if you are focused on specific competitor pages rather than full catalogue coverage.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Export your competitor list from Prisync. Note which product pages or category pages you care about most.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard walks you through adding your store and competitors.' },
                { step: '3', text: 'For each competitor, choose the pages you want to watch: product listing pages, specific product pages, pricing pages. The wizard suggests CSS selectors for price and availability on Shopify and WooCommerce stores.' },
                { step: '4', text: 'Configure your Weekly Competitor Report in Slack or email. This replaces the manual Prisync dashboard check with a delivered weekly summary.' },
                { step: '5', text: 'Run both tools for a week if you need to validate coverage, then cancel Prisync.' },
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
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/vs/distill" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Distill</Link>
            <Link href="/vs/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Hexowatch</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

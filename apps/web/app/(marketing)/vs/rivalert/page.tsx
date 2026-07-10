import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Rivalert for Shopify Stores (2026): Honest Comparison',
  description:
    'Rivalert vs Beaconmon: Shopify competitor price and product tracking compared. Beaconmon adds uptime, content and promo alerts, and Intelligence Digest.',
  alternates: { canonical: 'https://beaconmon.com/vs/rivalert' },
  openGraph: { url: 'https://beaconmon.com/vs/rivalert' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks competitor price changes',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Price tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Tracks promotional copy and banners',
    beaconmon: '✓ Any content element',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Tracks new product launches',
    beaconmon: '✓ Product listing changes',
    competitor: '✓ New product detection',
    beaconmonGood: false,
  },
  {
    feature: 'Stock level monitoring',
    beaconmon: '✓ Stock status element',
    competitor: '✓ Stock tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Check frequency (entry plan)',
    beaconmon: 'Every hour',
    competitor: 'Every 12 hours (Starter)',
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
    feature: 'Intelligence Digest (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'AI significance scoring',
    beaconmon: '✓ Growth+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'No (7-day trial only)',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: '$29/mo',
    competitor: '$19/mo (Starter)',
    beaconmonGood: false,
  },
  {
    feature: 'Price history',
    beaconmon: 'Plan retention window',
    competitor: '30-180 days',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You only need price and product tracking',
    body: "Rivalert is narrowly focused on exactly that. If you do not need uptime monitoring or content and promo change detection, Rivalert's $19/mo entry price is lower than Beaconmon Starter.",
  },
  {
    title: 'You want longer price history',
    body: "Rivalert's Pro plan stores up to 180 days of price history. If you need to chart a competitor's pricing trend over months, that depth is useful.",
  },
  {
    title: 'You are starting out and want the cheapest possible entry',
    body: "Rivalert's $19/mo Starter is $10/mo cheaper than Beaconmon Starter, and covers the basics if price-and-stock is all you need.",
  },
];

const SWITCH_REASONS = [
  'You want to know when a competitor launches a promotional campaign or changes their homepage banner, not just when a product price changes.',
  'Your own store going down during a competitor sale is the scenario you most need to catch. Rivalert cannot tell you that.',
  'You want a weekly Intelligence Digest in Slack summarizing every competitor move, not individual price-drop emails throughout the day.',
  "Rivalert's Starter plan only checks every 12 hours. A competitor could run a flash sale and end it before Rivalert detects it.",
  'You want SSL and domain expiry monitoring alongside competitor tracking, without paying for a second tool.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Rivalert and Beaconmon?',
    a: "Rivalert is a Shopify-specific price and product tracker. It tells you when a competitor's price changes or a new product appears. Beaconmon tracks those things plus promotional copy, homepage banners, and any other content change on competitor pages. Beaconmon also monitors your own store's uptime and SSL status. Rivalert does not.",
  },
  {
    q: 'Is Rivalert cheaper than Beaconmon?',
    a: "Rivalert's Starter plan is $19/mo versus Beaconmon Starter at $29/mo. However, Beaconmon includes uptime monitoring, SSL alerts, Intelligence Digest, and content and promo tracking that Rivalert does not offer on any plan. Beaconmon also has a free plan; Rivalert does not.",
  },
  {
    q: 'Does Rivalert have a free plan?',
    a: "No. Rivalert offers a 7-day trial but no ongoing free tier. Beaconmon's free plan covers 10 monitors and 1 competitor forever with no credit card.",
  },
  {
    q: 'How often does Rivalert check for changes?',
    a: 'On the Starter plan, Rivalert checks every 12 hours. On Pro ($179/mo), it checks hourly. Beaconmon checks at least every hour across all paid plans, and more frequently on higher tiers.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/rivalert',
      name: 'Beaconmon vs Rivalert for Shopify Stores (2026): Honest Comparison',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Rivalert', item: 'https://beaconmon.com/vs/rivalert' },
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

export default function VsRivalertPage() {
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
            Beaconmon vs Rivalert<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Rivalert tracks competitor price drops, price increases, new products, and stock levels. Beaconmon covers all of that and adds promotional copy changes, homepage banner monitoring, uptime monitoring, and a weekly Intelligence Digest. For Shopify stores that want a single tool instead of a narrow price tracker, that scope matters.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Rivalert is a focused Shopify price and product tracker. If price-and-stock is all you need, it does that job at a lower entry price. Beaconmon is broader: it covers competitor content changes, uptime, SSL expiry, and delivers a weekly digest to Slack. If you want one tool that monitors your store and your competitors, Beaconmon is the better fit.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Rivalert</th>
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
                When to stay on Rivalert
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Rivalert is a good fit for a specific set of problems. Before switching, it is worth being clear about where it fits.
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
                Why ecommerce stores switch to Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Usually it comes down to scope: price tracking is table stakes, but the change that costs you money is often a competitor promo you never saw coming.
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

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <blockquote className="reveal max-w-[700px] mx-auto border-l-2 border-brand-green-ink pl-8 py-2">
            <p className="text-[18px] leading-[1.7] text-brand-dim italic mb-4">
              &ldquo;Rivalert told me a price changed. Beaconmon told me the price changed, their homepage banner changed, and my store had a 4-minute outage at the same time. That context is what I was missing.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United States, migrated 2026</cite>
          </blockquote>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Rivalert
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch takes under 30 minutes. The onboarding wizard provides Shopify preset selectors so you do not need to configure CSS manually.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Note the competitor URLs you are currently tracking in Rivalert.' },
                { step: '2', text: 'Sign up for Beaconmon free (no card). The onboarding wizard asks for your store URL and competitor domains.' },
                { step: '3', text: 'For each competitor, choose what to track: price, stock, promotional copy, or any page element. The wizard provides Shopify preset selectors.' },
                { step: '4', text: 'Add your own store URL to uptime monitoring.' },
                { step: '5', text: 'Connect Slack or email. Configure the Intelligence Digest frequency.' },
                { step: '6', text: 'Run both tools for a week if you want to verify coverage, then cancel Rivalert.' },
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
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/alternatives/rivalert" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to Rivalert</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Wachete for Shopify Stores (2026)',
  description:
    'Wachete vs Beaconmon: check frequency, Shopify preset selectors, uptime monitoring, and Weekly Competitor Report compared for ecommerce stores. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/wachete' },
  openGraph: { url: 'https://beaconmon.com/vs/wachete' },
};

const TABLE_ROWS = [
  {
    feature: 'Free plan check frequency',
    beaconmon: 'Hourly',
    competitor: '24 hours',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan limit',
    beaconmon: '10 monitors, 1 competitor',
    competitor: '5 pages',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify and WooCommerce preset selectors',
    beaconmon: '✓ Included',
    competitor: 'No, manual CSS setup required',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No, content changes only',
    beaconmonGood: true,
  },
  {
    feature: 'SSL and domain expiry alerts',
    beaconmon: '✓ Both included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly digest to Slack or email',
    beaconmon: '✓ Starter+',
    competitor: 'No, per-change email alerts only',
    beaconmonGood: true,
  },
  {
    feature: 'Ecommerce-native onboarding',
    beaconmon: '✓ Detects Shopify and WooCommerce',
    competitor: 'No, generic setup for any page',
    beaconmonGood: true,
  },
  {
    feature: 'Works for any web page, not just ecommerce',
    beaconmon: 'Ecommerce-focused',
    competitor: '✓ Yes',
    beaconmonGood: false,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: '$5.40/mo',
    beaconmonGood: false,
  },
];

const WACHETE_STRENGTHS = [
  {
    title: 'Lower starting price',
    body: "Wachete's paid plan starts at $5.40/mo for 50 pages with 1-hour checks. That undercuts every Beaconmon paid tier. For a small number of non-ecommerce pages with no need for uptime monitoring, Wachete costs less.",
  },
  {
    title: 'General-purpose page monitoring',
    body: 'Wachete works for any web page, not just ecommerce. If your monitoring needs extend beyond competitor storefronts into documentation, news pages, or a competitor blog, Wachete\'s flexibility covers more ground than a tool built specifically for ecommerce.',
  },
];

const SWITCH_REASONS = [
  "Wachete's free plan checks once a day. If a competitor drops a price and runs a same-day flash sale, you will not see it until the next morning. Beaconmon free checks hourly.",
  'Wachete requires manual CSS selector setup for every monitor. There are no presets for Shopify product prices, stock badges, or promotional copy. Beaconmon ships with preset selectors for the most common Shopify and WooCommerce elements.',
  'Wachete tracks content changes only. It will not alert you if a competitor site goes down, or if your own store loses SSL or lets a domain lapse. Beaconmon handles uptime, SSL, and domain expiry alongside competitor tracking.',
  'Wachete sends per-change email alerts with no weekly summary and no native Slack delivery. Beaconmon Starter includes a Weekly Competitor Report sent to Slack or email.',
  "Wachete's onboarding and alert formats are built for generic use, not shaped around a Shopify or WooCommerce store owner's workflow.",
];

const FAQ_ITEMS = [
  {
    q: "How does Beaconmon's free plan compare to Wachete's?",
    a: "Wachete free gives you 5 pages at a 24-hour check frequency. Beaconmon free gives you 10 monitors, 1 competitor, and hourly checks, plus uptime monitoring and SSL expiry alerts that Wachete's free plan does not include.",
  },
  {
    q: 'Does Wachete have Shopify-specific features?',
    a: 'No. Wachete is a generic web monitoring tool. Every monitor requires manual CSS selector setup, with no presets for Shopify product prices or stock status. Beaconmon provides preset selectors for the most common Shopify and WooCommerce elements so you can start tracking a competitor in minutes without knowing CSS.',
  },
  {
    q: 'When does Wachete make more sense than Beaconmon?',
    a: "Wachete is the stronger choice when you need to monitor a small number of general web pages, not just ecommerce storefronts, and want the lowest possible price. Its paid plan starts at $5.40/mo, less than any Beaconmon tier, and it works equally well on documentation, news, or blog pages that have nothing to do with a Shopify store.",
  },
  {
    q: 'Is Beaconmon more expensive than Wachete?',
    a: "Wachete's paid plan starts at $5.40/mo. Beaconmon Starter is $29/mo. If you only need basic page monitoring with no ecommerce context, Wachete is cheaper. If you need Shopify preset selectors, uptime monitoring, and the Weekly Competitor Report, Beaconmon covers things Wachete does not offer at any price.",
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Wachete', item: 'https://beaconmon.com/vs/wachete' },
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

export default function VsWachetePage() {
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
            Beaconmon vs Wachete<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Wachete is a generic page monitoring tool with manual CSS setup and daily checks on its free plan. Beaconmon is built for ecommerce, with Shopify and WooCommerce preset selectors, hourly checks on the free plan, and uptime monitoring included alongside content change detection.
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
              Wachete is a general-purpose page monitor at a low price. It works on any page, but every monitor needs manual CSS setup and the free plan only checks once a day. Beaconmon is purpose-built for ecommerce, with Shopify preset selectors, hourly checks, uptime monitoring, and a Weekly Competitor Report. If your monitoring is limited to a Shopify or WooCommerce store, Beaconmon fits the workflow more directly. If you need to watch pages outside ecommerce at the lowest possible price, Wachete still has a place.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Wachete</th>
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

      {/* Where Wachete wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Wachete is still the better choice
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Wachete has real advantages in a couple of areas, and those are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {WACHETE_STRENGTHS.map(({ title, body }) => (
                <div key={title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-2">{title}</p>
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
                Stores switching from Wachete usually share the same profile: they are tired of setting up CSS selectors by hand, they want faster checks than once a day, and they want uptime monitoring alongside content tracking in one subscription.
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
              &ldquo;I spent an evening setting up CSS selectors in Wachete for five competitor pages. With Beaconmon the presets just knew where the Shopify price and stock badge lived. Setup took ten minutes instead of an evening, and the Weekly Competitor Report replaced my manual Monday morning check.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United States, migrated 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to migrate from Wachete
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in under 20 minutes. Run both tools in parallel for a week before cancelling Wachete.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Wachete and make a list of the pages and CSS selectors you are currently watching.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors and 1 competitor with no card required.' },
                { step: '3', text: 'For each Shopify or WooCommerce competitor, choose a preset selector for price, stock status, or promotional copy, or paste your own if the site is not ecommerce.' },
                { step: '4', text: 'Connect alert channels. Email works immediately, and the Weekly Competitor Report to Slack or email is configured on Starter.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel Wachete from their billing settings.' },
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
            <Link href="/alternatives/wachete" className="text-brand-dim hover:text-brand-text transition-colors">Wachete alternative</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

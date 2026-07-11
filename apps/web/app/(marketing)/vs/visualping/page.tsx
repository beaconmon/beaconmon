import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Visualping for Shopify Stores (2026): Honest Comparison',
  description:
    'Visualping vs Beaconmon: pixel-diffing vs HTML-selector targeting, competitor price tracking, and Digest compared for ecommerce stores. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/visualping' },
  openGraph: { url: 'https://beaconmon.com/vs/visualping' },
};

const TABLE_ROWS = [
  {
    feature: 'How changes are detected',
    beaconmon: 'CSS-selector HTML targeting',
    competitor: 'Visual pixel-diffing (screenshots)',
    beaconmonGood: true,
  },
  {
    feature: 'Knows what changed',
    beaconmon: '✓ Specific element (price, copy, stock)',
    competitor: 'Region changed, not what inside it',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify product structure awareness',
    beaconmon: '✓ Targets product fields directly',
    competitor: 'No, visual only',
    beaconmonGood: true,
  },
  {
    feature: 'Competitor monitoring',
    beaconmon: '✓ Included, ecommerce presets',
    competitor: 'Yes, generic page watching',
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
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'AI change summaries',
    beaconmon: '✓ Growth+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Both included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'Yes (limited checks/day)',
    beaconmonGood: false,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$10/mo (Starter)',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You need to detect visual layout changes, not data changes',
    body: "If you care that a homepage hero image changed or a button moved, Visualping's screenshot comparison catches anything visible. No CSS knowledge needed.",
  },
  {
    title: 'You are monitoring pages that do not have predictable structure',
    body: 'For pages where you cannot predict what elements to target, pixel-diffing catches any visual change regardless of the underlying markup.',
  },
  {
    title: 'You have a very small budget and only need a handful of checks',
    body: "Visualping's entry price is lower. If you're tracking two or three pages and don't need uptime monitoring or Slack digests, it can cover that use case.",
  },
];

const SWITCH_REASONS = [
  'You want to know specifically that a competitor changed their product price, not just that something on the page looks different.',
  'You want your Shopify store monitored for downtime, SSL expiry, and competitor changes from one tool, not three.',
  'You want a Weekly Competitor Report in Slack summarizing exactly what changed on competitor sites, in plain language.',
  'You need AI-generated summaries that explain what changed and why it might matter to your store, not just a before/after screenshot.',
  'You want to track competitor product availability and promotional copy with the precision of a CSS selector, not a cropped image region.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Visualping and Beaconmon?',
    a: "Visualping compares screenshots pixel by pixel. It tells you that something in a region of a page changed. Beaconmon targets specific HTML elements with CSS selectors, so it tells you exactly what changed: the price went from $49 to $39, or the stock badge changed from 'In stock' to 'Only 3 left'. For ecommerce competitor tracking, that specificity matters.",
  },
  {
    q: 'Does Visualping monitor uptime?',
    a: 'No. Visualping is focused on visual change detection. It will not alert you if your Shopify store goes down, your SSL certificate expires, or your domain is about to lapse. Beaconmon covers all three alongside content change monitoring.',
  },
  {
    q: 'Can Visualping track competitor prices on Shopify stores?',
    a: "Visualping can detect that something changed in a region of the page. It can not extract the price value, tell you what the old price was versus the new price, or send a Slack digest summarizing this week's competitor price movements. Beaconmon targets the price element directly and includes the before and after value in the alert.",
  },
  {
    q: 'Is Beaconmon harder to set up than Visualping?',
    a: 'The onboarding wizard handles most of the setup. For competitor monitors, you choose a CSS selector from a preset list (or paste your own). Most Shopify stores have predictable selectors for price and availability. If you are watching a WooCommerce competitor, the wizard suggests the right selectors based on the theme it detects.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Visualping', item: 'https://beaconmon.com/vs/visualping' },
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

export default function VsVisualpingPage() {
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
            Beaconmon vs Visualping<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Visualping watches for visual changes to a page by comparing screenshots. Beaconmon targets specific HTML elements with CSS selectors, so it tells you exactly what changed on a competitor product page. For Shopify stores tracking competitor prices and promotions, that difference is significant.
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
              Visualping is a visual change detector. It shows you that something on a page changed. Beaconmon is an ecommerce monitoring tool. It tells you what changed, by how much, and delivers a digest of every competitor move to your Slack. If you run a Shopify store and care about competitor prices, not just pixels, Beaconmon is the better fit.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Visualping</th>
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

      {/* When to stay on Visualping */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Visualping
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Visualping works well for a specific set of problems. Before switching, it is worth being clear about where it fits.
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
                Usually it comes down to precision: knowing exactly what a competitor changed, not just that something on the page is different.
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
              &ldquo;With Visualping I got a screenshot saying something changed. With Beaconmon I get a Slack message saying the price on their bestseller dropped $10. That is the difference between noise and signal.&rdquo;
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
                How to switch from Visualping
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch takes under 30 minutes. You do not need to know CSS selectors in advance. The onboarding wizard suggests the right ones for your competitors.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Make a note of the competitor URLs you are currently watching in Visualping.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard asks for your store URL and competitor domains.' },
                { step: '3', text: 'For each competitor, choose what to track: price, stock status, promotional copy, or the full page. The wizard provides preset selectors for Shopify and WooCommerce stores.' },
                { step: '4', text: 'Connect Slack or email for alerts. The Weekly Competitor Report is configured here too.' },
                { step: '5', text: 'Run Beaconmon for a week alongside Visualping to verify you are catching the same changes, then cancel Visualping.' },
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
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
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

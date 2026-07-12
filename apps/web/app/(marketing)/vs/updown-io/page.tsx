import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs updown.io for Shopify (2026)',
  description:
    'updown.io vs Beaconmon: honest comparison for ecommerce stores. updown.io has no competitor tracking or Weekly Competitor Report. Try Beaconmon free.',
  alternates: { canonical: 'https://beaconmon.com/vs/updown-io' },
  openGraph: { url: 'https://beaconmon.com/vs/updown-io' },
};

const TABLE_ROWS = [
  {
    feature: 'Competitor monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Content change monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify / WooCommerce specific setup',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'HTTP(S) uptime checks',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: true,
  },
  {
    feature: 'SSL certificate expiry',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: true,
  },
  {
    feature: 'Domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Public status pages',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: true,
  },
  {
    feature: 'Public API',
    beaconmon: 'No',
    competitor: '✓ Simple, well documented',
    beaconmonGood: false,
  },
  {
    feature: 'Pricing model',
    beaconmon: 'Flat monthly tiers',
    competitor: 'Pay-as-you-go credits',
    beaconmonGood: false,
  },
];

const UPDOWN_STRENGTHS = [
  {
    title: 'A minimalist, developer-first interface',
    body: 'updown.io strips uptime monitoring down to the essentials. There is no dashboard clutter, no upsell banners, just check status, response time graphs, and alerts. Developers who want a tool that gets out of the way tend to like it a lot.',
  },
  {
    title: 'A straightforward public API',
    body: 'updown.io was built with API access as a first-class citizen. If you want to pull check data into your own tooling or script monitor creation, the API is simple and well documented. Beaconmon does not currently offer a public API.',
  },
  {
    title: 'Fast check intervals',
    body: 'updown.io is known in developer communities for checking frequently and surfacing incidents fast, which matters if you want to catch short blips rather than only sustained outages.',
  },
  {
    title: 'Pay-as-you-go pricing',
    body: 'Instead of flat monitor-count tiers, updown.io meters usage by check volume with a credits-based model and a free tier for low volume. If you run a handful of infrequent checks, you may pay less than a flat-tier plan would charge.',
  },
];

const SWITCH_REASONS = [
  'updown.io cannot track competitor prices, product listing changes, or promotional copy. Beaconmon checks those on every monitoring cycle.',
  'Domain expiry tracking is not in updown.io, only SSL certificate expiry. Beaconmon alerts you at 30, 14, and 7 days before a domain expires too.',
  'updown.io has no Shopify or WooCommerce specific setup. Beaconmon detects your platform during onboarding and suggests the right monitors from step one.',
  'The Weekly Competitor Report gives you a plain-language summary of every change detected across your monitored competitors, sent to email or Slack.',
  'updown.io is a pure uptime tool. Beaconmon bundles uptime, SSL and domain expiry, and competitor intelligence in one place instead of requiring a separate tool for competitive tracking.',
];

const FAQ_ITEMS = [
  {
    q: 'Is updown.io a good uptime monitoring tool?',
    a: 'Yes. updown.io is a well-regarded, developer-focused uptime monitor known for its minimalist interface, fast check intervals, and a simple public API. If uptime and SSL monitoring alone is all you need, and you like pay-as-you-go pricing, updown.io is a solid choice.',
  },
  {
    q: 'When does updown.io make more sense than Beaconmon?',
    a: 'updown.io is the stronger choice if you only need HTTP(S) uptime checks and SSL expiry monitoring, want a public API to script your monitoring setup, and prefer paying by check volume rather than a flat monthly tier. For a solo developer monitoring a side project, that combination is hard to beat.',
  },
  {
    q: 'Can updown.io track competitor prices or content changes?',
    a: 'No. updown.io checks HTTP availability, response time, and SSL certificate status. It cannot parse page content, detect price or promo changes, or alert you when a competitor updates their site. That is a separate category of tool that updown.io does not address.',
  },
  {
    q: 'Does updown.io have Shopify or WooCommerce specific features?',
    a: 'No. updown.io is platform-agnostic and treats every monitored URL the same way. Beaconmon detects Shopify and WooCommerce stores during onboarding and sets up monitors, including competitor presets, specifically for ecommerce.',
  },
  {
    q: 'How long does migrating from updown.io to Beaconmon take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. Pull your check list from the updown.io dashboard or API, paste the URLs into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before cancelling updown.io.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs updown.io', item: 'https://beaconmon.com/vs/updown-io' },
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

export default function VsUpdownIoPage() {
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
            Switch from updown.io,<br />
            <span className="text-brand-green-ink">get competitor tracking too.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            updown.io is a genuinely good, developer-friendly uptime monitor: minimalist, fast, and pay-as-you-go. For a Shopify or WooCommerce store owner, it has no competitor monitoring, no content change detection, and no ecommerce-specific setup. The Weekly Competitor Report replaces a tool you would otherwise have to run separately.
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
              updown.io is built for developers who want simple, fast, pay-as-you-go uptime and SSL monitoring with a clean API. If you are a Shopify or WooCommerce store owner who also wants competitor price tracking, content change detection, and a weekly digest of what changed across the sites you watch, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">updown.io</th>
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

      {/* Where updown.io wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where updown.io genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. updown.io is better in several important categories, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {UPDOWN_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from updown.io usually share the same profile: they like the simplicity of the tool, but they are running a second manual process to check competitor prices and content, and they would rather have it built in.
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
              &ldquo;updown.io was great for the basics, but we were still checking competitor prices by hand every week. We moved to Beaconmon and kept the same uptime coverage, plus competitor monitoring, in one dashboard.&rdquo;
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
                How to migrate from updown.io
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week to confirm nothing is missed before cancelling updown.io.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into updown.io and pull your check list from the dashboard, or export it through the public API.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup detects Shopify or WooCommerce and suggests competitor monitors to add.' },
                { step: '4', text: 'Connect alert channels. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel updown.io from their account settings.' },
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
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

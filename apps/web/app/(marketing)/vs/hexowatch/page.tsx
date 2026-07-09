import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Hexowatch for Shopify Stores (2026): Honest Comparison',
  description:
    'Hexowatch vs Beaconmon: all-in-one web intelligence vs Shopify-native competitor tracking with uptime monitoring and Intelligence Digest. Full comparison. Try free, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/vs/hexowatch' },
  openGraph: { url: 'https://beaconmon.com/vs/hexowatch' },
};

const TABLE_ROWS = [
  {
    feature: 'Shopify competitor presets',
    beaconmon: '✓ Price, stock, copy selectors',
    competitor: 'No, manual setup',
    beaconmonGood: true,
  },
  {
    feature: 'Competitor monitoring',
    beaconmon: '✓ Ecommerce-focused',
    competitor: '✓ General purpose',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Availability checks',
    beaconmonGood: false,
  },
  {
    feature: 'Intelligence Digest (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No weekly digest',
    beaconmonGood: true,
  },
  {
    feature: 'AI change summaries',
    beaconmon: '✓ Growth+ (significance scored)',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Both included',
    competitor: 'SSL check included',
    beaconmonGood: true,
  },
  {
    feature: 'Monitor types offered',
    beaconmon: 'Focused: uptime, content, competitor',
    competitor: 'Many types (visual, API, keyword, etc.)',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'Limited free tier',
    beaconmonGood: false,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$24/mo (entry tier)',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You need a wide range of monitor types beyond content and uptime',
    body: "Hexowatch offers visual monitors, API monitors, keyword monitors, and more. If you are monitoring a broad mix of web assets across different check types, Hexowatch gives you more flexibility in a single subscription.",
  },
  {
    title: 'You are not focused on Shopify or WooCommerce',
    body: "Beaconmon's preset selectors and ecommerce-first UX are built around Shopify and WooCommerce. If your competitors run on entirely different platforms or you are monitoring non-ecommerce sites, Hexowatch's general-purpose approach fits better.",
  },
  {
    title: 'You want a lower entry price',
    body: "Hexowatch's entry tier starts below Beaconmon Starter. If you do not need the Intelligence Digest or AI significance scoring, the price difference is real at the low end.",
  },
];

const SWITCH_REASONS = [
  'You want competitor monitoring built specifically for Shopify and WooCommerce, with preset selectors for price, stock status, and promotional copy.',
  'You want a weekly Intelligence Digest delivered to Slack or email that groups and ranks every competitor change, without logging into a dashboard.',
  'You want AI to read each change and tell you whether it is significant enough to act on, not just that something changed on the page.',
  'You want uptime monitoring and competitor intelligence in one tool that is designed around the ecommerce store owner workflow, not a general web monitoring console.',
  'You want SSL and domain expiry warnings timed to protect your checkout, 30, 14, and 7 days before expiry.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Hexowatch and Beaconmon?',
    a: "Hexowatch is a general-purpose web monitoring platform with many monitor types. Beaconmon is built specifically for ecommerce stores: competitor price and content tracking with Shopify preset selectors, uptime monitoring, SSL expiry alerts, AI significance scoring, and an Intelligence Digest delivered to Slack or email. If you run a Shopify or WooCommerce store, Beaconmon's UX is shaped around your workflow. Hexowatch is built for broader use cases.",
  },
  {
    q: 'Does Hexowatch have an Intelligence Digest?',
    a: 'No. Hexowatch sends alerts when changes are detected, and you can view a change history in the dashboard. It does not bundle changes into a scheduled digest grouped by competitor and ranked by significance. The Intelligence Digest in Beaconmon is specifically designed so a store owner can get a Slack message every Monday morning summarizing everything that moved on competitor sites that week.',
  },
  {
    q: 'Can Hexowatch monitor Shopify competitors?',
    a: 'Yes, with manual configuration. You set up each watch with a CSS selector or visual region. Beaconmon provides preset selectors for Shopify and WooCommerce product price, inventory status, and promotional copy, so the setup for a typical Shopify competitor takes minutes rather than requiring you to inspect the page and write your own selectors.',
  },
  {
    q: 'Is Beaconmon more expensive than Hexowatch?',
    a: "Hexowatch's entry tier starts slightly lower. On a per-ecommerce-feature basis, Beaconmon includes things Hexowatch does not: Intelligence Digest, AI significance scoring, domain expiry alerts alongside SSL, and Shopify preset selectors. If you are using Hexowatch for general site monitoring and switching to Beaconmon for ecommerce intelligence, the comparison is less about price and more about fit.",
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Hexowatch', item: 'https://beaconmon.com/vs/hexowatch' },
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

export default function VsHexowatchPage() {
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
            Beaconmon vs Hexowatch<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Hexowatch is a broad web intelligence platform with many monitor types. Beaconmon is narrower and deeper: built specifically for Shopify and WooCommerce competitor tracking, with preset selectors, a weekly Intelligence Digest, and AI that scores which competitor changes actually matter to your store.
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
              Hexowatch covers more ground with its range of monitor types. Beaconmon goes deeper on ecommerce: Shopify preset selectors, Intelligence Digest delivered to Slack, AI significance scoring, and uptime monitoring all included from $29 per month. If you run a Shopify or WooCommerce store and want competitor intelligence designed for that workflow, Beaconmon is the more focused choice.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Hexowatch</th>
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

      {/* When to stay on Hexowatch */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Hexowatch
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Hexowatch has a broader feature set that suits certain monitoring needs Beaconmon does not cover.
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
                Usually it comes down to the ecommerce focus: preset selectors, delivered digests, and AI scoring built around the Shopify workflow.
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
              &ldquo;Hexowatch felt like a general tool I was bending toward ecommerce. Beaconmon felt like someone had already done that bending. The Intelligence Digest alone was worth the switch.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United Kingdom, migrated early 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Hexowatch
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The migration is straightforward. Most stores complete it in under 30 minutes.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Review your active Hexowatch monitors. Note which are for competitor content watching versus other monitor types. Beaconmon will cover the content and uptime monitors.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard asks for your store URL and competitor domains.' },
                { step: '3', text: 'For each competitor, choose what to track: price, stock status, promotional copy, or full-page content. The wizard provides preset selectors for Shopify and WooCommerce competitors.' },
                { step: '4', text: 'Set up alert channels: Slack for real-time alerts and the Intelligence Digest, email as a fallback.' },
                { step: '5', text: 'Run both tools in parallel for a week. Once Beaconmon is catching the changes you care about, cancel the Hexowatch monitors you have replicated.' },
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
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/distill" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Distill</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

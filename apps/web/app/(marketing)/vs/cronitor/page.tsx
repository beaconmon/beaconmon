import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Cronitor for Shopify (2026)',
  description:
    'Cronitor vs Beaconmon: honest comparison for ecommerce stores. Cronitor has no competitor tracking, e-commerce focus, or Weekly Competitor Report. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/cronitor' },
  openGraph: { url: 'https://beaconmon.com/vs/cronitor' },
};

const TABLE_ROWS = [
  {
    feature: 'Competitor price and content monitoring',
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
    feature: 'Uptime / website monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Cron / scheduled job monitoring',
    beaconmon: 'No',
    competitor: '✓ Core product',
    beaconmonGood: false,
  },
  {
    feature: 'Heartbeat monitoring for background jobs',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Status pages',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'SSL + domain expiry',
    beaconmon: '✓ Both included',
    competitor: 'Not the focus',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify / WooCommerce fit',
    beaconmon: '✓ Purpose-built',
    competitor: 'No, general engineering tool',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors',
    competitor: 'Limited monitors',
    beaconmonGood: true,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: 'Tens of dollars per month',
    beaconmonGood: false,
  },
];

const CRONITOR_STRENGTHS = [
  {
    title: 'Cron and scheduled job monitoring',
    body: "This is Cronitor's original core product. It alerts you when a scheduled job does not run, runs longer than expected, or fails outright. Beaconmon has no equivalent for this at all.",
  },
  {
    title: 'Heartbeat monitoring for background jobs',
    body: 'Cronitor accepts pings from long-running or background processes and alerts on silence, catching failures that never hit an HTTP endpoint. If your infrastructure depends on this kind of telemetry, Cronitor covers it and Beaconmon does not.',
  },
  {
    title: 'Built for engineering teams',
    body: 'Cronitor is designed around developer workflows: job pipelines, cron schedules, and infrastructure telemetry, not storefront pages. Teams with real DevOps needs get deeper tooling than a general uptime checker offers.',
  },
  {
    title: 'General-purpose reliability platform',
    body: 'Cronitor is not tied to any e-commerce platform, so it fits any stack running scheduled tasks, whether that is a SaaS product, a data pipeline, or a mixed engineering org.',
  },
];

const SWITCH_REASONS = [
  'Cronitor cannot track competitor prices, product listing changes, or promotional copy. Beaconmon checks those on every monitoring cycle.',
  'Beaconmon bundles uptime monitoring with SSL and domain expiry alerts and competitor intelligence in one dashboard, built specifically for Shopify and WooCommerce store owners.',
  "Cronitor's cron and heartbeat monitoring is aimed at engineering teams running scheduled jobs. Most solo e-commerce founders do not need that layer of infrastructure telemetry.",
  'Beaconmon has a permanent free plan with 10 monitors, no credit card required.',
  'The Weekly Competitor Report gives you a plain-language summary of every change detected across your monitored competitors, sent to email or Slack.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Cronitor track competitor prices or content changes?',
    a: 'No. Cronitor is an uptime, cron job, and heartbeat monitoring platform for engineering teams. It has no concept of competitor tracking or content change detection. That is a separate category of tool Cronitor does not address.',
  },
  {
    q: 'When does Cronitor make more sense than Beaconmon?',
    a: 'Cronitor is the stronger choice when your team needs to monitor scheduled jobs and background processes, not just website uptime. If you run cron jobs that must fire on schedule or background workers that need heartbeat checks, Cronitor has purpose-built tooling for that and Beaconmon does not offer it.',
  },
  {
    q: 'Is Cronitor free?',
    a: 'Cronitor offers a free tier with a limited number of monitors, and paid plans typically start in the tens of dollars per month for small teams. Beaconmon has a permanent free plan with 10 monitors and no credit card required.',
  },
  {
    q: 'How long does migrating from Cronitor to Beaconmon take?',
    a: 'For the uptime monitors you move over, most stores complete the migration in 10 to 15 minutes. Export your monitor list from Cronitor, paste the URLs into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before deciding what to cancel. Any cron or heartbeat monitors stay on Cronitor since Beaconmon does not cover that category.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Cronitor', item: 'https://beaconmon.com/vs/cronitor' },
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

export default function VsCronitorPage() {
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
            Switch from Cronitor,<br />
            <span className="text-brand-green-ink">get the Weekly Competitor Report.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Cronitor is a strong developer tool: uptime checks, cron and scheduled job monitoring, heartbeat monitoring for background processes, and status pages. For a Shopify or WooCommerce store owner, it has no competitor monitoring, no content change detection, and no e-commerce focus at all. Beaconmon covers uptime plus competitor price and content intelligence in one self-serve tool built for store owners.
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
              Cronitor is built for engineering teams that need cron job monitoring and heartbeat checks on background processes, on top of standard uptime monitoring. If you are a Shopify or WooCommerce store owner who wants uptime monitoring plus competitor price and content tracking in one self-serve tool, without needing a separate competitor-intelligence product, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Cronitor</th>
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

      {/* Where Cronitor wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Cronitor genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Cronitor is better in several important categories, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {CRONITOR_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from Cronitor usually share the same profile: they are not running cron jobs or background workers that need dedicated monitoring, they just want uptime checks plus competitor tracking that Cronitor cannot do.
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
              &ldquo;Cronitor was great for our uptime checks, but we do not run any scheduled jobs, so most of the product was wasted on us. We were manually checking three competitor sites every week for price changes. Beaconmon replaced the uptime checks and gave us the competitor report we were doing by hand.&rdquo;
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
                How to migrate from Cronitor
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the uptime migration in 10 to 15 minutes. Run both tools in parallel for a week to confirm nothing is missed before cancelling any Cronitor monitors you no longer need.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Cronitor and export the list of uptime monitors you want to move. Leave any cron or heartbeat monitors where they are, Beaconmon does not cover that category.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard, then add your competitor storefronts so content and price monitoring starts on the same setup.' },
                { step: '4', text: 'Connect alert channels. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel the Cronitor monitors you replaced from their billing portal.' },
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
            <Link href="/vs/checkly" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Checkly</Link>
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

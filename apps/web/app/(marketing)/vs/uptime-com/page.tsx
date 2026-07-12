import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Uptime.com for Shopify Stores (2026)',
  description:
    'Uptime.com vs Beaconmon: honest comparison for ecommerce stores. Uptime.com has no competitor tracking, content monitoring, or Weekly Competitor Report. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/uptime-com' },
  openGraph: { url: 'https://beaconmon.com/vs/uptime-com' },
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
    feature: 'Free plan',
    beaconmon: '10 monitors',
    competitor: 'None (14-day trial)',
    beaconmonGood: true,
  },
  {
    feature: 'Check types',
    beaconmon: 'Uptime, SSL, domain, content',
    competitor: '30+ (uptime, SSL, TCP, API, DNS, ping, page speed)',
    beaconmonGood: false,
  },
  {
    feature: 'Transaction/synthetic monitoring',
    beaconmon: 'No',
    competitor: 'Yes',
    beaconmonGood: false,
  },
  {
    feature: 'SLA reporting',
    beaconmon: 'No',
    competitor: 'Yes, exportable',
    beaconmonGood: false,
  },
  {
    feature: 'Check frequency (top plans)',
    beaconmon: '30 seconds',
    competitor: '1 minute',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry',
    beaconmon: '✓ Both included',
    competitor: 'SSL only',
    beaconmonGood: true,
  },
  {
    feature: 'Status pages',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo',
    competitor: '$9/mo (calculator based, add ons)',
    beaconmonGood: false,
  },
];

const UPTIME_STRENGTHS = [
  {
    title: 'Enterprise SLA reporting',
    body: 'Uptime.com generates exportable uptime SLA reports out of the box. If a contract or an enterprise customer requires formal uptime documentation, Uptime.com has that built in and Beaconmon does not.',
  },
  {
    title: '30-plus check types',
    body: 'Uptime.com checks uptime, SSL, TCP, API, DNS, ping, and page speed among 30 or more check types. Beaconmon focuses on uptime, SSL, domain expiry, and content change detection. For teams that need broad protocol level monitoring, Uptime.com covers more ground.',
  },
  {
    title: 'Transaction and synthetic monitoring',
    body: 'You can script a multi-step browser flow across login, add to cart, and checkout to monitor an entire user journey end to end. Beaconmon does not offer scripted transaction monitoring.',
  },
  {
    title: 'Unlimited users and group checks',
    body: 'Uptime.com allows unlimited team members and grouped checks on its plans, which suits larger ops teams managing many properties under one account.',
  },
];

const SWITCH_REASONS = [
  'Uptime.com cannot track competitor prices, product listing changes, or promotional copy. Beaconmon checks those on every monitoring cycle.',
  'Uptime.com has no permanent free plan, only a 14-day trial. Beaconmon gives you 10 monitors free forever with no credit card.',
  'Uptime.com pricing is calculator based: Basic Checks, Advanced Checks, RUM, Status Pages, Alerting, and Private Locations are priced as separate add-on modules, which makes the final bill harder to predict upfront.',
  'Some Uptime.com customers report steep, unannounced price increases at renewal. That is a real reason people go shopping for alternatives, and it is worth confirming your renewal rate in writing before you commit.',
  'The Weekly Competitor Report gives you a plain language summary of every change detected across your monitored sites, sent to email or Slack, something Uptime.com does not offer at all.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Uptime.com have a free plan?',
    a: 'No. Uptime.com starts at $9 per month ($108 per year billed annually) on a calculator based model, with a 14-day free trial and no credit card required. There is no permanent free tier. Beaconmon has a permanent free plan with 10 monitors and no credit card required.',
  },
  {
    q: 'When does Uptime.com make more sense than Beaconmon?',
    a: 'Uptime.com is the stronger choice when you need exportable SLA reports, 30 or more check types across protocols like TCP, API, and DNS, or scripted transaction monitoring across multi-step checkout flows. For a larger ops team that needs unlimited users and formal uptime documentation for contracts, Uptime.com has more mature enterprise tooling.',
  },
  {
    q: 'Can Uptime.com track competitor prices or content changes?',
    a: 'No. Uptime.com checks availability, response time, and a range of protocol level signals. It does not parse HTML for competitor pricing, product listings, or promotional copy, and it does not send change alerts on competitor activity. That is a separate category of tool that Uptime.com does not address.',
  },
  {
    q: 'Why do people look for alternatives to Uptime.com?',
    a: 'The most common reasons are the calculator based pricing, where add-on modules like RUM and Private Locations stack up the bill, and reports from some customers of steep price increases at renewal that were not clearly flagged in advance. Neither is disqualifying on its own, but both are worth checking directly with Uptime.com before you commit to a plan.',
  },
  {
    q: 'How long does migrating from Uptime.com to Beaconmon take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. Export your check list from Uptime.com, paste the URLs into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before cancelling Uptime.com.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Uptime.com', item: 'https://beaconmon.com/vs/uptime-com' },
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

export default function VsUptimeComPage() {
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
            Switch from Uptime.com,<br />
            <span className="text-brand-green-ink">get the daily Shopify brief.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Uptime.com is a capable monitoring platform: 30-plus check types, SLA reporting, and scripted transaction monitoring, priced on a calculator that starts at $9 a month. For a Shopify or WooCommerce store owner, it has no competitor monitoring and no content change detection. The Weekly Competitor Report replaces the manual checking most store owners are already doing by hand.
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
              Uptime.com is built for teams that need broad protocol coverage, SLA reporting, and scripted transaction checks, and its calculator based pricing lets you pay only for the modules you use. If you are a Shopify store owner who wants competitor price tracking, content change detection, and a daily digest of what changed across the sites you monitor, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Uptime.com</th>
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

      {/* Where Uptime.com wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Uptime.com genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Uptime.com is better in several important categories, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {UPTIME_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from Uptime.com usually share the same profile: they are not using SLA reporting or transaction monitoring, the calculator based pricing has grown harder to predict as they add modules, and they want competitor tracking that Uptime.com cannot do.
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
              &ldquo;Uptime.com did the job, but every time I added a module the bill crept up and the renewal quote was higher than what I signed up for. I wanted something simpler with a flat price and competitor tracking built in, not bolted on. Beaconmon had that set up the same afternoon.&rdquo;
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
                How to migrate from Uptime.com
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week before cancelling Uptime.com.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Uptime.com, go to your checks dashboard, and note or export your active monitor URLs.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup suggests alert thresholds and identifies additional monitors worth adding.' },
                { step: '4', text: 'Connect alert channels. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel Uptime.com from their billing portal.' },
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
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

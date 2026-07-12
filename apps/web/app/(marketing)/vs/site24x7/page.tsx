import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Site24x7 for Shopify Stores (2026)',
  description:
    'Site24x7 vs Beaconmon: honest comparison for ecommerce stores. Site24x7 is an IT infrastructure suite with no competitor tracking and add-on pricing. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/site24x7' },
  openGraph: { url: 'https://beaconmon.com/vs/site24x7' },
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
    competitor: '50 resources, uptime only',
    beaconmonGood: false,
  },
  {
    feature: 'Server / infrastructure monitoring',
    beaconmon: 'No',
    competitor: 'Yes (Lite from $9/mo)',
    beaconmonGood: false,
  },
  {
    feature: 'Transaction / synthetic monitoring',
    beaconmon: 'No',
    competitor: 'Yes (higher tiers)',
    beaconmonGood: false,
  },
  {
    feature: 'Check locations',
    beaconmon: '5 regions',
    competitor: '32+ locations',
    beaconmonGood: false,
  },
  {
    feature: 'SSL + domain expiry',
    beaconmon: '✓ Both included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Status pages',
    beaconmon: '✓ Included',
    competitor: '✓ Included (3 to 10, by tier)',
    beaconmonGood: false,
  },
  {
    feature: 'Pricing model',
    beaconmon: 'Flat plan pricing',
    competitor: 'Add-ons billed separately',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$9/mo (Web Uptime)',
    beaconmonGood: false,
  },
];

const SITE24X7_STRENGTHS = [
  {
    title: 'A genuinely free tier',
    body: 'Site24x7 offers a perpetual free plan covering up to 50 resources with email alerts. Beaconmon caps its free plan at 10 monitors. If you just need basic uptime checks on a budget of zero, Site24x7 gives you more headroom.',
  },
  {
    title: 'Infrastructure and app monitoring in one console',
    body: 'Site24x7 covers servers, networks, cloud resources, and applications alongside website checks. If your team also needs to watch CPU, memory, and network health on the infrastructure behind your store, that is one login instead of several tools.',
  },
  {
    title: 'Deep DevOps and MSP feature set',
    body: 'Transaction monitoring, API monitoring, and log management are built in at higher tiers. Site24x7 comes from Zoho and ManageEngine, so it leans enterprise, with tooling for MSPs managing monitoring across many client environments.',
  },
  {
    title: 'Faster polling and broader coverage on top plans',
    body: 'Enterprise Plus Web checks as fast as 30 seconds from 16 locations, and even the entry Web Uptime tier checks from 32 locations. Beaconmon covers 5 regions. For a team that needs granular global check coverage, Site24x7 has more reach.',
  },
];

const SWITCH_REASONS = [
  'Site24x7 cannot track competitor prices, product listing changes, or promotional copy. It is an infrastructure and uptime suite, not a competitor intelligence tool.',
  'Beaconmon delivers a Weekly Competitor Report summarizing every change detected across the sites you monitor, sent to email or Slack.',
  'Site24x7 pricing gets complicated once you add extra uptime monitors, RUM views, log ingestion, or synthetic runs, all billed as separate add-ons. Beaconmon plans are flat.',
  'Site24x7 is built for IT-ops and MSP teams watching servers, networks, and apps. Beaconmon is built for a Shopify or WooCommerce store owner who wants uptime plus competitor visibility.',
  'You do not need a unified infrastructure console if you are not running your own servers. Most Shopify stores have nothing to monitor at the infrastructure layer.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Site24x7 have a free plan?',
    a: 'Yes. Site24x7 offers a perpetual free plan for up to 50 resources, covering uptime monitoring with email alerts. Paid plans come with a 30-day free trial. Beaconmon has a permanent free plan with 10 monitors, and unlike Site24x7 free, it includes competitor monitoring.',
  },
  {
    q: 'When does Site24x7 make more sense than Beaconmon?',
    a: 'Site24x7 is the stronger choice when you need infrastructure monitoring (servers, networks, cloud) alongside website checks, transaction monitoring across multi-step flows, or check coverage from 32-plus global locations. For an IT-ops or MSP team managing a broader stack than just a storefront, Site24x7 has more depth.',
  },
  {
    q: 'Can Site24x7 track competitor prices or content changes?',
    a: 'No. Site24x7 is an infrastructure, application, and uptime monitoring suite. It cannot parse a competitor page for price or content changes. Competitor intelligence is a separate category of tool that Site24x7 does not address.',
  },
  {
    q: 'Is Site24x7 pricing predictable?',
    a: 'Not always. Base plans are clearly priced, but extra uptime monitors, additional RUM views, log ingestion, and extra synthetic runs are priced and billed as separate add-ons. Reviewers commonly flag this as making total monthly cost hard to predict in advance. Beaconmon uses flat plan pricing with no add-on line items.',
  },
  {
    q: 'How long does migrating from Site24x7 take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. Export your monitor list from Site24x7, paste the URLs into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before cancelling Site24x7.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Site24x7', item: 'https://beaconmon.com/vs/site24x7' },
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

export default function VsSite24x7Page() {
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
            Switch from Site24x7,<br />
            <span className="text-brand-green-ink">get the daily Shopify brief.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Site24x7 is a broad IT infrastructure monitoring suite built for DevOps teams and MSPs watching servers, networks, cloud, and apps in one console. It is not built for a Shopify or WooCommerce store owner. There is no competitor tracking, no content change detection, and add-on pricing that gets hard to predict. Beaconmon is built for Shopify, not IT ops.
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
              Site24x7 is built for IT-ops teams and MSPs that need unified visibility across servers, networks, cloud, and applications. If you are a Shopify store owner who wants competitor price tracking, content change detection, and a weekly report of what changed across your monitored sites, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Site24x7</th>
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

      {/* Where Site24x7 wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Site24x7 genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Site24x7 is better in several important categories, especially if your business runs its own infrastructure, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {SITE24X7_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from Site24x7 usually share the same profile: they have no servers or networks to monitor, they do not need an IT-ops console, and they want competitor tracking that Site24x7 cannot do.
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
              &ldquo;Site24x7 made sense back when I thought I needed server monitoring. I don&rsquo;t run any of my own infrastructure, it is all Shopify. I was paying for add-ons I never used and still had no visibility into what competitors were doing. Beaconmon replaced it with something actually built for a store owner.&rdquo;
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
                How to migrate from Site24x7
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week before cancelling Site24x7.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Site24x7, go to your Website Monitoring dashboard, and note or export your monitored URLs.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup suggests alert thresholds and identifies additional monitors worth adding.' },
                { step: '4', text: 'Add competitor monitors. Paste each competitor URL to start tracking price and content changes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel Site24x7 from their billing settings.' },
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
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

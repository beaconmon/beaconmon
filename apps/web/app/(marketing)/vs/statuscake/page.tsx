import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs StatusCake for Shopify (2026)',
  description:
    "StatusCake vs Beaconmon: honest comparison for ecommerce stores. StatusCake has no competitor monitoring, no content change detection, no Intelligence Digest. Try Beaconmon free, no card needed.",
  alternates: { canonical: 'https://beaconmon.com/vs/statuscake' },
  openGraph: { url: 'https://beaconmon.com/vs/statuscake' },
};

const TABLE_ROWS = [
  {
    feature: 'Competitor monitoring',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Content change monitoring',
    beaconmon: '✓ Included',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'AI change summaries',
    beaconmon: '✓ Growth+',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Intelligence Digest',
    beaconmon: '✓ Starter+',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Smart Alerts (anomaly)',
    beaconmon: '✓ Growth+',
    competitor: '—',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors',
    competitor: '10 monitors',
    beaconmonGood: false,
  },
  {
    feature: 'Check frequency (paid)',
    beaconmon: '30 seconds',
    competitor: '1 minute',
    beaconmonGood: true,
  },
  {
    feature: 'Multi-location checks',
    beaconmon: '5 regions',
    competitor: 'Limited (paid)',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry',
    beaconmon: '✓ Both included',
    competitor: 'SSL only',
    beaconmonGood: true,
  },
  {
    feature: 'Status pages (custom domain)',
    beaconmon: '✓ Included',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Pricing',
    beaconmon: '$29/mo · $79/mo',
    competitor: 'From $24.99/mo',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You only need basic uptime monitoring',
    body: "StatusCake's free tier includes 10 monitors with no time limit. If your goal is knowing when your store goes down and nothing else, it does the job at no cost.",
  },
  {
    title: 'You are not monitoring competitors',
    body: "If you have no interest in tracking competitor prices, product listings, or promotional copy, StatusCake's uptime monitoring covers the basics for free.",
  },
  {
    title: 'You are monitoring non-ecommerce sites',
    body: 'For internal tools, blogs, or side projects where competitor intelligence is irrelevant, StatusCake is a sensible default.',
  },
];

const SWITCH_REASONS = [
  'You want to track when competitors change prices, product listings, or run promotions.',
  'You want a daily Intelligence Digest in Slack summarizing every change detected on competitor sites.',
  'You need SSL and domain expiry warnings so a forgotten renewal never breaks your checkout.',
  'StatusCake has no competitor monitoring and no content change detection of any kind.',
  'Both tools start at a similar price. Beaconmon includes competitor intelligence; StatusCake does not.',
];

const FAQ_ITEMS = [
  {
    q: 'Does StatusCake have a free plan?',
    a: "Yes. StatusCake's free plan includes 10 monitors. Beaconmon's free plan also includes 10 monitors plus one competitor monitor. The difference is that Beaconmon's free tier includes competitor tracking from day one.",
  },
  {
    q: 'Can StatusCake track competitor prices or content changes?',
    a: 'No. StatusCake checks whether a URL responds with a success status code. It cannot parse HTML, detect content changes, or alert on competitor activity. That is a separate category of tool.',
  },
  {
    q: 'Is Beaconmon more expensive than StatusCake?',
    a: 'StatusCake paid plans start at around $24.99 per month. Beaconmon Starter is $29 per month, but includes competitor monitoring, content change detection, and the Intelligence Digest. If you are comparing on uptime alone, the prices are similar. If you count competitor tracking, Beaconmon is better value for ecommerce stores.',
  },
  {
    q: 'How long does migrating from StatusCake take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. Export your monitors from StatusCake, paste the URLs into Beaconmon onboarding, add your competitor monitors, and run both tools in parallel for a week before cancelling StatusCake.',
  },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
    { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
    { '@type': 'ListItem', position: 3, name: 'Beaconmon vs StatusCake', item: 'https://beaconmon.com/vs/statuscake' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
};

export default function VsStatusCakePage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />
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
            Switch from StatusCake,<br />
            <span className="text-brand-green-ink">get the daily Shopify brief.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            StatusCake has a generous free tier for basic uptime pings. What it cannot do is tell you when a competitor changed their pricing page, updated product listings, or ran a flash sale. Beaconmon tracks all of that and delivers it as a daily digest.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: May 2026</p>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              StatusCake&apos;s free plan is strong for uptime monitoring (10 monitors, no card). But it has no competitor monitoring, no content change detection, and no Intelligence Digest. For a Shopify or WooCommerce store that wants competitor intelligence alongside uptime, Beaconmon is built for that job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">StatusCake</th>
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

      {/* When to stay on StatusCake */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on StatusCake
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                StatusCake is a solid uptime tool for a specific use case. Before switching, it is worth being clear about where it works well.
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
                Why ecommerce stores choose Beaconmon over StatusCake
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The free tier is StatusCake&apos;s strongest selling point. Once you need competitor monitoring or content change detection, it is not there.
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
              &ldquo;StatusCake was fine for basic uptime. I switched once I realized I was manually checking three competitor sites every week to see if they had changed their pricing. The Intelligence Digest replaced all of that.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, Australia, migrated 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to migrate from StatusCake
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week before cancelling StatusCake.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into StatusCake, go to Uptime Monitoring, and note or export your active monitor URLs.' },
                { step: '2', text: 'Sign up for Beaconmon. The free plan covers 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup suggests alert thresholds.' },
                { step: '4', text: 'Add competitor monitors. Paste each competitor URL to start tracking content and price changes.' },
                { step: '5', text: 'Run both tools in parallel for a week, then cancel StatusCake from their billing settings.' },
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
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Uptime</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

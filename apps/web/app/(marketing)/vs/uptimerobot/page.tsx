import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs UptimeRobot for Shopify Stores (2026): Honest Comparison',
  description:
    'UptimeRobot vs Beaconmon: competitor monitoring, content change detection, Intelligence Digest, and pricing compared side-by-side for ecommerce stores. Try free, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/vs/uptimerobot' },
};

const TABLE_ROWS = [
  {
    feature: 'Free plan',
    beaconmon: '10 monitors',
    competitor: '50 monitors',
    beaconmonGood: false,
  },
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
    feature: 'AI change summaries',
    beaconmon: '✓ Growth+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Intelligence Digest',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Smart Alerts (anomaly)',
    beaconmon: '✓ Growth+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Multi-location checks',
    beaconmon: '5 regions',
    competitor: '1 location (free), multi (Pro+)',
    beaconmonGood: false,
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
    competitor: 'Paid add-on',
    beaconmonGood: true,
  },
  {
    feature: 'Check frequency (paid)',
    beaconmon: '30 seconds',
    competitor: '1 minute',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo',
    competitor: 'Free / $7/mo',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You only need uptime pings',
    body: "UptimeRobot's free tier is genuinely hard to beat: 50 monitors, 5-minute intervals, no credit card, no expiry. If your goal is knowing when your site goes down and nothing else, it works perfectly.",
  },
  {
    title: 'You are monitoring side projects or internal tools',
    body: 'For a developer checking whether a personal project is up, UptimeRobot costs nothing and takes two minutes to configure. That is the right tool for that job.',
  },
  {
    title: 'Budget is the primary constraint',
    body: 'UptimeRobot Pro is around $7 per month for 50 monitors on 1-minute intervals. If you do not need competitor tracking or content change detection, that is genuinely good value.',
  },
];

const SWITCH_REASONS = [
  'You want to see when a competitor drops prices, updates product listings, or launches a promotion, without checking manually.',
  'You want a weekly Intelligence Digest in Slack summarizing every change detected on competitor sites in plain language.',
  'You need SSL and domain expiry warnings sent 30, 14, and 7 days before expiry so a forgotten renewal never kills your checkout.',
  'You want 30-second check intervals and multi-region confirmation to eliminate false positives during high-traffic campaigns.',
  'You want AI-summarized content diffs that tell you what changed on a page, not just that something changed.',
];

const FAQ_ITEMS = [
  {
    q: 'Is UptimeRobot really free?',
    a: "Yes. UptimeRobot's free plan gives you 50 monitors checked every 5 minutes, with no credit card and no time limit. It is one of the most generous free tiers in uptime monitoring. If basic ping checks are all you need, it works well.",
  },
  {
    q: 'Does UptimeRobot monitor competitors?',
    a: 'No. UptimeRobot checks whether a URL responds with a 2xx status code. It cannot detect content changes, price changes, or anything that happens within a page. For that you need a tool that parses HTML on each check.',
  },
  {
    q: 'Can I migrate my UptimeRobot monitors to Beaconmon?',
    a: 'Yes. Export your monitor list from UptimeRobot under Settings, then paste the URLs into Beaconmon during onboarding. The Smart Setup wizard creates monitors for each URL and suggests alert thresholds based on your site type.',
  },
  {
    q: 'Is Beaconmon more expensive than UptimeRobot Pro?',
    a: 'For basic uptime checks, yes. UptimeRobot Pro is around $7 per month. Beaconmon Starter is $29 per month. If you are tracking competitor prices, catching SSL expiry before checkout breaks, and getting weekly change digests, the difference pays for itself quickly. If you are not doing any of that, UptimeRobot Pro is the better value.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs UptimeRobot', item: 'https://beaconmon.com/vs/uptimerobot' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Beaconmon',
      applicationCategory: 'BusinessApplication',
      description: 'Ecommerce website and competitor intelligence platform for Shopify and WooCommerce stores.',
      url: 'https://beaconmon.com',
      offers: {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'USD',
      },
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

export default function VsUptimeRobotPage() {
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
            Beaconmon vs UptimeRobot<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            UptimeRobot&apos;s free plan (50 monitors, no card, no expiry) is the best free uptime tier available. If you run a Shopify or WooCommerce store and want to track competitor prices, receive a weekly Intelligence Digest, or get domain expiry warnings before your checkout breaks, that is where the two tools stop overlapping.
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
              UptimeRobot tells you when your site goes down. It will not tell you when a competitor drops prices, when your SSL certificate has 7 days left, or what changed on a competitor homepage last Tuesday. If those questions matter to your store, Beaconmon is built for them. If they do not, UptimeRobot&apos;s free plan is the right tool.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">UptimeRobot</th>
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

      {/* When to stay on UptimeRobot */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on UptimeRobot
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                UptimeRobot is a genuinely good tool for a specific use case. Before switching, it is worth being clear about where it excels and where it falls short.
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
                Usually it comes down to the same gaps: competitor tracking, content change alerts, or catching SSL and domain expiry before it costs revenue.
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
              &ldquo;Switching from UptimeRobot took maybe 15 minutes. The main reason I switched was competitor tracking. I could see when a competitor updated their pricing page without checking it manually every week.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">WooCommerce store owner, United Kingdom, migrated early 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to migrate from UptimeRobot
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The migration is straightforward. Most stores complete it in under 20 minutes, and you can run both tools in parallel while you verify Beaconmon is working correctly.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into UptimeRobot, go to Settings, and export your monitor list as a CSV.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard accepts a list of URLs.' },
                { step: '3', text: 'Paste your monitor URLs. Smart Setup suggests alert thresholds and additional monitors based on your site type.' },
                { step: '4', text: 'Connect your alert channels. Email is pre-configured; Slack takes about 2 minutes.' },
                { step: '5', text: 'Run both tools in parallel for a week. Once you are satisfied, cancel UptimeRobot from their billing page.' },
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
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Uptime</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

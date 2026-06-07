import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Switch from Pingdom: Competitor Intelligence + Uptime for Shopify (2026)',
  description:
    'Pingdom vs Beaconmon: honest comparison for ecommerce stores. Pingdom has no free plan, no competitor tracking, no Intelligence Digest. See what you are missing. Try free, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/vs/pingdom' },
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
    feature: 'Intelligence Digest',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors',
    competitor: 'None (30-day trial)',
    beaconmonGood: true,
  },
  {
    feature: 'Real User Monitoring',
    beaconmon: 'No',
    competitor: 'Yes',
    beaconmonGood: false,
  },
  {
    feature: 'Transaction monitoring',
    beaconmon: 'No',
    competitor: 'Yes',
    beaconmonGood: false,
  },
  {
    feature: 'Check locations',
    beaconmon: '5 regions',
    competitor: '70+ locations',
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
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo',
    competitor: '$15/mo (no free tier)',
    beaconmonGood: false,
  },
];

const PINGDOM_STRENGTHS = [
  {
    title: 'Real User Monitoring',
    body: 'Pingdom collects performance data from actual visitor browsers, not synthetic checks. If you have 100,000 or more monthly visitors and want to understand real-world load times by geography, RUM gives you data that synthetic monitoring cannot replicate.',
  },
  {
    title: 'Transaction monitoring',
    body: 'You can script a multi-step browser flow across add-to-cart, checkout, and payment pages to monitor end-to-end. Beaconmon does not offer scripted transaction monitoring at launch.',
  },
  {
    title: '70-plus check locations',
    body: 'Pingdom checks from over 70 locations worldwide. Beaconmon covers 5 regions. For stores with customers distributed across Southeast Asia and Latin America simultaneously, that geographic breadth matters.',
  },
  {
    title: 'Enterprise SLA reporting',
    body: 'Pingdom generates exportable uptime SLA reports with audit trails. If enterprise contracts require formal uptime documentation, Pingdom has that built in and Beaconmon does not.',
  },
];

const SWITCH_REASONS = [
  'Pingdom has no free plan. If you want to evaluate a monitoring tool before committing, Beaconmon gives you 10 monitors with no credit card and no time limit.',
  'Pingdom cannot track competitor prices, product listing changes, or promotional copy. Beaconmon checks those on every monitoring cycle.',
  'Domain expiry tracking is not in Pingdom. Beaconmon alerts you at 30, 14, and 7 days before a domain expires.',
  'Status pages in Pingdom cost extra. In Beaconmon they are included from the free plan, with custom domain support on paid tiers.',
  'The daily Intelligence Digest gives you a plain-language summary of every change detected across your monitored sites, sent to email or Slack.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Pingdom have a free plan?',
    a: 'No. Pingdom starts at $15 per month for Synthetic Monitoring with no free tier. They offer a 30-day trial. Beaconmon has a permanent free plan with 10 monitors and no credit card required.',
  },
  {
    q: 'When does Pingdom make more sense than Beaconmon?',
    a: 'Pingdom is the stronger choice when your team needs Real User Monitoring from actual visitor traffic, scripted transaction monitoring across multi-step checkout flows, or check coverage from 70-plus global locations. For a DevOps team running a high-traffic SaaS product with SLA compliance requirements, Pingdom has more mature enterprise tooling.',
  },
  {
    q: 'Can Pingdom track competitor prices or content changes?',
    a: 'No. Pingdom checks availability and load time. It cannot parse HTML, detect content changes, or alert on competitor activity. That is a separate category of tool that Pingdom does not address.',
  },
  {
    q: 'How long does migrating from Pingdom to Beaconmon take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. Export your check list from Pingdom under Monitoring and Checks, paste the URLs into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before cancelling Pingdom.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Pingdom', item: 'https://beaconmon.com/vs/pingdom' },
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

export default function VsPingdomPage() {
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
            Switch from Pingdom,<br />
            <span className="text-brand-green-ink">get the daily Shopify brief.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Pingdom is a strong enterprise tool: real user monitoring, scripted transaction checks, 70-plus global locations. For a Shopify or WooCommerce store owner, it has no competitor intelligence, no content change detection, and status pages cost extra. The Intelligence Digest replaces three tools worth of manual competitor checking.
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
              Pingdom is built for DevOps teams that need real user monitoring and scripted transaction checks. If you are a Shopify store owner who wants competitor price tracking, content change detection, and a daily digest of what changed across your monitored sites, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Pingdom</th>
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

      {/* Where Pingdom wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Pingdom genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Pingdom is better in several important categories, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {PINGDOM_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from Pingdom usually share the same profile: they are not using RUM or transaction monitoring, they are paying for enterprise features they do not need, and they want competitor tracking that Pingdom cannot do.
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
              &ldquo;Pingdom was overkill for us. We were paying for RUM we never looked at and multi-location checks for a regional store. Status pages cost extra on top of that. We moved to Beaconmon and had competitor monitoring set up the same afternoon.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, Canada, migrated 2025</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to migrate from Pingdom
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week to confirm nothing is missed before cancelling Pingdom.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into Pingdom, go to Monitoring and then Checks, and export your check list.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup suggests alert thresholds and identifies additional monitors worth adding.' },
                { step: '4', text: 'Connect alert channels. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel Pingdom from their billing portal.' },
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
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Uptime</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

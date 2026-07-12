import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Checkly for Shopify (2026)',
  description:
    'Checkly vs Beaconmon: honest comparison for ecommerce stores. Checkly is code-first for developers, with no competitor tracking or no-code setup. Try free.',
  alternates: { canonical: 'https://beaconmon.com/vs/checkly' },
  openGraph: { url: 'https://beaconmon.com/vs/checkly' },
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
    feature: 'No-code setup',
    beaconmon: '✓ Dashboard only',
    competitor: 'No, code required',
    beaconmonGood: true,
  },
  {
    feature: 'Monitoring as Code (CLI, Terraform, CI/CD)',
    beaconmon: 'No',
    competitor: '✓ Core feature',
    beaconmonGood: false,
  },
  {
    feature: 'Playwright-based E2E / browser checks',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Heartbeat checks',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Shopify / WooCommerce onboarding',
    beaconmon: '✓ Detects store platform',
    competitor: 'No',
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
    competitor: 'Usage-based, tiered',
    beaconmonGood: false,
  },
];

const CHECKLY_STRENGTHS = [
  {
    title: 'Monitoring as Code',
    body: 'Checkly defines every check in JavaScript or TypeScript, version-controlled alongside your application code. Engineering teams that already deploy through Terraform, Pulumi, or a CLI-driven pipeline can manage monitoring the same way. Beaconmon has no code-based configuration; everything is set up through the dashboard.',
  },
  {
    title: 'Playwright-based browser checks',
    body: 'Checkly runs full end-to-end synthetic tests built on Playwright, scripting multi-step user journeys with real browser execution. Beaconmon does not offer scripted E2E testing at this depth.',
  },
  {
    title: 'CI/CD integration',
    body: 'Checkly ships a native GitHub Actions integration, so checks run automatically at deploy time and can block a release if something breaks. That workflow is built for teams shipping code multiple times a day.',
  },
  {
    title: 'Built for engineering teams',
    body: 'API monitoring, browser checks, heartbeat checks, and status pages are all designed around how developers already work: in code, in version control, in CI. If your team wants monitoring defined the same way as the rest of the stack, Checkly fits that workflow and Beaconmon does not.',
  },
];

const SWITCH_REASONS = [
  'Checkly is built for developers writing checks in code. If you run a Shopify or WooCommerce store with no engineering team, Beaconmon sets up monitoring entirely through a dashboard, no CLI or CI/CD pipeline required.',
  'Checkly cannot track competitor prices, product listing changes, or promotional copy. Beaconmon checks those on every monitoring cycle alongside uptime.',
  'The Weekly Competitor Report gives you a plain-language summary of every change detected across your monitored sites, sent to email or Slack, with no code to write.',
  'Beaconmon onboarding detects whether you run Shopify or WooCommerce and sets up relevant monitors in bulk, including competitor presets, in one pass.',
  'Beaconmon has a permanent free plan with 10 monitors and no credit card, so you can evaluate it without touching billing.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Checkly have a free plan?',
    a: 'Checkly offers a free tier along with usage-based paid plans. Beaconmon has a permanent free plan with 10 monitors and no credit card required.',
  },
  {
    q: 'When does Checkly make more sense than Beaconmon?',
    a: 'Checkly is the stronger choice when your team wants monitoring defined as code, version-controlled, and deployed through CI/CD, with Playwright-based end-to-end tests across multi-step user journeys. For an engineering-led product with a GitHub Actions pipeline, Checkly fits directly into that workflow. Beaconmon does not offer monitoring as code.',
  },
  {
    q: 'Can Checkly track competitor prices or content changes?',
    a: 'No. Checkly is a synthetic monitoring and testing platform for your own application. It does not parse competitor HTML, detect content or pricing changes, or alert on competitor activity. That is a separate category of tool that Checkly does not address.',
  },
  {
    q: 'How long does migrating from Checkly to Beaconmon take?',
    a: 'Most stores complete the migration in 10 to 15 minutes. List the URLs you currently monitor in Checkly, paste them into Beaconmon onboarding, set up your alert channels, and run both tools in parallel for a week before cancelling Checkly.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Checkly', item: 'https://beaconmon.com/vs/checkly' },
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

export default function VsChecklyPage() {
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
            Switch from Checkly,<br />
            <span className="text-brand-green-ink">skip the code, keep the coverage.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Checkly is a strong developer tool: Monitoring as Code, Playwright-based E2E checks, native CI/CD integration. For a Shopify or WooCommerce store owner without an engineering team, it has no dashboard-first setup, no competitor monitoring, and no content change detection. Beaconmon covers uptime and competitor intelligence from one no-code dashboard.
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
              Checkly is built for engineering teams that want monitoring defined in code and deployed through CI/CD. If you are a Shopify store owner who wants uptime monitoring set up in minutes with no code, plus competitor price tracking and a weekly digest of what changed across your monitored sites, Beaconmon is purpose-built for that. Neither is the right tool for every job.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Checkly</th>
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

      {/* Where Checkly wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Checkly genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. Checkly is better in several important categories, and those areas are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {CHECKLY_STRENGTHS.map(({ title, body }) => (
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
                Stores switching from Checkly usually share the same profile: they do not have an engineer maintaining monitoring configuration in code, they are not writing Playwright tests, and they want competitor tracking that Checkly does not do.
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
              &ldquo;Checkly was great when we had a developer maintaining it, but nobody on our team writes Playwright scripts. We just needed to know when the store went down and when a competitor changed a price. Beaconmon got us there without touching a CLI.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, US, migrated 2025</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to migrate from Checkly
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in 10 to 15 minutes. Run both tools in parallel for a week to confirm nothing is missed before cancelling Checkly.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'List the URLs and endpoints you currently monitor in Checkly, whether defined in a checkly.config file or the dashboard.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors with no card required.' },
                { step: '3', text: 'Paste your monitor URLs into the onboarding wizard. Smart Setup suggests alert thresholds and identifies additional monitors worth adding.' },
                { step: '4', text: 'Connect alert channels. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, remove the Checkly checks from your pipeline.' },
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
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Uptime</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

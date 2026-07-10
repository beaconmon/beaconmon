import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Distill.io for Shopify Stores (2026): Honest Comparison',
  description:
    'Distill.io vs Beaconmon: JS browser watcher vs HTML-only Shopify-native competitor intelligence. Honest comparison, including where Beaconmon falls short.',
  alternates: { canonical: 'https://beaconmon.com/vs/distill' },
  openGraph: { url: 'https://beaconmon.com/vs/distill' },
};

const TABLE_ROWS = [
  {
    feature: 'JavaScript rendering',
    beaconmon: 'No. HTML only (see note below)',
    competitor: '✓ Full browser rendering',
    beaconmonGood: false,
  },
  {
    feature: 'Works for Shopify / WooCommerce',
    beaconmon: '✓ Yes, both serve HTML',
    competitor: '✓ Yes',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify competitor presets',
    beaconmon: '✓ Price, stock, copy selectors',
    competitor: 'Manual setup only',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Intelligence Digest (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No weekly digest',
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
    feature: 'Scales to a monitor fleet',
    beaconmon: '✓ Server-side, low RAM',
    competitor: 'Browser required, RAM-heavy',
    beaconmonGood: true,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'Yes (limited checks)',
    beaconmonGood: false,
  },
  {
    feature: 'Starting price (paid)',
    beaconmon: '$29/mo',
    competitor: '$14/mo',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You need to monitor pages that load content via client-side JavaScript',
    body: "Distill renders JavaScript before capturing a snapshot. If a competitor's site loads its prices or inventory via a client-side API call after the initial HTML loads, Distill will see the rendered result. Beaconmon will not. This is a genuine limitation and it matters if your specific competitors use SPA frameworks like React or Vue for their product content.",
  },
  {
    title: 'You are watching a broad mix of sites with no common structure',
    body: "Distill is a general-purpose watcher: paste a URL, draw a region or write an XPath, and it alerts you when that area changes. It works across any site. Beaconmon's preset selectors are optimized for Shopify and WooCommerce. If you are watching arbitrarily structured sites, Distill is more flexible.",
  },
  {
    title: 'Budget is your main constraint',
    body: "Distill's paid cloud plan starts lower than Beaconmon Starter. If you need a small number of watches with no uptime monitoring or Intelligence Digest, the price difference is real.",
  },
];

const SWITCH_REASONS = [
  'Your competitors run Shopify or WooCommerce stores that serve prices and inventory in the initial HTML response, which is the default for both platforms.',
  'You want uptime monitoring, SSL expiry warnings, and competitor intelligence in one tool, not separate subscriptions.',
  'You want a weekly Intelligence Digest delivered to Slack or email rather than checking a dashboard manually.',
  'You want AI-generated summaries that classify each competitor change by significance, not just a before/after diff.',
  'You want a server-side fleet that scales without needing a browser running, reducing memory pressure and cost.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon render JavaScript?',
    a: "No. Beaconmon uses HTML-only monitoring with cheerio. It reads the HTML returned by the server and does not execute JavaScript. If a competitor's site loads prices or inventory data via client-side JavaScript after the initial page load, Beaconmon will not detect those changes. This is a real architectural limitation and we think you should know it before you sign up.",
  },
  {
    q: 'Does this limitation matter for Shopify and WooCommerce stores?',
    a: "For most Shopify and WooCommerce stores, no. Both platforms serve product prices, inventory status, and promotional content in the initial server-rendered HTML response by default. CSS-selector targeting of that HTML is reliable. Where it becomes relevant is if a competitor uses a headless Shopify setup with a React frontend that fetches prices client-side. That configuration is still uncommon for most ecommerce competitors you would be tracking.",
  },
  {
    q: 'What makes Beaconmon better suited to Shopify than Distill?',
    a: "The onboarding wizard includes pre-built CSS selector presets for Shopify's default product price selector, inventory badge, and description areas. For Distill, you set up each watch manually with an XPath or CSS selector. For a Shopify store owner monitoring three Shopify competitors, Beaconmon's setup takes minutes. Distill requires you to know the selector structure of each site.",
  },
  {
    q: 'Can Distill monitor uptime?',
    a: 'No. Distill detects content changes. It does not monitor whether a site is responding, check SSL certificate validity, or alert on domain expiry. Beaconmon covers all three alongside content change monitoring.',
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
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Distill', item: 'https://beaconmon.com/vs/distill' },
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

export default function VsDistillPage() {
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
            Beaconmon vs Distill.io<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Distill is a general-purpose web watcher that renders JavaScript before capturing changes. Beaconmon is built specifically for Shopify and WooCommerce competitor intelligence: HTML-only monitoring with preset selectors for price, stock, and copy. One important difference to know about before you choose.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* Honest architecture note - above verdict, highly visible */}
      <section className="py-[40px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[rgba(255,200,50,0.06)] border border-[rgba(255,200,50,0.25)] rounded-2xl p-8 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#c9a227] mb-3 block">Honest note on how Beaconmon works</span>
            <p className="text-[16px] leading-[1.65] text-brand-dim mb-3">
              <strong className="text-brand-text">Beaconmon does not render JavaScript.</strong> It reads the HTML returned by the server and uses CSS selectors to target specific elements. Content that loads after the initial HTML via client-side JavaScript will not be detected.
            </p>
            <p className="text-[15px] leading-[1.65] text-brand-dim">
              For most Shopify and WooCommerce stores, prices and inventory are in the initial server-rendered HTML. This limitation rarely affects ecommerce competitor monitoring in practice. If your specific competitors use headless frontends that load prices via client-side API calls, Distill is the better tool for that case.
            </p>
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Distill is more flexible for monitoring any site, including those that rely heavily on JavaScript rendering. Beaconmon is built specifically for Shopify and WooCommerce: preset selectors, uptime monitoring, weekly Intelligence Digest, and AI change summaries in one tool. If your competitors are standard ecommerce stores and you want intelligence delivered to Slack without manual dashboard checks, Beaconmon is the better fit.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Distill.io</th>
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
          <p className="reveal text-center text-[12px] text-brand-muted mt-4 max-w-[820px] mx-auto">
            Note on row 1: Beaconmon uses HTML-only monitoring. It does not render JavaScript. For standard Shopify and WooCommerce stores, server-rendered HTML contains the price and inventory data needed for competitor monitoring. For headless frontends that load prices client-side, Distill is the more reliable choice.
          </p>
        </div>
      </section>

      {/* When to stay on Distill */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on Distill
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Distill has genuine advantages for certain use cases. We would rather you pick the right tool than the wrong one.
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
                Most Shopify stores that switch from Distill do so because they want uptime monitoring combined with competitor intelligence, and they want it delivered rather than checked.
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
              &ldquo;I appreciated that Beaconmon was upfront about not rendering JavaScript. I checked my three main competitors and they all use standard Shopify themes so it did not matter. The Intelligence Digest is the thing Distill can not replicate.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, United States, migrated late 2025</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Distill
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Before switching, spend five minutes confirming that your competitors serve prices and inventory in their initial HTML. If they do, the rest of the migration takes under 30 minutes.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'For each competitor you track in Distill, open the page in your browser, right-click the price element, and choose Inspect. If the price value appears in the initial HTML source (View Source, not the inspector), HTML-only monitoring will work.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard asks for your store URL and your competitor domains.' },
                { step: '3', text: 'For each competitor, select what to monitor: price, stock status, promotional copy. For Shopify and WooCommerce competitors, the wizard provides preset selectors. For others, paste the CSS selector from your Distill setup.' },
                { step: '4', text: 'Configure your alert channels and Intelligence Digest schedule. Slack and email are both available.' },
                { step: '5', text: 'Run Beaconmon for a week. If you see the same changes you were catching in Distill, cancel Distill.' },
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
            <Link href="/vs/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Hexowatch</Link>
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

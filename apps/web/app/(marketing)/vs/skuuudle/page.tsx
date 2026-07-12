import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Skuuudle for Shopify Stores (2026)',
  description:
    'Skuuudle is a fully managed, sales assisted price and product matching service with no public pricing. Beaconmon is self serve, starting free with published $29/mo pricing.',
  alternates: { canonical: 'https://beaconmon.com/vs/skuuudle' },
  openGraph: { url: 'https://beaconmon.com/vs/skuuudle' },
};

const TABLE_ROWS = [
  {
    feature: 'Product matching setup',
    beaconmon: 'Self serve, you set the pages',
    competitor: '✓ Fully managed by their analysts',
    beaconmonGood: false,
  },
  {
    feature: 'Analyst QA on every report',
    beaconmon: 'No, automated only',
    competitor: '✓ Named analyst QA',
    beaconmonGood: false,
  },
  {
    feature: 'Region and store level scraping',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Shopify and WooCommerce integration',
    beaconmon: '✓ Built in from onboarding',
    competitor: 'Not mentioned on their site',
    beaconmonGood: true,
  },
  {
    feature: 'Self serve signup',
    beaconmon: '✓ Free plan, sign up instantly',
    competitor: 'No, sales assisted only',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL and domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'Report cadence set by your tier',
    beaconmonGood: true,
  },
  {
    feature: 'Public pricing',
    beaconmon: '✓ Published, $29/mo Starter',
    competitor: 'No, demo required',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo, self serve signup',
    competitor: 'Not published, demo required',
    beaconmonGood: true,
  },
];

const SKUUUDLE_STRENGTHS = [
  {
    title: 'You want zero configuration accuracy and do not mind paying for a managed service.',
    body: "Skuuudle's own team builds and maintains your product matches by hand, with a named analyst doing QA on every report. There is no CSS selector to set up and no self serve configuration to get wrong. For a retailer that wants match accuracy handled entirely by someone else, this is a real advantage that a self serve tool like Beaconmon does not offer.",
  },
  {
    title: 'You need enterprise scale, region and store level scraping.',
    body: 'Skuuudle offers store level and region level data collection alongside daily, weekly, or hourly cadences, and counts Asda, Groupon, Lovehoney, and Citibank among its clients. That is enterprise infrastructure built for large, multi region catalogues.',
  },
  {
    title: 'You are comfortable with a sales assisted, custom quoted process.',
    body: "Skuuudle's Startup, Professional, Corporate, and Enterprise tiers have no published pricing. Every plan routes through a free trial or a demo call, so if you prefer a scoped, negotiated engagement over self serve signup, that is how Skuuudle operates.",
  },
];

const SWITCH_REASONS = [
  'You want to sign up and start monitoring today, not book a demo and wait on a sales assisted quote.',
  "You want to know Beaconmon's price before you talk to anyone: free to start, $29/mo for Starter, no negotiation required.",
  'You run a Shopify or WooCommerce store specifically and do not need enterprise scale, multi region scraping built for retailers the size of Asda or Citibank.',
  'You want your own store\'s uptime and SSL expiry monitored in the same tool, not a separate subscription.',
  'You want a Weekly Competitor Report delivered automatically, without waiting on an analyst reviewed report cycle.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between Skuuudle and Beaconmon?',
    a: "Skuuudle is a fully managed price and product matching service. Their own team builds and maintains your competitor matches by hand, with analyst QA on every report, and it is sold through a sales assisted, custom quoted process with no public pricing. Beaconmon is self serve: you configure your own monitors, see published pricing upfront, and start on a free plan without talking to sales. Beaconmon also monitors your own store's uptime and SSL status, which Skuuudle does not offer.",
  },
  {
    q: 'Does Beaconmon offer analyst QA like Skuuudle?',
    a: "No. Beaconmon's monitoring is automated and self configured; there is no dedicated analyst reviewing your matches. If zero configuration accuracy with human QA on every report matters more to you than self serve setup and published pricing, Skuuudle's managed model is built for that.",
  },
  {
    q: 'How much does Skuuudle cost compared to Beaconmon?',
    a: 'Skuuudle does not publish pricing for any of its Startup, Professional, Corporate, or Enterprise tiers. Every tier pushes to a free trial signup or a demo call to get a quote. Beaconmon publishes its pricing: free to start, and Starter at $29/mo, no sales call required.',
  },
  {
    q: 'Is Skuuudle a good fit for Shopify or WooCommerce stores?',
    a: "Skuuudle doesn't mention Shopify or WooCommerce integration anywhere on its site, and its client base, including Asda, Groupon, Lovehoney, and Citibank, points to enterprise and mid market retail rather than smaller Shopify or WooCommerce sellers. Beaconmon is built with Shopify and WooCommerce stores in mind from onboarding.",
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/skuuudle',
      name: 'Beaconmon vs Skuuudle for Shopify Stores (2026)',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Skuuudle', item: 'https://beaconmon.com/vs/skuuudle' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function VsSkuuudlePage() {
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
            Beaconmon vs Skuuudle<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Skuuudle is a fully managed price and product matching service. Their own analysts build and QA your competitor matches by hand, with data collection as often as hourly, but pricing is never published and every plan starts with a demo call. Beaconmon is self serve: you configure your own monitors, see published pricing upfront, and start free. Different level of hands on service, different way to buy.
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
              Choose Skuuudle if you run a large, multi region retail operation and want a managed service where analysts handle product matching and QA for you, and you are comfortable with a sales assisted, custom quoted process. Choose Beaconmon if you want to configure your own competitor and uptime monitoring, see the price before you sign up, and start free on a Shopify or WooCommerce store today.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Skuuudle</th>
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

      {/* Where Skuuudle wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Skuuudle wins
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Skuuudle is a legitimate managed service with real strengths for the right buyer. Here is where a fully managed, sales assisted service earns its place.
              </p>
            </div>
            <div className="space-y-4">
              {SKUUUDLE_STRENGTHS.map(({ title, body }) => (
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
                Why smaller stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most Shopify and WooCommerce stores do not need enterprise scale, analyst managed matching, or a sales cycle to get started.
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
              &ldquo;We did not want to wait on a demo call to find out what monitoring would cost us. Skuuudle's process makes sense for a retailer that wants managed analyst QA, but we just needed to see the price and start monitoring the same day.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, evaluated both in 2026</cite>
          </blockquote>
        </div>
      </section>

      {/* Migration */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to switch from Skuuudle
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The switch means trading managed, analyst QA'd matching for self serve setup, so plan for a short overlap period.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Review your current Skuuudle contract and renewal date, since Skuuudle plans are sales assisted and custom quoted rather than month to month self serve.' },
                { step: '2', text: 'Sign up for Beaconmon (free, no card required). The onboarding wizard detects Shopify or WooCommerce automatically.' },
                { step: '3', text: 'Add the competitors you want to track. Unlike Skuuudle\'s fully managed matching, you set the pages yourself, the wizard suggests CSS selectors for common Shopify and WooCommerce layouts.' },
                { step: '4', text: 'Turn on uptime and SSL expiry monitoring for your own store in the same dashboard.' },
                { step: '5', text: 'Configure your Weekly Competitor Report in Slack or email, then run both tools in parallel until you are confident in coverage before ending your Skuuudle engagement.' },
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
            <Link href="/vs/pricemole" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceMole</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/vs/priceotus" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs PriceOtus</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs PageCrawl.io for Shopify Stores (2026)',
  description:
    'PageCrawl starts at $8/mo with JS rendering but no uptime or Shopify presets. Beaconmon monitors competitors and uptime together, free to start.',
  alternates: { canonical: 'https://beaconmon.com/vs/pagecrawl' },
  openGraph: { url: 'https://beaconmon.com/vs/pagecrawl' },
};

const TABLE_ROWS = [
  {
    feature: 'Competitor monitoring',
    beaconmon: '✓ Included',
    competitor: 'Generic page monitoring only',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify preset selectors',
    beaconmon: '✓ Price, stock, promo copy',
    competitor: 'No, manual CSS selectors',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included on every plan',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report',
    beaconmon: '✓ Starter+',
    competitor: 'No, individual alerts only',
    beaconmonGood: true,
  },
  {
    feature: 'JavaScript rendering',
    beaconmon: 'No, HTML-only',
    competitor: '✓ Cloud-based full browser',
    beaconmonGood: false,
  },
  {
    feature: 'REST API',
    beaconmon: 'No',
    competitor: '✓ Every paid plan',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor, no check cap',
    competitor: '6 monitors, 220 checks/month, 60-min minimum',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: 'Free / $29/mo',
    competitor: '$8/mo',
    beaconmonGood: false,
  },
];

const PAGECRAWL_STRENGTHS = [
  {
    title: 'JavaScript rendering',
    body: 'PageCrawl runs a full cloud browser on every check. If a competitor loads prices or inventory client-side through a headless frontend, PageCrawl catches those changes. Beaconmon parses HTML with cheerio and will miss content that is not in the initial server-rendered response.',
  },
  {
    title: 'Lower entry price',
    body: 'PageCrawl paid plans start at $8/mo versus Beaconmon Starter at $29/mo. For basic page change monitoring where uptime, Shopify presets, and the Weekly Competitor Report are not needed, PageCrawl is the cheaper option.',
  },
  {
    title: 'REST API on every paid plan',
    body: 'Every PageCrawl paid subscriber gets API access to query monitoring data programmatically. Beaconmon does not expose a public API at this time. If you need to pipe alerts into a custom system, PageCrawl has the edge.',
  },
];

const SWITCH_REASONS = [
  'PageCrawl has no uptime monitoring at all. It only tracks content changes, so a separate tool is required to know when your own store goes down. Beaconmon includes uptime, SSL, and domain expiry alerts on every plan.',
  'Every PageCrawl monitor needs manual CSS selector setup. Beaconmon ships with presets for Shopify product price, stock status, and promotional copy, so a new competitor monitor takes under 2 minutes.',
  'PageCrawl free caps out at 6 monitors, 220 checks per month, and a 60-minute minimum check interval. Beaconmon free gives you 10 monitors and 1 competitor with no check count cap.',
  'PageCrawl sends one alert per change. The Weekly Competitor Report groups every change detected across your monitored sites into a single Slack or email digest.',
  'PageCrawl has no ecommerce workflow. There is no Shopify-aware onboarding, no competitor setup wizard, and no distinction between price changes and promo copy changes.',
];

const FAQ_ITEMS = [
  {
    q: 'How does Beaconmon compare to PageCrawl for Shopify stores?',
    a: 'PageCrawl is a general-purpose page change detection tool with JavaScript rendering and no Shopify-specific features. Beaconmon ships with Shopify preset selectors for price, stock, and promo copy, and adds uptime, SSL, and domain expiry monitoring that PageCrawl does not offer at all.',
  },
  {
    q: 'Is PageCrawl cheaper than Beaconmon?',
    a: 'PageCrawl paid plans start at $8/mo versus Beaconmon Starter at $29/mo. If budget is the primary concern and you do not need uptime monitoring, Shopify presets, or the Weekly Competitor Report, PageCrawl is cheaper. For a Shopify store owner who wants competitor monitoring and uptime in one subscription, Beaconmon covers both.',
  },
  {
    q: 'Does Beaconmon render JavaScript like PageCrawl?',
    a: 'No. Beaconmon monitors HTML only, using cheerio to parse the server-rendered response. PageCrawl runs a full cloud browser and will catch content that loads client-side. If a competitor site depends heavily on client-side rendering for prices or inventory, PageCrawl has a real advantage here.',
  },
  {
    q: 'Does PageCrawl have a free plan?',
    a: 'Yes. PageCrawl free includes 6 monitors, 220 checks per month, and a 60-minute minimum check interval. Beaconmon free includes 10 monitors, 1 competitor, and no check count cap within the scheduled frequency, plus uptime and SSL monitoring that PageCrawl does not include on any plan.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/pagecrawl',
      name: 'Beaconmon vs PageCrawl.io for Shopify Stores (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs PageCrawl', item: 'https://beaconmon.com/vs/pagecrawl' },
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

export default function VsPageCrawlPage() {
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
            Beaconmon vs PageCrawl.io<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            PageCrawl is a budget page-change monitor with cloud JavaScript rendering, starting at $8/mo. Beaconmon monitors competitors with Shopify-native presets, adds uptime, SSL, and domain expiry alerts, and sends a Weekly Competitor Report, starting free. Different scope, and each has a genuine gap the other fills.
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
              PageCrawl is a solid, affordable choice if you need JavaScript rendering or a REST API and do not care about uptime monitoring or ecommerce-specific setup. Beaconmon is built for Shopify store owners who want competitor price and promo tracking plus uptime, SSL, and domain expiry alerts in one subscription, with presets that skip the manual CSS selector work PageCrawl requires. Neither tool covers everything the other does.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">PageCrawl</th>
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

      {/* Where PageCrawl wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where PageCrawl genuinely has the edge
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. PageCrawl is better in a few real categories, and those are worth knowing before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {PAGECRAWL_STRENGTHS.map(({ title, body }) => (
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
                Why Shopify stores switch to Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Stores switching from PageCrawl usually want ecommerce-specific setup and uptime coverage in the same tool, not a generic page monitor and a separate uptime subscription.
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
              &ldquo;We were on PageCrawl for a competitor's promo page and running a separate uptime tool for our own store. Setting up CSS selectors every time we added a competitor got old fast. Beaconmon's Shopify presets meant we had five competitors monitored, plus our own uptime, inside of ten minutes.&rdquo;
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
                How to migrate from PageCrawl
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most stores complete the migration in under 15 minutes. Run both tools in parallel for a week before cancelling PageCrawl.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Log into PageCrawl and note the URLs and CSS selectors for each of your existing monitors.' },
                { step: '2', text: 'Sign up for Beaconmon. The permanent free plan covers up to 10 monitors and 1 competitor, no card required.' },
                { step: '3', text: 'Add your competitor URLs through the onboarding wizard. Shopify preset selectors fill in price, stock, and promo copy automatically, so most monitors need no manual CSS work.' },
                { step: '4', text: 'Connect alert channels and the Weekly Competitor Report. Email works immediately; Slack OAuth takes about 2 minutes.' },
                { step: '5', text: 'Run both tools side by side for a week. When you are satisfied with coverage, cancel PageCrawl from their billing settings.' },
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
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/alternatives/pagecrawl" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to PageCrawl</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

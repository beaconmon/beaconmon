import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Monitoring Features for Shopify | Beaconmon',
  description:
    'Track competitor prices, promotions, and product launches on any Shopify store. Get a daily AI digest with plain-English summaries of every change.',
  alternates: { canonical: 'https://beaconmon.com/features/intelligence' },
  openGraph: { url: 'https://beaconmon.com/features/intelligence' },
};

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Competitor Monitoring Features for Shopify | Beaconmon',
    description:
      'Track competitor prices, promotions, and product launches. Daily AI digest with plain-English summaries of every change.',
    url: 'https://beaconmon.com/features/intelligence',
  },
];

const CAPABILITIES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    name: 'Price change alerts',
    body: 'Point Beaconmon at a competitor pricing page or product listing. The moment the price, sale label, or "sold out" badge changes, you get an alert, not a digest days later.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    name: 'Content change detection',
    body: 'Target any CSS selector on a page and track exactly that element. Product titles, return policy text, shipping times, promotional banners. Beaconmon diffs the HTML and shows you exactly what changed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    name: 'Competitor watchlist',
    body: 'Add a competitor domain and Beaconmon suggests the high-value pages to monitor: product pages, pricing, checkout, shipping policy. One click to add them all.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
      </svg>
    ),
    name: 'Weekly Competitor Report',
    body: 'Instead of one alert per change, get a single daily or weekly email (or Slack message) summarising everything that changed across your competitor watchlist. Toggle which sections to include per channel.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    name: 'AI-powered diff summaries',
    body: 'Raw HTML diffs are hard to read. Beaconmon uses AI to summarise what actually changed in plain English: "Price dropped from $89 to $74" or "Free shipping threshold raised to $75." Available on Growth and Scale plans.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    name: 'Noise filtering',
    body: 'Not every change matters. Beaconmon classifies trivial changes (ad rotation, timestamp updates, session tokens) and suppresses alerts for them, so your digest only surfaces changes that are actually significant.',
  },
];

const AI_EXAMPLES = [
  {
    label: 'Price drop',
    labelColor: 'bg-brand-red',
    competitor: 'rivalshop.com',
    page: '/pricing',
    diff: [
      { type: 'removed', text: '<span class="price">$89.00</span>' },
      { type: 'added', text: '<span class="price">$69.00</span>' },
    ],
    summary: 'Pro plan price dropped from $89 to $69/mo. A 22% reduction. Annual pricing unchanged.',
  },
  {
    label: 'Policy change',
    labelColor: 'bg-yellow-400',
    competitor: 'acmegear.co',
    page: '/shipping',
    diff: [
      { type: 'removed', text: 'Free shipping on orders over $50' },
      { type: 'added', text: 'Free shipping on orders over $75' },
    ],
    summary: 'Free shipping threshold raised from $50 to $75. Expedited shipping pricing unchanged.',
  },
  {
    label: 'Back in stock',
    labelColor: 'bg-brand-green',
    competitor: 'shopwave.io',
    page: '/products/pro-kit',
    diff: [
      { type: 'removed', text: '<button disabled>Sold Out</button>' },
      { type: 'added', text: '<button>Add to Cart</button>' },
    ],
    summary: 'Pro Kit is back in stock after 12 days. All three variants now available.',
  },
  {
    label: 'Promotion added',
    labelColor: 'bg-yellow-400',
    competitor: 'acmegear.co',
    page: '/products/apex',
    diff: [
      { type: 'removed', text: '' },
      { type: 'added', text: '<div class="badge">Summer Sale 25% off</div>' },
    ],
    summary: 'New sale badge added. 25% off promotion now visible. Original price shown via strikethrough at $120.',
  },
];

export default function IntelligencePage() {
  return (
    <>
      <JsonLd data={SCHEMA} />
      <JsonLd data={breadcrumbSchema({ name: 'Features', path: '/features' }, { name: 'Competitor Monitoring', path: '/features/intelligence' })} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-[100px] max-[640px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            left: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.12), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Competitor Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Know what your competitors changed
            <span className="text-brand-green-ink"> before your customers do.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mx-auto mb-10">
            Beaconmon watches competitor pages, reads Shopify product feeds, and delivers a daily digest with AI summaries of every price drop, promo launch, and policy change. No manual checking. No missed moves.
          </p>
          <CtaForm className="mx-auto" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How competitor monitoring works</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Beaconmon takes an HTML snapshot on first run, then checks on your schedule and diffs the result each time.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-6">
            {[
              { step: '01', title: 'Add a competitor', body: 'Enter a domain. Beaconmon suggests the pages most worth watching: pricing, product pages, shipping policy, checkout. For Shopify stores, it reads the product feed automatically.' },
              { step: '02', title: 'Set your selectors', body: 'Target a specific CSS selector or watch the full page body. Narrow selectors filter out noise and focus on what matters.' },
              { step: '03', title: 'Get notified', body: 'Alerts fire immediately on change, or roll up into a daily or weekly digest with AI summaries explaining what each change actually means.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="text-[40px] font-extrabold tracking-[-0.04em] text-brand-green-ink opacity-30 mb-4">{step}</div>
                <h3 className="text-[18px] font-bold tracking-[-0.02em] mb-3">{title}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample digest */}
      <section id="daily-brief" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.3fr] max-[880px]:grid-cols-1 gap-16 items-start">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Daily Competitor Report</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                One email. Everything that changed.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Instead of a flood of individual alerts, get a structured digest delivered daily or weekly. Sections are toggleable: you pick what matters for your team. Growth plan gets daily delivery; all paid plans get weekly.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Daily (Growth/Scale) or weekly (all paid plans)',
                  'Delivered to email and/or Slack',
                  'Five toggleable sections per channel',
                  'AI summaries explain each change in plain English',
                  'Noise-filtered: timestamps and ad rotations suppressed',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-line-soft flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">Weekly Competitor Report</div>
                  <div className="text-[11px] text-brand-muted mt-[2px]">Monday, June 9 at 7:00 AM</div>
                </div>
                <span className="text-[11px] bg-[rgba(0,229,122,0.1)] text-brand-green-ink px-2 py-1 rounded border border-[rgba(0,229,122,0.2)] font-semibold">7 changes</span>
              </div>

              <div className="px-5 pt-4 pb-1">
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-brand-red mb-3 flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-brand-red shrink-0" />
                  Price Changes (3)
                </div>
                {[
                  { competitor: 'rivalshop.com', page: '/pricing', summary: 'Pro plan dropped from $89/mo to $69/mo. A 22% reduction.' },
                  { competitor: 'acmegear.co', page: '/products/apex', summary: 'Summer Sale badge added. 25% off, was $120.' },
                  { competitor: 'shopwave.io', page: '/bundles/starter', summary: 'Starter bundle raised from $149 to $179.' },
                ].map(({ competitor, page, summary }) => (
                  <div key={competitor + page} className="flex gap-3 text-[12px] mb-3">
                    <div className="mt-[4px] w-[5px] h-[5px] rounded-full bg-brand-red shrink-0" />
                    <div>
                      <div className="text-brand-muted font-mono text-[10px] mb-[2px]">{competitor}{page}</div>
                      <div className="text-brand-dim leading-[1.5]">{summary}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pt-3 pb-1 border-t border-brand-line-soft">
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-yellow-400 mb-3 flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-yellow-400 shrink-0" />
                  Content Changes (2)
                </div>
                {[
                  { competitor: 'acmegear.co', page: '/shipping', summary: 'Free shipping threshold raised from $50 to $75.' },
                  { competitor: 'rivalshop.com', page: '/returns', summary: 'Return window extended from 30 to 60 days.' },
                ].map(({ competitor, page, summary }) => (
                  <div key={competitor + page} className="flex gap-3 text-[12px] mb-3">
                    <div className="mt-[4px] w-[5px] h-[5px] rounded-full bg-yellow-400 shrink-0" />
                    <div>
                      <div className="text-brand-muted font-mono text-[10px] mb-[2px]">{competitor}{page}</div>
                      <div className="text-brand-dim leading-[1.5]">{summary}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pt-3 pb-4 border-t border-brand-line-soft">
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-3 flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                  Back in Stock (1) · New Products (1)
                </div>
                {[
                  { competitor: 'shopwave.io', page: '/products/pro-kit', summary: 'Pro Kit back in stock. Was sold out for 12 days.' },
                  { competitor: 'shopwave.io', page: '/collections/new', summary: 'New product launched: "TrailBlaze Pro" at $249.' },
                ].map(({ competitor, page, summary }) => (
                  <div key={competitor + page} className="flex gap-3 text-[12px] mb-3 last:mb-0">
                    <div className="mt-[4px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    <div>
                      <div className="text-brand-muted font-mono text-[10px] mb-[2px]">{competitor}{page}</div>
                      <div className="text-brand-dim leading-[1.5]">{summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI classification */}
      <section id="ai-diffs" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">AI Diff Summaries</span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">AI that labels changes, not just diffs.</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Raw HTML diffs are unreadable. Beaconmon classifies every change by type and translates it into plain English so you know what actually moved, and why it matters.</p>
          </div>

          <div className="grid grid-cols-2 max-[880px]:grid-cols-1 gap-5">
            {AI_EXAMPLES.map(({ label, labelColor, competitor, page, diff, summary }) => (
              <div key={label} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-brand-line-soft flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-[3px] rounded text-[10px] font-bold tracking-[0.08em] uppercase text-brand-bg0 ${labelColor}`}>{label}</span>
                  <span className="font-mono text-[11px] text-brand-muted">{competitor}{page}</span>
                </div>
                <div className="px-5 py-4 space-y-1 font-mono text-[12px] border-b border-brand-line-soft">
                  {diff.map(({ type, text }, i) =>
                    text ? (
                      <div
                        key={i}
                        className={`px-2 py-[3px] rounded ${type === 'removed' ? 'bg-[rgba(255,80,80,0.1)] text-[#ff6b6b]' : 'bg-[rgba(0,229,122,0.1)] text-brand-green-ink'}`}
                      >
                        <span className="mr-2 select-none opacity-60">{type === 'removed' ? '-' : '+'}</span>
                        {text}
                      </div>
                    ) : null
                  )}
                </div>
                <div className="px-5 py-4 flex gap-3 text-[13px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green-ink shrink-0 mt-[2px]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-brand-dim leading-[1.55]">{summary}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-brand-muted mt-6">AI summaries available on Growth and Scale plans.</p>
        </div>
      </section>

      {/* Shopify product feed */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Shopify Integration</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Built for Shopify. Reads the feed, not just the page.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Any public Shopify store exposes a structured product feed at <code className="text-brand-green-ink font-mono text-[14px]">/products.json</code>. Beaconmon reads it directly to get structured data on every product: title, price, inventory status, and all variants. When a competitor launches a product, drops a price across variants, or marks items as sold out, you see it in the next digest.
              </p>
              <ul className="space-y-3">
                {[
                  'Reads /products.json on any public Shopify store',
                  'Detects price changes across all variants at once',
                  'Catches inventory changes: in stock vs sold out',
                  'Identifies new product launches automatically',
                  'No CSS selectors needed for Shopify stores',
                  'WooCommerce product pages supported via CSS selectors',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-brand-line-soft flex items-center gap-2 text-[12px] text-brand-muted">
                <span className="font-mono">GET</span>
                <span className="font-mono text-brand-green-ink">rivalshop.com/products.json</span>
              </div>
              <div className="px-5 py-4 font-mono text-[12px] text-brand-dim space-y-0">
                <div><span className="text-brand-muted">{'{'}</span></div>
                <div className="pl-4"><span className="text-brand-green-ink">&quot;products&quot;</span><span className="text-brand-muted">: [</span></div>
                <div className="pl-8"><span className="text-brand-muted">{'{'}</span></div>
                <div className="pl-12"><span className="text-brand-green-ink">&quot;title&quot;</span><span className="text-brand-muted">: </span><span className="text-[#a8d8a8]">&quot;TrailBlaze Pro&quot;</span><span className="text-brand-muted">,</span></div>
                <div className="pl-12"><span className="text-brand-green-ink">&quot;status&quot;</span><span className="text-brand-muted">: </span><span className="text-[#a8d8a8]">&quot;active&quot;</span><span className="text-brand-muted">,</span></div>
                <div className="pl-12"><span className="text-brand-green-ink">&quot;variants&quot;</span><span className="text-brand-muted">: [</span></div>
                <div className="pl-16"><span className="text-brand-muted">{'{'}</span></div>
                <div className="pl-20"><span className="text-brand-green-ink">&quot;title&quot;</span><span className="text-brand-muted">: </span><span className="text-[#a8d8a8]">&quot;Small&quot;</span><span className="text-brand-muted">,</span></div>
                <div className="pl-20 flex items-center gap-2">
                  <span><span className="text-brand-green-ink">&quot;price&quot;</span><span className="text-brand-muted">: </span><span className="bg-[rgba(0,229,122,0.1)] text-brand-green-ink px-1 rounded">&quot;249.00&quot;</span></span>
                  <span className="text-[10px] text-brand-green-ink font-semibold">NEW</span>
                </div>
                <div className="pl-20 flex items-center gap-2">
                  <span><span className="text-brand-green-ink">&quot;available&quot;</span><span className="text-brand-muted">: </span><span className="bg-[rgba(0,229,122,0.1)] text-brand-green-ink px-1 rounded">true</span></span>
                </div>
                <div className="pl-16"><span className="text-brand-muted">{'}'}</span></div>
                <div className="pl-12"><span className="text-brand-muted">]</span></div>
                <div className="pl-8"><span className="text-brand-muted">{'}'}</span></div>
                <div className="pl-4"><span className="text-brand-muted">]</span></div>
                <div><span className="text-brand-muted">{'}'}</span></div>
              </div>
              <div className="px-5 py-3 border-t border-brand-line-soft flex items-center gap-2 text-[12px]">
                <span className="w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                <span className="text-brand-dim">New product detected. Added to tonight&apos;s digest.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything included in competitor monitoring</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Six capabilities that work together to keep you informed without overwhelming you.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {CAPABILITIES.map(({ icon, name, body }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7 flex gap-5">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green-ink shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2">{name}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans callout */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-3 max-[880px]:grid-cols-1 gap-5">
            {[
              { plan: 'Starter', monitors: '5 competitor monitors', digest: 'Weekly digest', ai: 'No AI summaries' },
              { plan: 'Growth', monitors: '25 competitor monitors', digest: 'Daily or weekly digest', ai: 'AI diff summaries included' },
              { plan: 'Scale', monitors: 'Unlimited competitors', digest: 'Daily or weekly digest', ai: 'AI diff summaries included' },
            ].map(({ plan, monitors, digest, ai }) => (
              <div key={plan} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3">{plan}</div>
                <ul className="space-y-2">
                  {[monitors, digest, ai].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-brand-dim">
                      <span className="mt-[5px] w-[4px] h-[4px] rounded-full bg-brand-green shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-brand-muted mt-6">
            Free plan includes 1 competitor monitor.{' '}
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">See full pricing</Link>.
          </p>
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
            Start watching your competitors today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">14-day Growth trial, no card required. Competitor monitors and daily digests included from day one.</p>
          <CtaForm className="mx-auto mb-5" />
          <Link href="/pricing" className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
            See pricing
          </Link>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

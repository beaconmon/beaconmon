import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon for Fashion and Apparel Brands | Sale Monitoring',
  description:
    "Fashion competitors run deep, frequent sales, data shows 39% of tracked apparel are discounted, averaging 53% off. Track markdowns and new drops.",
  alternates: { canonical: 'https://beaconmon.com/for/dtc-fashion' },
  openGraph: { url: 'https://beaconmon.com/for/dtc-fashion' },
};

const TEMPLATE_MONITORS = [
  { name: 'Competitor collection page', type: 'Content', interval: '15 min', detail: 'CSS selector for sale badges and markdown tags' },
  { name: 'Competitor PDP price', type: 'Content', interval: '15 min', detail: 'CSS selector: .price and .compare-at-price' },
  { name: 'New drop detection', type: 'Content', interval: '15 min', detail: 'Watches collection listing pages for new SKUs' },
  { name: 'Bestseller stock status', type: 'Content', interval: '15 min', detail: 'Flags sold out and back in stock on key SKUs' },
  { name: 'Your product page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Add to Cart"' },
  { name: 'Your checkout', type: 'HTTP + Keyword', interval: '30 sec', detail: 'Keyword: "Complete order"' },
];

const FEATURES = [
  {
    heading: 'Markdown depth and timing alerts',
    body: 'Fashion is a discounting category, not the exception. Across the apparel and fashion brands we track, 39.01% of products carry a compare-at-price right now, at an average depth of 53.00% off. Beaconmon watches competitor PDPs and collection pages so you see a markdown the moment it goes live, not a week later.',
  },
  {
    heading: 'New drop and collection launch detection',
    body: 'Content monitors on a competitor collection page catch new SKUs as soon as they are listed. Know when a competitor launches a capsule or restocks a seasonal line before your customers tell you about it.',
  },
  {
    heading: 'Restock tracking, not guesswork',
    body: 'Sold out on a bestseller could be a real shortage or manufactured scarcity. Beaconmon tracks stock status changes on competitor SKUs, and our restock speed data shows what a real restock pattern looks like.',
  },
  {
    heading: 'Weekly Competitor Report, daily',
    body: 'One email and Slack post a day with every competitor markdown, new drop, and stock change from the last 24 hours. Skim it with coffee. Skip the dashboard.',
  },
];

export default function ForDtcFashionPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'For Fashion Brands', path: '/for/dtc-fashion' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For Fashion Brands</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            39.01% of Apparel Products Are On Sale Right Now.<br />
            <span className="text-brand-green-ink">Know when your competitors markdown, before your customers do.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            The average discount depth we track across fashion competitors is 53.00% off. Beaconmon watches competitor pricing, new drops, and stock status so you catch every markdown, launch, and restock automatically.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Data callout */}
      <section className="py-16 border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5 reveal text-center">
          <p className="text-brand-dim text-[16px] leading-[1.7]">
            We pulled data from every fashion and apparel competitor tracked on Beaconmon: 68 brands, 33,049 products. 39.01% carry a compare-at-price today, and the average discount on those runs 53.00% off. Deep discounting is the norm in this category, not the exception. Read the full breakdown in{' '}
            <Link href="/blog/dtc-fashion-brand-pricing-data" className="text-brand-green-ink hover:underline">
              our fashion pricing data post
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">A fashion monitoring template</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Competitor markdowns, new drops, and stock status, plus your own storefront, covered from day one.</p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[700px] mx-auto">
            {TEMPLATE_MONITORS.map((monitor) => (
              <div key={monitor.name} className="bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-bold text-[15px] text-brand-text">{monitor.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        monitor.type === 'Content'
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-[rgba(0,229,122,0.1)] text-brand-green-ink'
                      }`}
                    >
                      {monitor.type}
                    </span>
                    <span className="text-[12px] text-brand-muted">{monitor.interval}</span>
                  </div>
                  <p className="text-[13px] text-brand-dim">{monitor.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for fashion and apparel brands</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Markdowns, drops, and restocks, tracked automatically across every competitor you name.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">
                  {heading === 'Restock tracking, not guesswork' ? (
                    <>
                      Sold out on a bestseller could be a real shortage or manufactured scarcity. Beaconmon tracks stock status changes on competitor SKUs, and our restock speed data shows what a real restock pattern looks like. See the numbers in our{' '}
                      <Link href="/blog/shopify-competitor-restock-speed-data" className="text-brand-green-ink hover:underline">
                        restock speed data post
                      </Link>
                      .
                    </>
                  ) : (
                    body
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/blog/dtc-fashion-brand-pricing-data" className="text-brand-dim hover:text-brand-text transition-colors">Fashion pricing data</Link>
            <Link href="/blog/shopify-competitor-restock-speed-data" className="text-brand-dim hover:text-brand-text transition-colors">Restock speed data</Link>
            <Link href="/for/dtc-brands" className="text-brand-dim hover:text-brand-text transition-colors">For DTC brands</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Pricing change alerts</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

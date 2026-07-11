import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon for Skincare and Beauty Brands | Price Monitoring',
  description:
    "Skincare brands rarely discount, data shows under 1 in 10 tracked products are on sale at once. When a competitor breaks that pattern, it's worth catching.",
  alternates: { canonical: 'https://beaconmon.com/for/beauty-skincare' },
  openGraph: { url: 'https://beaconmon.com/for/beauty-skincare' },
};

const TEMPLATE_MONITORS = [
  { name: 'Competitor hero SKU price', type: 'Content', interval: '15 min', detail: 'CSS selector: .price, .compare-at-price' },
  { name: 'New arrivals / launch page', type: 'Content', interval: '15 min', detail: 'Catches a new product or formula before the press push' },
  { name: 'PDP ingredient and claims copy', type: 'Content', interval: '30 min', detail: 'CSS selector: .product-description' },
  { name: 'Homepage hero banner', type: 'Content', interval: '15 min', detail: 'Flags a first-time sale announcement' },
  { name: 'Your product page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Add to Cart"' },
  { name: 'Your checkout', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Complete order"' },
];

const FEATURES = [
  {
    heading: 'First-time discount alerts, not weekly summaries',
    body: 'Across a sample of 2,146 tracked skincare and beauty SKUs from 87 brands, only 9.04% carry a compare-at-price at any moment, at an average discount depth of just 24.01%. Discounting is the exception in this category, not the rhythm. When a competitor who never discounts suddenly does, Beaconmon pushes a real-time alert instead of holding it for the weekly digest.',
  },
  {
    heading: 'New launch and reformulation detection',
    body: 'A content monitor on a competitor collection or new-arrivals page catches a new product or formula listing the moment it goes live, often before the brand sends its own launch email.',
  },
  {
    heading: 'Ingredient and claims copy tracked on every PDP',
    body: 'Copy changes are the single largest category of site change we track across the whole dataset, 47.79% of all site changes. On a PDP, that copy is the ingredient list and the claims. A change there usually means a reformulation or a positioning shift, and it is worth knowing about before a customer asks you why.',
  },
  {
    heading: 'Weekly Competitor Report for the routine, real-time alerts for the exception',
    body: 'Most competitor activity, price checks, minor copy edits, small stock changes, belongs in a daily or weekly digest you can skim with coffee. A first-time sale or a new launch on a brand that rarely moves is the kind of pattern-break that should reach you immediately instead.',
  },
];

export default function ForBeautySkincarePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'For Beauty and Skincare Brands', path: '/for/beauty-skincare' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For Beauty and Skincare Brands</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            9.04% of Skincare Products Are Ever On Sale.<br />
            <span className="text-brand-green-ink">When a Competitor Breaks That Pattern, You Should Know in Minutes.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Across a sample of 2,146 tracked skincare and beauty SKUs from 87 brands, only 9.04% carry a compare-at-price at any given moment, at an average discount depth of 24.01%. Apparel brands discount 39.01% of products at an average depth of 53.00%. Skincare brands protect price. A first-time sale or a surprise launch from a competitor is a real signal here, not routine noise, worth catching the moment it happens instead of at the end of the week.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">A skincare and beauty monitoring template</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Your hero SKUs, your launch pages, and your two biggest competitors, covered from day one.</p>
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for discount-averse categories</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Skincare margins depend on price discipline holding, on both sides of the shelf.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
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
            <Link href="/blog/dtc-skincare-brand-pricing-data" className="text-brand-dim hover:text-brand-text transition-colors">The skincare pricing data</Link>
            <Link href="/blog/shopify-homepage-change-anatomy-data" className="text-brand-dim hover:text-brand-text transition-colors">Anatomy of a homepage change</Link>
            <Link href="/for/dtc-brands" className="text-brand-dim hover:text-brand-text transition-colors">For DTC brands</Link>
            <Link href="/competitor-promotion-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Promotion monitoring</Link>
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

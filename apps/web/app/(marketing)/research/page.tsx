import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Competitor Research and Statistics | Beaconmon',
  description:
    'Original stats from analyzing hundreds of thousands of competitor price, stock, and content change events on Shopify stores. Updated as our dataset grows.',
  alternates: { canonical: 'https://beaconmon.com/research' },
  openGraph: { url: 'https://beaconmon.com/research' },
};

const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Beaconmon Competitor Monitoring Dataset',
  description:
    'Original statistics derived from monitoring 641 competitors (639 distinct domains) across 4 teams, covering 504,500 competitor events and 180,065 tracked products over a rolling six-week window.',
  creator: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
  dateModified: '2026-07-09',
};

const SCALE_STATS = [
  { number: '641', label: 'competitors tracked (639 distinct domains)' },
  { number: '504,500', label: 'competitor events detected' },
  { number: '180,065', label: 'competitor products monitored' },
  { number: '~6 weeks', label: 'data window, bulk in the most recent 30 days' },
];

const FINDINGS = [
  {
    stat: '90.76%',
    label: 'of price changes are noise',
    body: 'The overwhelming majority of detected price changes move the price by less than 1%, artifacts of currency rounding and feed syncs rather than real repricing decisions.',
    href: '/blog/shopify-competitor-price-change-noise',
  },
  {
    stat: '55.1% / 44.9%',
    label: 'price increases vs decreases',
    body: 'Across every price change tracked, increases outnumber decreases by a meaningful margin, the opposite of what most merchants assume competitors are doing.',
    href: '/blog/inside-shopify-price-changes-data',
  },
  {
    stat: '99%',
    label: 'of price changes are automated',
    body: 'Nearly all price changes come from repricing rules and feed syncs, not a person deciding to change a number.',
    href: '/blog/shopify-price-changes-automated',
  },
  {
    stat: '23.42%',
    label: 'of products carry a permanent compare-at-price',
    body: 'Almost a quarter of tracked products show a was-price that never resets, a markdown that functions as the real price.',
    href: '/blog/shopify-permanent-sale-compare-at-price',
  },
  {
    stat: '1 in 14',
    label: 'product launches get pulled within weeks',
    body: 'A meaningful share of new product listings disappear again shortly after launch, a signal worth tracking separately from price moves.',
    href: '/blog/shopify-competitor-product-churn',
  },
  {
    stat: 'Under 24 hours',
    label: 'average sale duration',
    body: 'Competitor sales run shorter than most merchants plan around, which changes how fast a response needs to be to matter.',
    href: '/blog/shopify-competitor-sales-last-24-hours',
  },
  {
    stat: '46% / 18%',
    label: 'of DTC brands never discount, or never stop',
    body: 'Discounting behavior splits into two camps with little middle ground: brands that hold price and brands that are functionally always on sale.',
    href: '/blog/shopify-dtc-two-tribes-discounting',
  },
  {
    stat: '65.67%',
    label: 'of price changes happen Wednesday and Thursday',
    body: 'Price-change activity is heavily concentrated midweek, with Saturday and Sunday combined accounting for barely more than 1% of all changes.',
    href: '/blog/shopify-competitor-price-change-timing',
  },
  {
    stat: '22 hours',
    label: 'median restock time',
    body: 'Half of out-of-stock products come back within about a day, but the average climbs to 45 hours once the slow-restock tail is included.',
    href: '/blog/shopify-competitor-restock-speed-data',
  },
  {
    stat: '6 to 1',
    label: 'homepage copy changes vs layout changes',
    body: 'When a competitor homepage changes, it is far more often a copy edit than a layout or design overhaul.',
    href: '/blog/shopify-homepage-change-anatomy-data',
  },
  {
    stat: '39.01%',
    label: 'of apparel products are on sale',
    body: 'Apparel and fashion competitors discount deep and often, averaging a 53.00% discount depth on the products that carry a compare-at-price.',
    href: '/blog/dtc-fashion-brand-pricing-data',
  },
  {
    stat: '9.04%',
    label: 'of skincare products are on sale',
    body: 'Skincare and beauty competitors discount roughly a quarter as often as apparel, and shallower too, averaging a 24.01% discount depth.',
    href: '/blog/dtc-skincare-brand-pricing-data',
  },
  {
    stat: '5.32%',
    label: 'of competitor events are flagged high-significance',
    body: 'The AI classifier marks only about 1 in 19 detected events as high-significance. Most changes are routine and do not warrant an immediate reaction.',
    href: '/blog/shopify-competitor-event-significance-data',
  },
  {
    stat: '6',
    label: 'distinct shapes a competitor flash sale actually takes',
    body: 'Across 956 classified promo events, two of the six patterns involve no price change at all, including a free-gift-with-purchase offer that price-only monitoring never sees.',
    href: '/blog/anatomy-of-a-shopify-flash-sale',
  },
];

export default function ResearchPage() {
  return (
    <>
      <JsonLd data={datasetSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Research', path: '/research' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Research</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Shopify competitor monitoring research
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-4">
            A living index of original findings pulled from Beaconmon&apos;s own monitoring data. Every stat below is sourced back to the full post it came from and updated as the dataset grows.
          </p>
          <p className="text-[13px] font-semibold tracking-[0.06em] uppercase text-brand-muted">Last verified: July 9, 2026</p>
        </div>
      </section>

      {/* Scale callout */}
      <section className="py-[60px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-4 max-[880px]:grid-cols-2 gap-6 text-center">
            {SCALE_STATS.map(({ number, label }) => (
              <div key={label}>
                <p className="text-[clamp(28px,3.2vw,44px)] font-extrabold tracking-[-0.03em] text-brand-green-ink mb-2">{number}</p>
                <p className="text-brand-dim text-[13px] leading-[1.5]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Findings */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Every published finding, in one place</h2>
            <p className="text-brand-dim text-[16px] max-w-[560px] mx-auto">Each card links to the full post with the complete methodology and breakdown behind the number.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FINDINGS.map(({ stat, label, body, href }) => (
              <div key={href} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <p className="text-[32px] font-extrabold tracking-[-0.02em] text-brand-green-ink mb-2 leading-[1.1]">{stat}</p>
                <p className="text-[15px] font-semibold text-brand-text mb-3">{label}</p>
                <p className="text-brand-dim text-[14px] leading-[1.65] mb-4">{body}</p>
                <Link href={href} className="text-brand-green-ink text-[13px] font-semibold hover:underline">
                  Read the full analysis →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              How this data is collected
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                Every number on this page comes from monitors that Beaconmon customers point at their own tracked competitors, using CSS-selector and feed-based content monitoring, not a third-party panel or survey.
              </p>
              <p>
                Individual tracked brands, stores, and domains are never named in published findings, even though the underlying storefront data is public. Results are reported in aggregate.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/methodology" className="text-brand-green-ink font-semibold text-[15px] hover:underline">
                Read the full methodology
              </Link>
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

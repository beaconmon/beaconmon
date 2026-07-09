import type { Metadata } from 'next';
import BlogPostLayout, {
  H2,
  H3,
  P,
  A,
  Strong,
  Callout,
  Stat,
  StatGrid,
  KeyTakeaways,
  KeyTakeaway,
  SummaryStatement,
  ComparisonTable,
  FAQ,
} from '@/components/marketing/BlogPostLayout';
import { createFAQSchema } from '@/lib/blog';

const SLUG = 'dtc-fashion-brand-pricing-data';

export const metadata: Metadata = {
  title: 'DTC Fashion Brand Pricing: Why 39% of Products Are Always on Sale | Beaconmon',
  description:
    'We tracked 33,049 products across 68 DTC apparel brands on Shopify. Nearly 2 in 5 are on sale at any given moment, and the average discount runs 53% off.',
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  openGraph: { url: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Haimanot Getu', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How often are DTC fashion brands running sales?',
    a: 'Constantly, based on our data. Across 33,049 apparel products tracked from 68 DTC brands on Shopify, 39.01% carry a compare_at_price at any given moment, meaning they are formally presented as discounted. Almost 2 in 5 apparel products in our dataset are on sale right now, not as a rare promotional event but as a standing state of the catalog.',
  },
  {
    q: "What's a typical discount depth for apparel brands on Shopify?",
    a: 'Among apparel products that carry a compare_at_price, the average discount depth is 53.00% off the listed price. That is an average across every on-sale item in the sample, not a floor or a ceiling, so individual markdowns range both above and below it. A discount depth near half off is the norm for this vertical, not an outlier.',
  },
  {
    q: 'Do fashion brands discount more than other ecommerce categories?',
    a: "Yes, by a wide margin. The skincare and beauty vertical in our dataset runs 9.04% on-sale prevalence with an average discount depth of 24.01%. Apparel brands discount roughly 4x more often and roughly 2x as deep. Two categories that sell to overlapping DTC audiences have almost opposite pricing postures.",
  },
  {
    q: 'What should trigger an alert for an apparel competitor?',
    a: "A sudden jump in the share of a competitor's catalog carrying a compare_at_price is the clearest sitewide-sale signal, often ahead of any homepage banner change. Beyond that, watch the trend in average discount depth over time rather than any single markdown: a competitor sliding from 40% off toward 60% off across the catalog is a margin decision worth knowing about, not noise.",
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="DTC Fashion Brand Pricing: Why 39% of Products Are Always on Sale"
      description="We tracked 33,049 products across 68 DTC apparel brands on Shopify. Nearly 2 in 5 are on sale at any given moment, and the average discount runs 53% off."
      slug={SLUG}
      publishedAt="2026-07-09"
      dateModified="2026-07-09"
      readingTime={8}
      tag="Data & Research"
      schemas={[faqSchema]}
      showDatasetLink
    >
      <P>
        DTC apparel is one of the largest categories on Shopify, and one of the most
        discount-driven. Generic competitor monitoring advice treats a{' '}
        <A href="/glossary#compare-at-price">compare-at price</A> change like
        any other content change: worth a note, not worth an alert. In fashion, that framework
        misses most of the pricing signal in the category.
      </P>

      <P>
        Beaconmon tracks 33,049 products across 68 distinct apparel and fashion brands on Shopify.
        <Strong> 39.01% of those products carry a compare_at_price right now</Strong>, and when they
        do, the average discount depth is <Strong>53.00% off</Strong>. Nearly 2 in 5 tracked apparel
        products are on sale at this exact moment, and the average markdown is over half the listed
        price.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          33,049 apparel products across 68 DTC brands analyzed, filtered to fashion-specific
          product types on Shopify storefronts.
        </KeyTakeaway>
        <KeyTakeaway>
          39.01% of apparel products carry a compare_at_price at any given moment, meaning they
          are formally presented as discounted.
        </KeyTakeaway>
        <KeyTakeaway>
          The average discount depth on those on-sale items is 53.00% off the listed price.
        </KeyTakeaway>
        <KeyTakeaway>
          Apparel brands discount roughly 4x more often and roughly 2x as deep as the skincare and
          beauty vertical (9.04% on-sale, 24.01% average depth).
        </KeyTakeaway>
        <KeyTakeaway>
          Compare-at-price tracking matters more in apparel than in almost any other vertical: it
          is close to the default state of the category, not an exception worth a special rule.
        </KeyTakeaway>
      </KeyTakeaways>

      <StatGrid>
        <Stat value="39.01%" label="of tracked apparel products currently carry a compare_at_price" />
        <Stat value="53.00%" label="average discount depth on apparel products that are on sale" />
        <Stat value="33,049" label="apparel products analyzed across 68 DTC brands" />
      </StatGrid>

      <H2>Finding 1: Almost 2 in 5 apparel products are on sale right now</H2>

      <P>
        Of the 33,049 apparel products in our dataset, <Strong>39.01% currently have a
        compare_at_price set higher than their listed price</Strong>, the Shopify signal for a
        formal discount. That is not a snapshot taken during a holiday sale window. It is the
        standing state of the catalog across a broad sample of 68 brands over a roughly six-week
        period.
      </P>

      <P>
        For an apparel merchant, this reframes what "on sale" even means as a competitive signal.
        If close to 40% of the competitive set is discounting at any given moment, a single sale
        event on one competitor is not the interesting data point. The interesting data point is
        the catalog-wide trend: how much of a competitor's catalog is marked down, and whether that
        share is rising or falling week over week.
      </P>

      <SummaryStatement>
        39.01% of tracked apparel products carry a compare_at_price right now. In this vertical,
        being on sale is closer to the default state of a product than an exception, so monitoring
        that treats every discount as a one-off event will miss the pattern underneath it.
      </SummaryStatement>

      <H2>Finding 2: When apparel brands discount, they discount deep</H2>

      <P>
        The average discount depth across every apparel product carrying a compare_at_price is
        <Strong> 53.00% off</Strong> the listed price. That is an average across the full on-sale
        subset, not a floor or a ceiling: individual markdowns in the dataset range both above and
        below it, but the center of gravity sits past the halfway mark.
      </P>

      <P>
        A discount depth near half off is common enough in apparel that it barely registers as
        aggressive within the category. A merchant benchmarking against a single competitor's
        occasional 20% off promotion may be badly underestimating how deep the rest of the field is
        actually discounting.
      </P>

      <SummaryStatement>
        53.00% is the average discount depth on apparel products currently marked down, not an
        outlier case. Treat discount depth as a trend to track over time per competitor, not a
        single number to react to once.
      </SummaryStatement>

      <H2>How this compares to other verticals</H2>

      <P>
        The skincare and beauty vertical in the same dataset runs at 9.04% on-sale prevalence with
        an average discount depth of 24.01%. Apparel brands discount roughly 4x more often and
        roughly 2x as deep as skincare and beauty brands selling to a similar DTC audience. See the
        full breakdown in{' '}
        <A href="/blog/dtc-skincare-brand-pricing-data">
          our skincare and beauty pricing data post
        </A>
        . These two categories sell through the same Shopify playbook and largely overlap in
        customer base, yet they run on almost opposite pricing postures: apparel treats markdowns
        as a constant, skincare treats them as rare.
      </P>

      <ComparisonTable
        headers={['Metric', 'Apparel', 'Skincare & Beauty']}
        rows={[
          ['Products carrying compare_at_price', '39.01%', '9.04%'],
          ['Average discount depth on sale items', '53.00%', '24.01%'],
        ]}
      />

      <H2>What this means for monitoring an apparel competitor</H2>

      <P>
        If roughly 40% of the competitive set is discounting at any moment and the average depth
        is 53%, compare-at-price monitoring is not optional context for an apparel merchant. It is
        close to the default state of the category. A merchant who only tracks list price and
        misses compare-at-price and sale-badge changes is missing the majority of the pricing
        signal in this vertical.
      </P>

      <H3>Track compare-at-price changes as closely as list-price changes</H3>

      <P>
        In most categories, list price is the primary signal and compare_at_price is secondary. In
        apparel, treat them as equally important. A competitor can hold list price steady for
        months while quietly shifting which products carry a compare_at_price and how deep the
        markdown runs.
      </P>

      <H3>A sudden jump in on-sale percentage is a sitewide-sale signal</H3>

      <P>
        Because close to 40% of a competitor's catalog carrying a discount is normal for this
        vertical, the number worth alerting on is the delta, not the raw share. A competitor
        jumping from 35% of their catalog on sale to 65% in a short window is launching a sitewide
        event, even if no single product's discount depth looks unusual on its own.
      </P>

      <H3>Discount depth trends over time matter more than any single price point</H3>

      <P>
        A single markdown tells you little in a vertical where 53% off is the average. What tells
        you something is the trend: a competitor whose average discount depth is climbing from 40%
        toward 60% over several weeks is either clearing inventory or resetting customer
        expectations about what a "normal" price looks like. Both are worth knowing before it shows
        up in your own conversion numbers.
      </P>

      <Callout>
        Beaconmon's{' '}
        <A href="/blog/shopify-permanent-sale-compare-at-price">
          permanent sale post
        </A>{' '}
        covers the aggregate compare_at_price pattern across all verticals. This post breaks out
        the apparel-specific numbers, which run well above the aggregate rate in both frequency
        and depth. For a look at a category with the opposite pattern, see the{' '}
        <A href="/blog/dtc-coffee-brand-pricing-data">coffee brand pricing data</A>, where formal
        discounting is rare and price moves are driven by input costs instead.
      </Callout>

      <P>
        If you sell DTC apparel on Shopify, see{' '}
        <A href="/for/dtc-brands">how Beaconmon works for DTC brands</A>, or check{' '}
        <A href="/pricing">pricing</A> to set up compare-at-price and discount-depth tracking
        across your competitive set.
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

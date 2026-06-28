import type { Metadata } from 'next';
import BlogPostLayout, {
  H2,
  H3,
  P,
  UL,
  LI,
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

const SLUG = 'shopify-permanent-sale-compare-at-price';

export const metadata: Metadata = {
  title: "23% of Shopify Products Are Permanently 'On Sale': What the Data Shows | Beaconmon",
  description:
    "Across 178,623 tracked products, 23% have a compare_at_price set right now. For 18% of brands, that number is 30% or higher, meaning a third of their catalog is permanently framed as discounted.",
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Haimanot Getu', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is it legal to show a fake original price in a compare_at_price field?',
    a: 'In most jurisdictions, displaying a reference price requires that the price was a genuine former price charged for a reasonable period. In the US, the FTC and state consumer protection laws prohibit fictitious "original" prices. In the EU, the Omnibus Directive requires that displayed reference prices reflect the lowest price in the prior 30 days. A competitor showing a compare_at_price that was never their actual selling price is in legal grey territory at minimum and potentially in violation of consumer protection law.',
  },
  {
    q: 'Should I use compare_at_price for my own products?',
    a: 'Only if the reference price is genuine, meaning it was your actual selling price for a meaningful period before the promotion. Using a compare_at_price that was never your real price exposes you to legal risk and, if customers notice the pattern, erodes trust. The brands in permanent sale mode are taking a calculated risk that customers will not notice or will not care. Many do notice.',
  },
  {
    q: "How do I know if a competitor's compare_at_price is genuine or fabricated?",
    a: "Compare the compare_at_price to the actual price history from before the current sale period. If the product has never actually sold at the compare_at_price level, if it appeared in the catalog already discounted on day one, the reference price is fictional. Beaconmon's price history view shows you what a product's price actually was before the current compare_at_price appeared.",
  },
  {
    q: 'What does it mean for my pricing strategy if a key competitor is in permanent sale mode?',
    a: "A competitor in permanent sale mode has anchored their customers to a discount price. Their effective full price, the amount customers actually pay, is the discounted price. If you sell at their 'original' price without a compare_at_price, you may appear more expensive to customers who compare, even if your price is the same as their effective price. Knowing they operate this way changes how you frame your own pricing in comparative contexts.",
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="23% of Shopify Products Are Permanently 'On Sale': What the Data Shows"
      description="Across 178,623 tracked products, 23.23% have a compare_at_price set right now. For 18% of the brands we track, more than a third of their catalog is permanently framed as discounted: not a promotion, a pricing strategy."
      slug={SLUG}
      publishedAt="2026-07-04"
      dateModified="2026-06-28"
      readingTime={6}
      tag="Data & Research"
      schemas={[faqSchema]}
    >
      <P>
        Open a Shopify competitor&apos;s product page right now. There is roughly a 1 in 4 chance you
        will see a crossed-out original price next to a lower sale price. Not because they are
        running a promotion, because that is simply how they price.
      </P>

      <P>
        Across the 178,623 products Beaconmon tracks, <Strong>41,026 (23.23%) have a
        compare_at_price set higher than their current price</Strong> at this moment. For a
        significant portion of competitors, this is not a temporary state.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          23.23% of all tracked Shopify products carry a compare_at_price right now, but this
          is not evenly distributed. It reflects two fundamentally different uses of the same field.
        </KeyTakeaway>
        <KeyTakeaway>
          For 17.8% of brands, more than 30% of their catalog is permanently marked as discounted.
          Compare_at_price for these brands is a pricing anchor, not a sale flag.
        </KeyTakeaway>
        <KeyTakeaway>
          A competitor in permanent sale mode has anchored customers to the discounted price.
          Their effective price is what the customer pays, not the crossed-out figure.
        </KeyTakeaway>
        <KeyTakeaway>
          When a permanent-sale brand suddenly removes compare_at_price from their catalog, that
          is one of the highest-signal events you can observe: it typically means a brand refresh
          or response to legal scrutiny.
        </KeyTakeaway>
        <KeyTakeaway>
          Comparing yourself against a permanent-sale competitor using their compare_at_price as
          the baseline means comparing against a number that was never a real price.
        </KeyTakeaway>
      </KeyTakeaways>

      <StatGrid>
        <Stat value="23.23%" label="of all tracked Shopify products have a compare_at_price set right now" />
        <Stat value="17.8%" label="of tracked brands have 30%+ of their catalog permanently marked as 'on sale'" />
        <Stat value="46.6%" label="of brands never use compare_at_price at all" />
      </StatGrid>

      <H2>The distribution of sale behavior</H2>

      <P>
        When you look at compare_at_price usage across 489 competitors with meaningful catalog
        sizes, the distribution breaks into four clear segments, and the two extremes account
        for almost two-thirds of all brands.
      </P>

      <UL>
        <LI>
          <Strong>Never discount (228 brands, 46.6%)</Strong>: Zero compare_at_price usage across
          the entire catalog. No promotional pricing visible in the product feed, ever.
        </LI>
        <LI>
          <Strong>Occasional sales (85 brands, 17.4%)</Strong>: Less than 10% of catalog on sale
          at any given time. Promotions are infrequent enough that customers do not expect them.
        </LI>
        <LI>
          <Strong>Frequent sales (89 brands, 18.2%)</Strong>: 10-30% of catalog on sale at once.
          Real promotions with rotation: products cycle in and out of sale status.
        </LI>
        <LI>
          <Strong>Permanent sale mode (87 brands, 17.8%)</Strong>: 30% or more of catalog
          continuously marked as discounted. The same products stay in &quot;sale&quot; status indefinitely.
        </LI>
      </UL>

      <H2>Permanent sale mode as a pricing strategy</H2>

      <P>
        Permanent sale mode is a reference price strategy, not a promotional strategy. The
        compare_at_price functions as a psychological anchor: a number that makes the actual
        price feel like a deal regardless of whether the product has ever sold at the higher price.
      </P>

      <P>
        A product always priced at $59 feels different from a product priced at $79 with a
        compare_at_price of $99, even though the buyer pays $59 in both cases. The original price
        becomes the reference point. Any price below the reference feels like value.
      </P>

      <SummaryStatement>
        For brands in permanent sale mode, their advertised &quot;original&quot; price is meaningless as
        a competitive data point. The number that matters is their actual selling price: what
        the customer pays, not the compare_at_price, which has never been charged.
      </SummaryStatement>

      <Callout>
        For brands in permanent sale mode, filter compare_at_price from your analysis entirely.
        The number that matters for comparison is their actual selling price, the figure next to
        the compare_at_price, not the compare_at_price itself.
      </Callout>

      <H2>Why this matters for competitor analysis</H2>

      <H3>You may be comparing to the wrong price</H3>

      <P>
        If a competitor in permanent sale mode shows $79 crossed out with a $59 current price,
        and your product is priced at $65, a naive reading says you are $6 more expensive than
        they are. Their effective price is $59 and has always been $59. The crossed-out $79 is
        theater.
      </P>

      <P>
        When analyzing competitor pricing, use their actual price (the amount the customer pays),
        not their compare_at_price. The compare_at_price of a permanent-sale brand is not a
        former price: it is a psychological anchor with no transactional meaning.
      </P>

      <H3>Removing compare_at_price is a significant signal</H3>

      <P>
        When a competitor who has operated in permanent sale mode suddenly removes compare_at_price
        from their catalog, it is a genuine strategic event. They may be undertaking a brand
        refresh, moving upmarket, or responding to legal scrutiny about reference price accuracy.
        The removal is more meaningful than almost any other single pricing event you could
        observe from them.
      </P>

      <H3>The 46.6% who never discount tell you what clean pricing looks like</H3>

      <P>
        The near-majority of tracked brands never use compare_at_price at all. For these brands,
        the price you see is the price they have always charged. Comparing yourself against them
        is a clean comparison: no anchor effects, no reference price distortion. If you want
        to know what a product category actually costs, look at the never-discount brands first.
      </P>

      <H2>Monitoring configuration per segment</H2>

      <P>
        The right monitoring configuration differs by segment. Applying the same alert rules to
        a never-discount brand and a permanent-sale brand produces noise from one and misses
        everything from the other.
      </P>

      <ComparisonTable
        headers={['Brand segment', 'Compare_at_price signal', 'What to actually monitor', 'Alert priority']}
        rows={[
          [
            'Never-discount (46.6%)',
            'Never appears: not relevant',
            'Actual price changes of 5%+',
            'High: any compare_at_price appearing is a major event',
          ],
          [
            'Occasional salers (17.4%)',
            'Rare: each instance is a genuine promotion',
            'Instant alert when compare_at_price appears',
            'High: respond within the 17-hour flash sale window',
          ],
          [
            'Frequent salers (18.2%)',
            'Rotates in and out: watch coverage %',
            'Which products enter and exit sale status',
            'Medium: route to digest, watch for depth changes',
          ],
          [
            'Permanent sale mode (17.8%)',
            'Static: structural noise, not a signal',
            'Actual price changes; compare_at_price removal from catalog',
            'Low for individual changes; high when coverage drops 10%+',
          ],
        ]}
      />

      <UL>
        <LI>
          <Strong>Never-discount brands</Strong>: Monitor actual price changes only.
          Compare_at_price alerts are irrelevant: there is nothing to alert on.
        </LI>
        <LI>
          <Strong>Occasional salers</Strong>: Set instant alerts for compare_at_price
          appearing. Their sales are rare enough to be newsworthy. See{' '}
          <A href="/blog/shopify-competitor-sales-last-24-hours">
            why the alert needs to be instant
          </A>
          .
        </LI>
        <LI>
          <Strong>Permanent sale mode</Strong>: Filter out compare_at_price changes as routine
          noise. Alert only on wholesale shifts: compare_at_price disappearing from the catalog
          entirely, or the gap between compare_at_price and actual price changing significantly
          across multiple SKUs.
        </LI>
      </UL>

      <SummaryStatement>
        Applying the same compare_at_price alert rules to every competitor produces noise from
        permanent-sale brands and misses everything from never-discount brands. Segment your
        competitors first, then configure alerts per segment.
      </SummaryStatement>

      <P>
        For a full breakdown of discount behavior across DTC brands, see{' '}
        <A href="/blog/shopify-dtc-two-tribes-discounting">
          the two tribes of DTC discounting
        </A>
        .
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

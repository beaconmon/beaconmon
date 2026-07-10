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

const SLUG = 'dtc-skincare-brand-pricing-data';

export const metadata: Metadata = {
  title: 'DTC Skincare Pricing: Why Only 9% Are Ever on Sale',
  description:
    'We tracked 2,146 skincare and beauty SKUs across 87 brands. Only 9.04% carry a compare-at-price, discounting 24.01% on average, half the depth of apparel.',
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  openGraph: { url: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Haimanot Getu', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Do skincare and beauty brands discount as often as fashion brands?',
    a: 'No, not close. In our sample of 2,146 tracked skincare and beauty SKUs across 87 brands, 9.04% carry a compare-at-price at any given time. In our apparel sample, that number is 39.01%. Apparel brands discount roughly 4x more often than skincare and beauty brands.',
  },
  {
    q: "What's a typical discount depth for DTC skincare brands?",
    a: 'About 24.01% off, based on the products in our sample that do carry a compare-at-price. That is roughly half the 53.00% average discount depth we see in apparel. When skincare brands discount, they discount shallow.',
  },
  {
    q: "How do I know if a competitor's discount is a big deal in the beauty category?",
    a: "Compare it against that brand's own history, not against apparel norms. Because only 9.04% of skincare and beauty products are on sale at any moment, a brand moving from never discounting to having 10% of its catalog on sale is a much bigger shift than the same move would be in apparel, where discounting is closer to routine.",
  },
  {
    q: 'What should trigger a competitor alert in the skincare and beauty category?',
    a: "A compare-at-price appearing for the first time on a brand that has never used one is worth an immediate alert. After that, track the percentage of a competitor's catalog on sale over time rather than individual SKU prices. Small, shallow discounts in the 10-20% range are normal for this category and do not need urgent alerts on their own.",
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="DTC Skincare Brand Pricing Data: Why Only 9% of Products Are Ever on Sale"
      description="We looked at a sample of 2,146 tracked skincare and beauty SKUs across 87 brands. Only 9.04% carry a compare-at-price at any given time, and the average discount when they do is 24.01% off, about half the depth of apparel."
      slug={SLUG}
      publishedAt="2026-07-09"
      dateModified="2026-07-09"
      readingTime={7}
      tag="Data & Research"
      schemas={[faqSchema]}
      showDatasetLink
    >
      <P>
        Skincare and beauty brands are built on a promise that discounting undermines: this works,
        and it is worth the price. So we checked whether that shows up in the pricing data, not
        just the brand messaging.
      </P>

      <P>
        Across a sample of 2,146 tracked skincare and beauty SKUs from 87 brands, <Strong>only
        9.04% currently carry a{' '}
        <A href="/glossary#compare-at-price">compare-at-price</A></Strong>, the Shopify signal for a formal
        discount. When a skincare or beauty product is marked down, the average depth is{' '}
        <Strong>24.01% off</Strong>. Both numbers are a fraction of what we see in apparel. This
        sample undercounts the full beauty category, since some brands use generic product_type
        strings our filter misses, so treat these as a meaningful slice, not the whole vertical.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          2,146 tracked skincare and beauty SKUs across 87 brands sampled, filtered from product
          types like serum, cream, cleanser, moisturizer, retinol, and sunscreen.
        </KeyTakeaway>
        <KeyTakeaway>
          Only 9.04% of sampled products carry a compare-at-price at any given moment. Formal
          discounting is the exception in this category, not the norm.
        </KeyTakeaway>
        <KeyTakeaway>
          When skincare and beauty brands do discount, the average depth is 24.01% off, a shallow
          markdown compared to other DTC categories.
        </KeyTakeaway>
        <KeyTakeaway>
          Apparel brands discount roughly 4x more often and roughly 2x as deep as skincare and
          beauty brands in our data. See the full apparel numbers in the{' '}
          <A href="/blog/dtc-fashion-brand-pricing-data">sibling fashion pricing post</A>.
        </KeyTakeaway>
        <KeyTakeaway>
          Because discounting is rare in this category, a new discount pattern from a skincare or
          beauty competitor is a bigger strategic signal than the same pattern would be in apparel.
        </KeyTakeaway>
      </KeyTakeaways>

      <StatGrid>
        <Stat value="9.04%" label="of sampled skincare and beauty products carry a compare-at-price right now" />
        <Stat value="24.01%" label="average discount depth on the products that are marked down" />
        <Stat value="87" label="skincare and beauty brands sampled" />
      </StatGrid>

      <H2>Finding 1: Under 1 in 10 skincare products are on sale at any moment</H2>

      <P>
        Of the 2,146 tracked skincare and beauty SKUs in our sample, <Strong>9.04% currently
        carry a compare-at-price.</Strong> That means more than 9 out of 10 products in this
        category are presented at a single, non-discounted price at any given time.
      </P>

      <P>
        This is consistent with how the category is usually positioned. Skincare and beauty
        brands sell on perceived efficacy: a serum, a cream, a retinol treatment is supposed to
        work, and a price that moves around constantly undercuts that claim. Frequent discounting
        signals commodity, not results. Apparel does not carry the same risk: a discounted sweater
        is still a sweater, but a discounted "clinically proven" serum raises the question of
        why it needed a discount in the first place.
      </P>

      <SummaryStatement>
        9.04% of sampled skincare and beauty products carry a compare-at-price at any given
        moment. Formal discounting is rare enough in this category that it should not be your
        default assumption when you are watching a competitor's catalog.
      </SummaryStatement>

      <H2>Finding 2: When skincare brands do discount, they discount shallow</H2>

      <P>
        Rarity is only half the picture. When skincare and beauty brands do mark a product down,{' '}
        <Strong>the average discount depth is 24.01% off.</Strong> Compare that to apparel, where
        the average discount depth on marked-down products is 53.00%, more than double.
      </P>

      <ComparisonTable
        headers={['Metric', 'Skincare and Beauty', 'Apparel']}
        rows={[
          ['Share of sampled products currently on sale', '9.04%', '39.01%'],
          ['Average discount depth when on sale', '24.01%', '53.00%'],
          ['Products sampled', '2,146', '33,049'],
          ['Brands sampled', '87', '68'],
        ]}
      />

      <P>
        Apparel discounts roughly 4x more often and roughly 2x as deep as skincare and beauty in
        our data. Deep, frequent markdowns are close to standard practice in apparel, driven by
        trend cycles and inventory turnover. Skincare and beauty brands protect price far more
        tightly, and when they do move, they move in smaller increments.
      </P>

      <SummaryStatement>
        Skincare and beauty brands discount about a quarter as often as apparel, and about half
        as deep when they do. A 24.01% markdown is a meaningful move in this category, not a
        rounding error the way a similar cut might read in apparel.
      </SummaryStatement>

      <Callout>
        Compare-at-price is not the only discount mechanism a skincare or beauty brand can use. A
        free-gift-with-purchase offer or a discount code tied to a minimum order value will not
        show up as a compare-at-price change at all, only in a promo banner or homepage copy
        change. If you are only watching compare-at-price, you can miss a live promotion entirely.
      </Callout>

      <H2>Why discount rarity makes any change a bigger signal here</H2>

      <P>
        In a category where most brands never discount, a shift from "never on sale" to "10% of
        catalog on sale" is not routine seasonal behavior. It is closer to a strategic pivot:
        clearing inventory ahead of a reformulation, responding to a new entrant on price, or
        testing whether the brand's price ceiling actually holds.
      </P>

      <P>
        The same move in apparel barely registers, since deep and frequent discounting is already
        the norm for roughly 4 in 10 tracked products. See the{' '}
        <A href="/blog/dtc-fashion-brand-pricing-data">apparel pricing data post</A> for the
        full numeric contrast, and the{' '}
        <A href="/blog/shopify-permanent-sale-compare-at-price">aggregate compare-at-price
        findings</A> this vertical breaks out from.
      </P>

      <P>
        For a <A href="/for/dtc-brands">DTC brand</A> competing in skincare or beauty, this cuts
        both ways. If you rarely discount, a competitor's first-ever markdown deserves immediate
        attention. If you are considering discounting yourself, know that you are moving against
        the grain of how this category is priced, and it will likely stand out to shoppers who
        are used to seeing your products at one price.
      </P>

      <H2>What this means for monitoring a skincare or beauty competitor</H2>

      <H3>Alert immediately on a first-time discount, don't batch it</H3>

      <P>
        A compare-at-price appearing for the first time on a brand that has never used one is
        rare enough, at a 9.04% baseline, that it should trigger an immediate alert rather than
        sit in a weekly digest. This is one of the clearest strategic signals available in this
        category.
      </P>

      <H3>Watch the percentage of catalog on sale over time, not just individual SKUs</H3>

      <P>
        A single product going on sale is different from a competitor's overall discount
        footprint expanding. Track what share of a competitor's catalog carries a compare-at-price
        week over week. A creeping increase, even a small one, tells you more about strategic
        direction than any single SKU price change.
      </P>

      <H3>Don't over-alert on shallow, small discounts</H3>

      <P>
        Discounts in the 10-20% range are within normal bounds for this category and do not
        need urgent alerts on their own. Save urgency for first-time discounters, sudden jumps in
        percent-of-catalog-on-sale, or depths that exceed the 24.01% category average by a wide
        margin. Route the rest to a periodic digest so alerts stay meaningful.
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

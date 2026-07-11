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
  FAQ,
} from '@/components/marketing/BlogPostLayout';
import { createFAQSchema } from '@/lib/blog';

const SLUG = 'shopify-products-json-competitor-intelligence';

export const metadata: Metadata = {
  title: "What products.json Tells You About a Competitor | Beaconmon",
  description:
    "Shopify's /products.json is more than a price list. Each field reveals competitor strategy: pricing, positioning, and what they're planning next.",
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  openGraph: { url: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Haimanot Getu', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is accessing a competitor\'s products.json legal?',
    a: 'Yes. The products.json endpoint is publicly accessible by design. Shopify intentionally serves it without authentication to power storefronts, search apps, and third-party integrations. Fetching public data from a public endpoint is not a ToS violation and is not analogous to unauthorized access. That said, you should not scrape at abusive rates that would constitute a denial-of-service on the store\'s infrastructure.',
  },
  {
    q: 'How many products does products.json return per request?',
    a: 'By default, 30 products per page. You can request up to 250 per page using the limit parameter: /products.json?limit=250. For stores with more than 250 products, you need to paginate using the page parameter. Most monitoring tools handle pagination automatically.',
  },
  {
    q: 'Does products.json show sold-out products or only in-stock items?',
    a: 'It shows all published products regardless of stock status. Each variant has an "available" boolean. A product with all variants set to available: false is published but fully sold out. This distinction matters for stockout tracking, which is a separate signal from product removal.',
  },
  {
    q: 'Can I use products.json to see a competitor\'s historical pricing?',
    a: 'Not directly. The feed shows current state only. Historical pricing requires storing snapshots over time and diffing them. That is exactly what tools like Beaconmon do: poll the feed on a schedule, store the state, and surface changes as events with timestamps.',
  },
  {
    q: 'What does it mean when a competitor has no compare_at_price on any product?',
    a: 'It means they are not currently running visible promotions on any product. Some brands deliberately avoid crossed-out pricing as a positioning choice (premium brands often do this to avoid anchoring on a higher reference price). Others simply do not discount. When compare_at_price suddenly appears on a brand that never used it before, that is a strong signal of a promotional shift.',
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="What Shopify's products.json Actually Tells You About a Competitor"
      description="products.json is more than a price list. Every field in the feed is a signal about competitor strategy. Here's how to read each one and what it reveals about their pricing, positioning, and next moves."
      slug={SLUG}
      publishedAt="2026-06-13"
      readingTime={10}
      tag="Competitor Monitoring"
      schemas={[faqSchema]}
    >
      <P>
        Shopify&apos;s /products.json is not just a price list. Every field in the feed is a signal
        about how a competitor runs their business: when products launched, whether a sale is
        active, which variants survived rationalization, and what internal tags reveal about
        upcoming strategy. The endpoint is publicly accessible on every Shopify store with no
        authentication required. Most merchants who know it exists use it only to pull prices.
        The other fields carry more signal.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          /products.json is publicly accessible on every Shopify store - it broadcasts prices,
          stock status, launch dates, tags, and product architecture to anyone who fetches it.
        </KeyTakeaway>
        <KeyTakeaway>
          compare_at_price appearing on a product means a sale just started. compare_at_price
          disappearing while price holds means they kept the &quot;sale&quot; price as the new standard
          - a common DTC promotional tactic.
        </KeyTakeaway>
        <KeyTakeaway>
          published_at is the most underused field. Any product with a published_at timestamp
          newer than your last snapshot is a new launch you can detect within minutes.
        </KeyTakeaway>
        <KeyTakeaway>
          Tags like &quot;subscription&quot;, &quot;bundle&quot;, and &quot;limited-edition&quot; reveal merchandising intent
          before any public announcement is made.
        </KeyTakeaway>
        <KeyTakeaway>
          Catalog patterns - growth rate, price tier distribution, promotion frequency - reveal
          strategic direction better than any individual product change.
        </KeyTakeaway>
      </KeyTakeaways>

      <H2>What the endpoint is and how to access it</H2>

      <P>
        Every public Shopify storefront serves its product catalog at{' '}
        <Strong>yourdomain.com/products.json</Strong>. Shopify built this as an intentional public
        endpoint to power search apps, storefronts, and third-party integrations. Every Shopify
        merchant who has not restricted it is broadcasting their full catalog to anyone who asks.
      </P>

      <P>
        Fetch it in your browser right now. Navigate to any Shopify competitor&apos;s domain and append
        /products.json. You will see a JSON file. The default page size is 30 products; add{' '}
        <Strong>?limit=250</Strong> to get up to 250 per request. For stores with more products,
        use <Strong>?page=2</Strong>, <Strong>?page=3</Strong>, and so on.
      </P>

      <StatGrid>
        <Stat value="250" label="products per request using ?limit=250; paginate with ?page=2 for larger catalogs" />
        <Stat value="6+" label="actionable data fields per product beyond just the price" />
        <Stat value="seconds" label="how quickly the feed reflects a price change or new publish in Shopify admin" />
      </StatGrid>

      <Callout>
        The products.json feed is a snapshot of right now. It shows current state, not history.
        The signal compounds when you store snapshots over time and compare them,
        which is what monitoring tools do automatically.
      </Callout>

      <H2>Field-by-field: what each property reveals</H2>

      <P>
        Six fields carry most of what matters: price, compare_at_price, available,
        published_at, tags, and variants. Price and compare_at_price show current positioning and
        promotions. Published_at tracks launch timing. Tags expose internal merchandising intent
        before any public announcement. Variants map catalog depth and rationalization over time.
      </P>

      <H3>price and compare_at_price</H3>

      <P>
        <Strong>price</Strong> is the current selling price per variant. <Strong>compare_at_price</Strong>{' '}
        is the crossed-out &quot;was&quot; price shown on the product page when a promotion is active. When
        compare_at_price is null, the product is at its standard price. When compare_at_price is
        set and higher than price, the product is on sale.
      </P>

      <P>
        What this tells you: The spread between price and compare_at_price is the stated discount.
        A compare_at_price that just appeared yesterday means a promotion started. One that
        disappeared means the promotion ended and they held the &quot;sale&quot; price, which is a common
        DTC tactic. A compare_at_price that has been present for six months means the discount
        is the de facto price and the compare figure is a marketing anchor.
      </P>

      <SummaryStatement>
        A compare_at_price that has been present for six months is not a sale. It is a marketing
        anchor - the product has been repriced and the &quot;original&quot; figure is used to create
        perceived value, not to reflect a real previous price.
      </SummaryStatement>

      <H3>available</H3>

      <P>
        A boolean per variant. <Strong>true</Strong> means the variant is in stock and purchasable.
        <Strong>false</Strong> means it is sold out or unavailable. Note that Shopify stores can
        continue selling when out of stock if they allow backorders, in which case available stays
        true even with zero inventory. Most DTC brands set available: false when stocked out.
      </P>

      <P>
        What this tells you: A product that goes from all variants available to all variants
        unavailable had a stockout. Stockouts on a fast-selling SKU signal genuine demand. A
        competitor running low on their best product is a window to capture their customers.
        A product that stays unavailable for weeks is being discontinued.
      </P>

      <H3>published_at</H3>

      <P>
        The ISO timestamp when the product was first published to the storefront. This field does
        not change when a product is edited; it only reflects the original publish date.
      </P>

      <P>
        What this tells you: The most direct signal for new product launch detection. Any product
        with a published_at timestamp that did not exist in your previous snapshot is a new launch.
        Sorted by published_at descending, you can see the competitor&apos;s full launch history and
        the cadence at which they add new products.
      </P>

      <P>
        For a deeper look at how to use this signal, see{' '}
        <A href="/blog/track-competitor-new-product-launches-shopify">
          how to track competitor new product launches on Shopify
        </A>
        .
      </P>

      <H3>tags</H3>

      <P>
        A comma-separated string of tags the merchant has applied to the product. Tags power
        collection filtering, search, and automated rules in the Shopify admin. They are often
        used internally to segment products, which means they reveal internal categorization
        decisions.
      </P>

      <P>
        What this tells you: Look for tags like <Strong>subscription</Strong>,{' '}
        <Strong>bundle</Strong>, <Strong>best-seller</Strong>, <Strong>new-arrival</Strong>,{' '}
        <Strong>limited-edition</Strong>, or <Strong>sale</Strong>. These surface merchandising
        intent the merchant did not necessarily announce publicly. A competitor tagging products
        with &quot;subscription&quot; before launching a subscription program is foreshadowing. Tags
        added and then removed tell you about internal tests that did not pan out.
      </P>

      <SummaryStatement>
        Tags in products.json are often set internally before any public announcement. A
        competitor tagging items with &quot;subscription&quot; weeks before launching a subscription
        program is foreshadowing you can act on before the campaign goes live.
      </SummaryStatement>

      <H3>variants and variant count</H3>

      <P>
        Each product contains an array of variants, one per distinct option combination (size,
        color, flavor). The count of variants is an indirect indicator of catalog depth for that
        product.
      </P>

      <P>
        What this tells you: A competitor adding variants to an existing product is expanding it,
        usually in response to customer demand or to broaden appeal. A product that launches with
        12 variants and over three months shrinks to 4 is being rationalized. The surviving
        variants are the ones that actually sold.
      </P>

      <H3>product_type</H3>

      <P>
        A freeform string the merchant sets to classify the product. Not all merchants use it,
        but when they do it maps directly to their internal product taxonomy.
      </P>

      <P>
        What this tells you: A competitor adding a product_type that has never appeared in their
        catalog before is entering a new category. Even one product with product_type &quot;Brewing
        Equipment&quot; in a coffee catalog that previously had none is a category expansion signal.
      </P>

      <H2>What products.json does not tell you</H2>

      <UL>
        <LI>
          <Strong>Revenue and sales volume</Strong>: The feed has no transaction data. You cannot
          infer how much a competitor is selling from products.json alone.
        </LI>
        <LI>
          <Strong>Inventory quantity</Strong>: The available boolean tells you in-stock or not.
          It does not tell you how many units remain. A product with 3 units left and one with
          3,000 both show available: true.
        </LI>
        <LI>
          <Strong>Conversion rates or traffic</Strong>: Products.json says nothing about which
          products are getting found or converting. For that you need third-party traffic tools.
        </LI>
        <LI>
          <Strong>Draft or unpublished products</Strong>: Only published products appear in the
          feed. You cannot see what a competitor is working on before they publish it.
        </LI>
        <LI>
          <Strong>App-gated or B2B products</Strong>: Some merchants use apps or B2B features
          to hide products from the public catalog. Those products will not appear in the feed.
        </LI>
      </UL>

      <H2>Reading catalog-level patterns</H2>

      <P>
        Individual products tell you what they sell. Catalog patterns tell you where they are going.
      </P>

      <H3>Catalog growth rate</H3>

      <P>
        Count the total products in the feed each week. A competitor adding 10 products per month
        is building aggressively. One holding steady at the same catalog size for six months is
        focused on depth over breadth, or is constrained by supply or production.
      </P>

      <H3>Price tier distribution</H3>

      <P>
        Map all product prices. Is the catalog clustered at a particular price point, or spread
        across a range? A competitor who has held all products between $15 and $30 for a year and
        then launches a $75 product is moving upmarket. A competitor who launches a $9 product
        into an otherwise $25 to $40 catalog is testing a volume or acquisition tier.
      </P>

      <H3>Promotion frequency</H3>

      <P>
        Track how often compare_at_price appears across the catalog. A competitor running a sale
        on 30% of their catalog every other week is training customers to wait for sales. One who
        almost never uses compare_at_price is protecting perceived value. Knowing their pattern
        helps you anticipate when their next sale will likely hit.
      </P>

      <H2>What you miss by checking manually</H2>

      <P>
        Reading products.json manually once a month is better than nothing. But most competitive
        moves happen and resolve within days. A flash sale starts and ends before your next check.
        A new product in your category accumulates SEO signals and reviews before you know it
        exists. A variant discontinuation tells you what stopped selling - but only if you caught
        the moment it disappeared from the feed.
      </P>

      <H2>Turning feed data into a monitoring workflow</H2>

      <P>
        Automated monitoring that checks every 5 to 15 minutes and surfaces only meaningful
        changes is how you turn a public endpoint into an operational monitoring feed.
      </P>

      <P>
        Beaconmon attaches to the full products.json feed for every Shopify competitor you add.
        Each check stores a snapshot. When anything changes - including new products, price moves,
        availability shifts, or tag additions - Beaconmon diffs the snapshots and fires an alert
        with exactly what changed and on which product. You see the before and after, not just
        a flag.
      </P>

      <P>
        For the full setup walkthrough, see{' '}
        <A href="/blog/how-to-monitor-competitor-prices-shopify">
          how to monitor competitor prices on Shopify
        </A>
        .
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

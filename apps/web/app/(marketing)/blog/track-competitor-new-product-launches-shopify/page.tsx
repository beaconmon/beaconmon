import type { Metadata } from 'next';
import BlogPostLayout, {
  H2,
  H3,
  P,
  UL,
  OL,
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

const SLUG = 'track-competitor-new-product-launches-shopify';

export const metadata: Metadata = {
  title: "Track a Competitor's New Product Launches | Beaconmon",
  description:
    'Shopify stores broadcast every product launch in plain JSON. Learn to catch launches within minutes and turn competitor catalog moves into your advantage.',
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  openGraph: { url: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Haimanot Getu', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How quickly can I detect a competitor\'s new Shopify product after it goes live?',
    a: 'With a monitoring interval of 5 to 15 minutes, you typically detect a new product within one check cycle. Shopify\'s products.json feed reflects a new publish within seconds of the merchant clicking Save. The limiting factor is your polling frequency, not the feed itself.',
  },
  {
    q: 'Can I monitor new product launches without a Shopify store myself?',
    a: 'Yes. Products.json is publicly accessible on any Shopify storefront regardless of who is doing the monitoring. You do not need a Shopify account or any special access. Beaconmon attaches to competitor feeds on any plan.',
  },
  {
    q: 'What is the difference between a new product and a restocked product?',
    a: 'A new product has a published_at timestamp that did not exist in your previous snapshot. A restock is a product that already existed but had available: false on all variants and now has at least one available: true. Both are useful signals; they just mean different things strategically.',
  },
  {
    q: 'Can competitors detect that I am monitoring their product launches?',
    a: 'Not directly. Products.json is a public endpoint that Shopify stores use for their own search and storefront features. Your monitoring requests look identical to the thousands of legitimate requests the endpoint serves daily. There is no mechanism for a merchant to see who is fetching their feed.',
  },
  {
    q: 'What if a competitor uses a password-protected store?',
    a: 'Password-protected Shopify stores do not serve public products.json. In that case you are limited to monitoring their social channels and email list for launch signals. Most live DTC brands do not run their storefronts behind a password, though some use it during pre-launch.',
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="How to Track a Competitor's New Product Launches on Shopify"
      description="Every Shopify store broadcasts new product launches in plain JSON. Learn how to read the published_at signal, catch launches within minutes, and turn competitor catalog moves into your advantage."
      slug={SLUG}
      publishedAt="2026-06-21"
      readingTime={8}
      tag="Competitor Monitoring"
      schemas={[faqSchema]}
    >
      <P>
        Every public Shopify store publishes new product launches in a structured JSON feed with
        an exact timestamp for when each product went live. With a 5 to 15 minute polling interval,
        you can detect a competitor&apos;s new product within one check cycle of it appearing. No
        scraping, no special access, no manual checking. The published_at field is the entire
        mechanism - and almost nobody uses it for launch detection.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          Every Shopify store broadcasts new product launches in products.json with an exact
          published_at timestamp. No scraping or special access required.
        </KeyTakeaway>
        <KeyTakeaway>
          With a 5 to 15 minute polling interval, you can detect a competitor&apos;s new product
          within one check cycle of it going live.
        </KeyTakeaway>
        <KeyTakeaway>
          Three launch patterns to distinguish: stealth launch (no hero change - testing),
          collection-first launch (category expansion signal), hero launch (full marketing
          commitment requiring immediate evaluation).
        </KeyTakeaway>
        <KeyTakeaway>
          Hero launches require immediate evaluation. The window before SEO and review
          velocity compound is narrow - often 24 to 48 hours.
        </KeyTakeaway>
        <KeyTakeaway>
          A product tagged &quot;subscription&quot; or &quot;bundle&quot; at launch reveals a retention or AOV
          strategy, not just new inventory being added.
        </KeyTakeaway>
      </KeyTakeaways>

      <H2>The signal hiding in products.json</H2>

      <P>
        Append <Strong>/products.json</Strong> to any Shopify domain and you get the store&apos;s full
        product catalog as structured data. Most people who know about this endpoint use it for price
        monitoring. Few use it for launch detection, which is the more valuable signal.
      </P>

      <P>
        Every product object in the feed contains a <Strong>published_at</Strong> field: the ISO
        timestamp when the merchant first published that product. Compare two snapshots of the same
        feed taken at different times and any product with a published_at timestamp newer than your
        last snapshot is a new launch.
      </P>

      <SummaryStatement>
        The published_at field is the entire launch detection mechanism. Compare any two snapshots
        and any product with a newer timestamp than your last check is a launch you just caught -
        with the exact minute it went live.
      </SummaryStatement>

      <Callout>
        The published_at field is the most underused signal in Shopify competitor monitoring.
        Everyone watches prices. Almost nobody watches launch dates, which means being early is
        cheap competitive advantage.
      </Callout>

      <H2>What you miss by finding out late</H2>

      <P>
        Catching a competitor launch two weeks after it goes live means you are responding to
        momentum, not to a launch. By then they have reviews, ranking signals, and conversion
        data. Catching it within 15 minutes means you are evaluating a fresh product with no
        moat yet - and you can decide whether to respond before any of that compounds.
      </P>

      <P>
        A competitor launches a new product line. Within 48 hours, customers who searched for your
        top SKU are now landing on their page instead. You find out two weeks later when your
        conversion rate report looks wrong. By then the competitor has reviews, rankings, and
        momentum you cannot reverse.
      </P>

      <H2>Three launch patterns worth distinguishing</H2>

      <P>
        Not all product launches carry the same urgency. Three patterns repeat across Shopify
        competitors: stealth (product live but not promoted, meaning the brand is testing),
        collection-first (category expansion without homepage commitment), and hero (full marketing
        launch with budget behind it). Knowing which type you are looking at tells you exactly
        how quickly you need to respond.
      </P>

      <H3>The stealth launch</H3>

      <P>
        A product appears in products.json but is not featured on the homepage, not linked from the
        main navigation, and not in any promoted collection. The product exists and is purchasable
        but the merchant has not announced it. This is common for:
      </P>

      <UL>
        <LI>Testing a new product with organic traffic before committing to a campaign</LI>
        <LI>B-stock or clearance items added without fanfare</LI>
        <LI>Soft launches targeting a specific customer segment via direct link</LI>
      </UL>

      <P>
        The stealth launch tells you more about competitor testing behavior than about immediate
        market threat. Watch whether the product gets promoted in the next 1 to 2 weeks. If it does,
        it validated in the soft launch.
      </P>

      <H3>The collection-first launch</H3>

      <P>
        A new product appears simultaneously in products.json and in a specific collection, but the
        homepage stays unchanged. The competitor is signaling category intent without leading with
        it. This pattern often appears when a brand is expanding into an adjacent category without
        wanting to dilute their main brand message.
      </P>

      <P>
        For your purposes: check which collection they added it to. A coffee brand adding a product
        to a &quot;Brewing Equipment&quot; collection they did not have before is a larger strategic signal
        than adding a new bag of beans to an existing roast collection. For more signals specific
        to that vertical, see our{' '}
        <A href="/blog/coffee-brand-competitor-intelligence">
          coffee brand competitor monitoring field guide
        </A>
        .
      </P>

      <H3>The hero launch</H3>

      <P>
        A new product appears in products.json and the homepage hero image changes on the same day
        or within 24 hours. This is a full launch with marketing commitment. The competitor is
        betting margin on this product. It gets their best placement, their email list, and their
        ad budget.
      </P>

      <SummaryStatement>
        A competitor commits their homepage hero, email list, and ad budget to a new product.
        You have 24 to 48 hours before that content starts accumulating SEO signals and reviews.
        If you catch it within 15 minutes of launch, you still have time to evaluate and respond.
      </SummaryStatement>

      <P>
        Hero launches warrant immediate action. Evaluate the product, its price point, and whether
        it overlaps with your catalog. If it does, you have a narrow window before the SEO and
        review velocity compounds.
      </P>

      <H2>What a new product actually reveals</H2>

      <P>
        A product launch carries positioning data. The metadata in products.json tells you how
        the competitor thought about it.
      </P>

      <StatGrid>
        <Stat value="tags" label="reveal positioning: bundle, subscription, limited-edition, new-arrival" />
        <Stat value="variants" label="show the product architecture: single SKU vs. full size run" />
        <Stat value="compare_at_price" label="signals whether it launched at introductory pricing" />
      </StatGrid>

      <P>
        A product tagged <Strong>subscription</Strong> or <Strong>bundle</Strong> tells you the
        competitor is testing a retention or AOV play, not just adding inventory. A product with
        six size variants and a compare_at_price on all of them launched at a promotional price,
        meaning they expect to compete on price at least initially.
      </P>

      <P>
        The product title and handle also tell you about their SEO intent. A product titled &quot;Dark
        Roast Coffee Beans 1kg&quot; is going after search volume. A product titled &quot;The Midnight Blend&quot;
        is building brand equity. Both are legitimate strategies. Knowing which one your competitor
        is pursuing tells you whether you need to respond in search or in brand.
      </P>

      <H2>Setting up launch detection on Beaconmon</H2>

      <P>
        Beaconmon checks the full products.json feed for every Shopify competitor you add. New
        product detection is automatic. You do not configure a separate monitor for launches.
      </P>

      <OL>
        <LI>
          Add a competitor monitor. Paste the competitor&apos;s Shopify domain. Beaconmon auto-detects
          the platform and attaches to the products.json feed.
        </LI>
        <LI>
          Set check frequency. For primary competitors in fast-moving categories, 5 minutes is
          appropriate. For secondary competitors or stable catalogs, 15 minutes is enough.
        </LI>
        <LI>
          Enable new product alerts. In the monitor settings, toggle &quot;New product launch&quot; under
          alert types. You will receive an alert with the product name, price, variants, and tags
          the moment a new published_at timestamp is detected.
        </LI>
        <LI>
          Route to Slack. New product alerts are time-sensitive. Route them to a dedicated
          #competitor-intel Slack channel so your team sees them immediately, not buried in email.
        </LI>
        <LI>
          Review the{' '}
          <A href="/features/intelligence">Weekly Competitor Report</A> each morning for a summary of
          all catalog changes across your competitor set, including new launches from the previous
          24 hours.
        </LI>
      </OL>

      <H2>What to do in the hour after a launch alert fires</H2>

      <P>
        The alert is information, not an instruction to react. Most new product launches by
        competitors do not require an immediate response. Run through this checklist before
        deciding what to do.
      </P>

      <UL>
        <LI>
          <Strong>Does it overlap with my catalog?</Strong> If the competitor launched a product
          you also sell, evaluate the pricing. If it does not overlap, note it as market context
          and watch whether it gets traction.
        </LI>
        <LI>
          <Strong>What collection did it land in?</Strong> A new collection signals a category
          expansion. A product added to an existing collection signals catalog depth. Category
          expansions warrant more attention.
        </LI>
        <LI>
          <Strong>What is the launch price?</Strong> Check compare_at_price. If it is set, the
          competitor is using a promotional price to acquire early buyers. The &quot;real&quot; price is the
          compare_at figure. Do not match the promotional price; wait to see what price they hold
          after the launch window.
        </LI>
        <LI>
          <Strong>Is this a stealth or hero launch?</Strong> Check their homepage. If the hero
          has not changed, you have time. If it has, start evaluating your response.
        </LI>
      </UL>

      <P>
        For launches that do require a strategic response, the{' '}
        <A href="/blog/ignore-match-counter-leapfrog-framework">
          ignore, match, counter, leapfrog framework
        </A>{' '}
        applies as well to product launches as it does to price drops. The question is the same:
        does this move require a response, and if so, what kind?
      </P>

      <H2>Watching the full catalog over time</H2>

      <P>
        Individual alerts surface events. Catalog patterns reveal strategy.
      </P>

      <P>
        A competitor who adds three products in the same subcategory over six weeks is building
        a category strategy, not filling inventory gaps. A competitor who launches and then quietly
        removes products after 60 days is testing and pruning. A competitor who launches with six
        size variants and then drops to two over time is rationalizing a catalog that got too wide.
      </P>

      <P>
        Beaconmon&apos;s{' '}
        <A href="/ecommerce-competitor-intelligence">competitor catalog history</A> shows you
        the full lifecycle: when products were added, when prices changed, and when products were
        removed. Most monitoring tools show you the current state. Beaconmon shows you the arc.
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

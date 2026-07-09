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

const SLUG = 'shopify-competitor-restock-speed-data';

export const metadata: Metadata = {
  title: 'Shopify Competitor Restocks: Median 22 Hours, Average 45 Hours | Beaconmon',
  description:
    'We matched 1,556 out-of-stock to back-in-stock events across tracked Shopify competitors. The median restock takes about 22 hours. The average takes 45.34. The gap between them is the actual finding.',
  alternates: { canonical: `https://beaconmon.com/blog/${SLUG}` },
  openGraph: { url: `https://beaconmon.com/blog/${SLUG}` },
  authors: [{ name: 'Beaconmon Team', url: 'https://www.linkedin.com/in/haimanot-getu/' }],
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How long do Shopify products stay out of stock?',
    a: 'Across 1,556 matched out-of-stock to back-in-stock events, the median restock time is about 22 hours, roughly a day. The average is 45.34 hours, almost two days. That gap matters: most sold-out products come back fast, but a long tail of slower restocks pulls the average well above the median.',
  },
  {
    q: "Is 'out of stock' on Shopify usually real or a marketing tactic?",
    a: 'It can be either, and a single out-of-stock alert does not tell you which. A product that returns within a day, close to the 22-hour median, is consistent with manufactured scarcity: marking an item unavailable and restocking it quickly to create urgency. A product that stays gone for several days is more consistent with a genuine supply problem. The resolution time is the signal, not the initial alert.',
  },
  {
    q: "How can I tell if a competitor's stockout is fake urgency or a real shortage?",
    a: 'Watch the same SKU across multiple stockout cycles. A pattern of repeated sub-24-hour stockouts on the same product looks like a deliberate scarcity tactic tied to marketing copy like "selling fast" or "back in stock" alerts. A stockout that has run for several days with no back_in_stock event, especially on a hero SKU, looks like a real gap in their supply chain, and potentially an opening if you carry the same or a comparable product.',
  },
  {
    q: 'Should I alert on every out-of-stock event I track?',
    a: 'Alert on the event, but do not treat it as the full picture. The stockout alone is only half the signal. Pair it with tracking whether and when the same SKU returns to back_in_stock. A resolution inside a day is a low-priority copy pattern worth noting. A stockout still unresolved after several days is worth a closer look.',
  },
];

const faqSchema = createFAQSchema(FAQS);

export default function Post() {
  return (
    <BlogPostLayout
      title="Shopify Competitor Restocks: Median 22 Hours, Average 45 Hours"
      description="We matched 1,556 out-of-stock to back-in-stock events across tracked Shopify competitors. The median restock takes about 22 hours. The average takes 45.34. The gap between them is the actual finding."
      slug={SLUG}
      publishedAt="2026-07-09"
      dateModified="2026-07-09"
      readingTime={7}
      tag="Data & Research"
      schemas={[faqSchema]}
      showDatasetLink
    >
      <P>
        A product goes out of stock on a competitor&apos;s store. Is that a real supply problem,
        or is it a marketing tactic, mark it unavailable, let urgency build, restock it a few
        hours later with a &quot;back in stock&quot; banner? From a single alert, the two look
        identical.
      </P>

      <P>
        We matched 1,556 out-of-stock events to the back-in-stock event for the same product
        across our tracked Shopify competitor set. The gap between the median and the average
        restock time turns out to be exactly the split you would expect: a fast-restocking
        cluster near the median, and a slower tail pulling the average up.
      </P>

      <KeyTakeaways>
        <KeyTakeaway>
          The median time from out-of-stock to back-in-stock across 1,556 matched pairs is
          21.999 hours, about 22 hours, or roughly a day.
        </KeyTakeaway>
        <KeyTakeaway>
          The average is 45.34 hours, almost two full days. A long tail of slower restocks pulls
          the mean well above the median.
        </KeyTakeaway>
        <KeyTakeaway>
          The gap between the two numbers is the finding: it separates fast-restocking scarcity
          patterns from genuinely slow, likely real, supply problems.
        </KeyTakeaway>
        <KeyTakeaway>
          A single out-of-stock alert, without a view of how long it takes to resolve, cannot
          tell you which kind of stockout you are looking at.
        </KeyTakeaway>
      </KeyTakeaways>

      <StatGrid>
        <Stat value="22 hours" label="median time from out-of-stock to back-in-stock" />
        <Stat value="45 hours" label="average restock time, pulled up by a slow tail" />
        <Stat value="1,556" label="matched out-of-stock to back-in-stock pairs analyzed" />
      </StatGrid>

      <H2>Finding 1: Most sold-out products come back within a day</H2>

      <P>
        Of the 5,213 out-of-stock events and 3,990 back-in-stock events tracked in the window, we
        were able to confidently match 1,556 pairs to the same product&apos;s full stockout-to-restock
        cycle. The rest either had not resolved yet inside the analyzed window or fell on either
        edge of it, one methodology note worth stating once and moving past.
      </P>

      <P>
        Across those 1,556 matched pairs, the{' '}
        <A href="/glossary#restock-speed">median restock time</A> is <Strong>21.999 hours,
        about 22 hours.</Strong> More than half of every sold-out product we tracked was back
        in stock within a single day. If your mental model of &quot;out of stock&quot; is a
        multi-week wait, the data does not support that as the typical case.
      </P>

      <SummaryStatement>
        The median Shopify competitor restock takes about 22 hours. Most sold-out products are
        not gone for long, they are back within a day.
      </SummaryStatement>

      <H2>Finding 2: The average is double the median, and that gap is the real finding</H2>

      <P>
        The <Strong>average restock time is 45.34 hours,</Strong> more than double the median.
        Averages and medians converge when a distribution is tight. Here they diverge sharply,
        which means a meaningful share of restocks take much longer than the typical case,
        long enough to drag the mean from 22 hours up toward 45.
      </P>

      <P>
        That gap maps onto two different real-world situations that both get logged as
        &quot;out of stock, then back in stock&quot;:
      </P>

      <UL>
        <LI>
          <Strong>Manufactured scarcity.</Strong> A product is marked unavailable, sometimes
          alongside &quot;selling fast&quot; or &quot;notify me when back&quot; messaging, and
          restocked quickly once the urgency has done its job. These cycles land near the
          22-hour median.
        </LI>
        <LI>
          <Strong>Genuine supply problems.</Strong> A bestseller actually runs out and the
          brand is waiting on inventory, a reorder, or a supplier. These cycles run several
          days and are what pulls the average up to 45 hours.
        </LI>
      </UL>

      <Callout>
        Do not collapse these two numbers into one. A single &quot;average restock time&quot;
        figure hides the split. State the median and the average together, and treat the
        distance between them as the signal.
      </Callout>

      <SummaryStatement>
        The average restock time is nearly double the median. That gap is not noise, it is the
        separation between fast scarcity-marketing cycles and slower, likely genuine, supply
        problems.
      </SummaryStatement>

      <H2>Reading a single restock: fast versus slow</H2>

      <P>
        Once you have both numbers, a single competitor stockout becomes more useful to
        interpret. The table below is a practical read of the two patterns in this data, not a
        guarantee about any individual product.
      </P>

      <ComparisonTable
        headers={['Restock speed', 'Approximate window', 'Likely explanation', 'What to do']}
        rows={[
          [
            'Fast restock',
            'Under roughly 24 hours, near the 22-hour median',
            'Often indicates manufactured scarcity, a marketing tactic rather than a real shortage',
            'Note it as a copy or positioning pattern worth watching, not a sourcing signal',
          ],
          [
            'Slow restock',
            'Multiple days, well past the 45-hour average',
            'Often indicates a genuine supply problem the brand has not yet resolved',
            'Worth investigating as a possible opportunity if you carry the same or a substitute product',
          ],
          [
            'Unresolved stockout',
            'No back_in_stock event yet',
            'Could still resolve either way, treat as open rather than concluded',
            'Keep watching the specific SKU instead of treating the initial alert as the full story',
          ],
        ]}
      />

      <H3>What a fast restock usually means</H3>

      <P>
        A product that returns within roughly a day is consistent with the manufactured
        scarcity pattern: mark it unavailable, let a &quot;selling fast&quot; or &quot;back in
        stock&quot; message do its work, then restock. This is a positioning and copy tactic
        worth noting in a competitive teardown, not a sign of a supply chain problem.
      </P>

      <H3>What a slow restock usually means</H3>

      <P>
        A product that stays out for several days, well beyond the 45-hour average, is more
        often a genuine shortage. The brand is waiting on inventory it does not yet have. If
        the product is a bestseller or a hero SKU, a slow restock can be a real opening,
        especially if you carry the same or a comparable item and can absorb the demand while
        the competitor is unavailable.
      </P>

      <H2>How to use restock timing as a signal</H2>

      <H3>Track resolution time, not just the stockout event</H3>

      <P>
        An out-of-stock alert by itself is half the picture. Pair it with tracking whether and
        when the same product returns to back_in_stock. The time between the two events is what
        tells you whether you are looking at scarcity marketing or a real gap.
      </P>

      <H3>A string of fast restocks on the same SKU is a marketing pattern</H3>

      <P>
        If a specific product cycles out of stock and back in within a day repeatedly, that is
        a deliberate pattern, not a coincidence. It is useful intelligence about how a
        competitor markets urgency, worth a note in a competitive teardown, but not a reason to
        change your own inventory or pricing.
      </P>

      <H3>A stockout that has not resolved in days may be worth acting on</H3>

      <P>
        A product that has been unavailable for several days, especially a bestseller, is the
        case where a real gap might exist. If you carry the same or a substitute product,
        that window is when a customer comparing options is most likely to buy from you
        instead.
      </P>

      <P>
        Beaconmon tracks out_of_stock and back_in_stock events as part of{' '}
        <A href="/competitor-stock-monitoring">stock change monitoring</A>, alongside price and
        promo tracking, so you see both halves of a restock cycle rather than a single
        disconnected alert. For a related look at how long competitor sales run before they
        end, see{' '}
        <A href="/blog/shopify-competitor-sales-last-24-hours">
          how long Shopify competitor sales actually last
        </A>
        . For a look at how fast new products show up in the first place, see{' '}
        <A href="/blog/track-competitor-new-product-launches-shopify">
          tracking competitor product launches on Shopify
        </A>
        . Full setup details for Shopify-specific monitoring are on the{' '}
        <A href="/shopify-competitor-monitoring">Shopify competitor monitoring</A> page, and
        plan details, including the free tier and the Starter plan at $29 per month, are on{' '}
        <A href="/pricing">pricing</A>.
      </P>

      <FAQ items={FAQS} />
    </BlogPostLayout>
  );
}

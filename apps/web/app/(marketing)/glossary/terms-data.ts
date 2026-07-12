export type TermLink = { href: string; label: string };

export type Term = {
  slug: string;
  name: string;
  definition: string;
  links?: TermLink[];
  relatedSlugs: string[];
};

export const GLOSSARY_URL = 'https://beaconmon.com/glossary';
export const TERM_SET_ID = `${GLOSSARY_URL}#glossary`;

export const TERMS: Term[] = [
  {
    slug: 'compare-at-price',
    name: 'Compare-at price',
    definition:
      'Compare-at price is the "was" price a Shopify store enters alongside the current selling price to display a product as discounted, for example a crossed-out $80 next to a $60 sale price. It is set manually by the merchant and is not validated against any real sale history. For a Shopify store owner, tracking whether a competitor keeps items permanently marked down at a compare-at price shows whether their "sale" is a real event or a standing pricing strategy.',
    links: [{ href: '/blog/shopify-permanent-sale-compare-at-price', label: 'How common permanent compare-at pricing is' }],
    relatedSlugs: ['price-change-noise', 'two-tribes-of-dtc-discounting', 'significance-scoring'],
  },
  {
    slug: 'price-change-noise',
    name: 'Price change noise',
    definition:
      'Price change noise is small, sub-1% price fluctuation caused by automated repricing tools, currency rounding, or bulk pricing rules, rather than a deliberate pricing decision. Most raw price-change data is dominated by this kind of noise, not meaningful moves. Filtering it out is what separates a real signal, like an actual price cut, from routine background activity that does not need a response.',
    links: [{ href: '/blog/shopify-competitor-price-change-noise', label: 'How much of competitor price data is noise' }],
    relatedSlugs: ['compare-at-price', 'catalog-wide-price-change', 'significance-scoring'],
  },
  {
    slug: 'catalog-wide-price-change',
    name: 'Catalog-wide price change',
    definition:
      'A catalog-wide price change is when many SKUs from the same store change price at the same time, typically 50 or more. It is almost always a sign of automation, a repricing app running a rule, or a sitewide sale going live, rather than a single human decision on one product. Spotting the pattern helps a Shopify store owner tell a targeted competitive move apart from a routine automated event.',
    links: [{ href: '/blog/shopify-price-changes-automated', label: 'How to spot automated catalog-wide changes' }],
    relatedSlugs: ['price-change-noise', 'significance-scoring', 'css-selector-monitoring'],
  },
  {
    slug: 'significance-scoring',
    name: 'Significance scoring',
    definition:
      "Significance scoring is an AI classification, low, medium, or high, applied to each detected competitor event to separate background activity from events worth a person's attention. Only a small share of events are typically flagged high-significance. This lets a Shopify store owner skip routine updates and focus on the handful of changes, like a real price cut on a bestseller, that actually call for a response. Available on the Growth plan and above.",
    links: [
      { href: '/blog/shopify-competitor-event-significance-data', label: 'How significance scoring splits real event data' },
      { href: '/features/intelligence', label: 'Weekly Competitor Report features' },
    ],
    relatedSlugs: ['price-change-noise', 'intelligence-digest', 'catalog-wide-price-change'],
  },
  {
    slug: 'intelligence-digest',
    name: 'Weekly Competitor Report',
    definition:
      "The Weekly Competitor Report is Beaconmon's scheduled Slack or email summary that groups every competitor change detected over a period into a plain-language digest, rather than a raw list of diffs. It is available on the Starter plan and above. Instead of checking a dashboard, a store owner or their team gets a readable roundup of what competitors did and when.",
    links: [{ href: '/features/intelligence', label: 'How the Weekly Competitor Report works' }],
    relatedSlugs: ['significance-scoring', 'content-monitoring-vs-uptime-monitoring'],
  },
  {
    slug: 'css-selector-monitoring',
    name: 'CSS-selector monitoring',
    definition:
      "CSS-selector monitoring means tracking one specific element on a competitor's page, a price, a stock badge, a promo banner, by its CSS selector, rather than comparing the entire page as an image. This is more precise than pixel-diffing because it targets the exact piece of content that matters and ignores everything else. For a Shopify store owner, this means an alert only fires when the price or promo actually changes, not when a blog timestamp or a navigation menu updates.",
    links: [{ href: '/website-change-detection', label: 'How CSS-selector change detection works' }],
    relatedSlugs: ['content-monitoring-vs-uptime-monitoring', 'data-tier', 'catalog-wide-price-change'],
  },
  {
    slug: 'content-monitoring-vs-uptime-monitoring',
    name: 'Content monitoring vs. uptime monitoring',
    definition:
      "Content monitoring watches for changes on a page you don't control, like a competitor's pricing page. Uptime monitoring watches whether a page you do control, like your own storefront, is up and responding. Both matter to a Shopify store owner: uptime monitoring protects your own revenue by catching outages, while content monitoring keeps you aware of what competitors are doing on pages you have no control over.",
    links: [
      { href: '/ecommerce-uptime-monitoring-guide', label: 'The uptime monitoring guide' },
      { href: '/shopify-competitor-monitoring', label: 'Shopify competitor monitoring' },
    ],
    relatedSlugs: ['css-selector-monitoring', 'domain-ssl-expiry-alert', 'intelligence-digest'],
  },
  {
    slug: 'data-tier',
    name: 'Data tier (full catalog, selected products, limited)',
    definition:
      "Data tier describes the depth at which Beaconmon can track a given competitor, ranging from full product-feed access down to a handful of manually specified product URLs. A competitor with a full catalog feed gets broader, more automatic coverage, while one tracked at a limited tier only reports changes on the specific pages a store owner has added. Which tier applies to a given competitor depends on what data that store's site exposes, not on the plan a customer is on.",
    relatedSlugs: ['css-selector-monitoring', 'product-churn', 'restock-speed'],
  },
  {
    slug: 'restock-speed',
    name: 'Restock speed / stockout resolution time',
    definition:
      'Restock speed, or stockout resolution time, is the time between a product going out of stock and coming back in stock. A fast restock, hours rather than days, often points to manufactured urgency rather than a genuine shortage, while a slow restock suggests a real supply constraint. Comparing restock speed across competitors helps a Shopify store owner tell which "low stock" messaging is a sales tactic and which reflects an actual inventory problem.',
    links: [{ href: '/blog/shopify-competitor-restock-speed-data', label: 'Median restock speed across tracked competitors' }],
    relatedSlugs: ['product-churn', 'data-tier', 'two-tribes-of-dtc-discounting'],
  },
  {
    slug: 'product-churn',
    name: 'Product churn (Shopify)',
    definition:
      "Product churn is when a new product listing appears in a competitor's catalog and then gets pulled again within a short window. It often signals a failed test launch rather than a permanent addition to the catalog. Tracking churn tells a Shopify store owner which of a competitor's new products are worth watching and which were pulled before they gained any traction.",
    links: [{ href: '/blog/shopify-competitor-product-churn', label: 'How often new Shopify listings churn' }],
    relatedSlugs: ['restock-speed', 'data-tier', 'catalog-wide-price-change'],
  },
  {
    slug: 'domain-ssl-expiry-alert',
    name: 'Domain / SSL expiry alert',
    definition:
      "A domain or SSL expiry alert is a warning fired when a monitored domain's SSL certificate or registration is approaching expiry, at 30, 14, and 7-day thresholds. It is distinct from an incident because it does not indicate current downtime, only a risk of downtime if the certificate or registration is not renewed in time. Catching this early gives a store owner time to renew before a browser starts warning visitors that the site is not secure.",
    links: [{ href: '/security', label: 'How Beaconmon handles security and monitoring data' }],
    relatedSlugs: ['content-monitoring-vs-uptime-monitoring', 'data-tier'],
  },
  {
    slug: 'two-tribes-of-dtc-discounting',
    name: 'The two tribes of DTC discounting',
    definition:
      "The two tribes of DTC discounting is Beaconmon's own term for a bimodal pattern in how direct-to-consumer brands discount: most brands cluster into one of two groups, those that almost never discount and those that almost always do, with comparatively few landing in the middle. Knowing which tribe a competitor belongs to tells a Shopify store owner what to expect from their pricing behavior, rather than reacting to each price change as a surprise.",
    links: [{ href: '/blog/shopify-dtc-two-tribes-discounting', label: 'The two tribes of DTC discounting, explained' }],
    relatedSlugs: ['compare-at-price', 'price-change-noise', 'significance-scoring'],
  },
];

export function getTerm(slug: string): Term | undefined {
  return TERMS.find((term) => term.slug === slug);
}

export function getRelatedTerms(term: Term): Term[] {
  return term.relatedSlugs
    .map((slug) => getTerm(slug))
    .filter((t): t is Term => Boolean(t));
}

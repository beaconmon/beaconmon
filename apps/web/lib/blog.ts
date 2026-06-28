export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: number;
};

export function createFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-monitor-competitor-prices-shopify',
    title: 'How to Monitor Competitor Prices on Shopify (2026 Guide)',
    description:
      'Every public Shopify store exposes its full product catalog at /products.json. Learn how to use that data to track competitor prices automatically, filter noise, and act on changes that matter.',
    publishedAt: '2026-06-10',
    tags: ['Competitor Monitoring'],
    readingTime: 8,
  },
  {
    slug: 'shopify-products-json-competitor-intelligence',
    title: "What Shopify's products.json Actually Tells You About a Competitor",
    description:
      'products.json is more than a price list. Every field in the feed is a signal about competitor strategy. Here is how to read each one and what it reveals about their pricing, positioning, and next moves.',
    publishedAt: '2026-06-13',
    tags: ['Competitor Monitoring'],
    readingTime: 10,
  },
  {
    slug: 'shopify-competitor-price-change-noise',
    title: "87% of Competitor Price Changes Are Noise. Here's the Filter That Matters.",
    description:
      'After analyzing price change events across hundreds of Shopify stores, we found that 87% are sub-1% moves that require no action. Here is how to configure your monitoring so you only hear about the changes that demand a response.',
    publishedAt: '2026-06-16',
    tags: ['Competitor Monitoring'],
    readingTime: 7,
  },
  {
    slug: 'ignore-match-counter-leapfrog-framework',
    title: 'Ignore, Match, Counter, or Leapfrog: How to Respond to a Competitor Price Drop',
    description:
      'A competitor just dropped their price. Most merchants panic and immediately cut. Here is the four-option framework Beaconmon uses to classify competitor moves, and how to decide which response actually protects your margin.',
    publishedAt: '2026-06-18',
    tags: ['Pricing Strategy'],
    readingTime: 9,
  },
  {
    slug: 'track-competitor-new-product-launches-shopify',
    title: "How to Track a Competitor's New Product Launches on Shopify",
    description:
      'Every Shopify store broadcasts new product launches in plain JSON. Learn how to read the published_at signal, catch launches within minutes, and turn competitor catalog moves into your advantage.',
    publishedAt: '2026-06-21',
    tags: ['Competitor Monitoring'],
    readingTime: 8,
  },
  {
    slug: 'monitor-competitor-homepage-without-va',
    title: "How to Monitor a Competitor's Homepage Without Hiring a VA",
    description:
      "A competitor's homepage is the single highest-signal page they publish. Here is how to automate monitoring it, what each change actually means, and how to turn homepage intelligence into decisions.",
    publishedAt: '2026-06-24',
    tags: ['Competitor Monitoring'],
    readingTime: 8,
  },
  {
    slug: 'coffee-brand-competitor-intelligence',
    title: 'Coffee Brand Competitor Intelligence: A Field Guide',
    description:
      'DTC coffee brands compete on subscription pricing, roast lineup depth, seasonal drops, and bundle tactics. Here is the intel stack that actually surfaces the moves that matter.',
    publishedAt: '2026-06-27',
    tags: ['Competitor Monitoring'],
    readingTime: 9,
  },
  {
    slug: 'inside-shopify-price-changes-data',
    title: 'Inside 468,000 Shopify Price Changes: What the Data Actually Shows',
    description:
      'We analyzed 468,451 price change events across 511 Shopify stores and 178,623 products. 91% are automated noise. Prices go up more than they go down. Here is what the data actually shows.',
    publishedAt: '2026-06-27',
    tags: ['Data & Research'],
    readingTime: 9,
  },
  {
    slug: 'dtc-coffee-brand-pricing-data',
    title: 'DTC Coffee Brand Pricing: What 5,400 Products Tell Us',
    description:
      'We tracked 5,412 coffee products across Shopify competitors. Coffee brands almost never formally discount -- but when they move prices, they move 4x bigger than any other DTC category.',
    publishedAt: '2026-06-28',
    tags: ['Data & Research'],
    readingTime: 8,
  },
  {
    slug: 'shopify-dtc-two-tribes-discounting',
    title: 'Two Tribes: 46% of DTC Brands Never Discount, 18% Never Stop',
    description:
      'Across 489 tracked Shopify competitors, two pricing philosophies dominate with almost no middle ground. The split has real implications for how you set your pricing and what your monitoring should watch for.',
    publishedAt: '2026-06-29',
    tags: ['Data & Research'],
    readingTime: 7,
  },
  {
    slug: 'shopify-competitor-sales-last-24-hours',
    title: 'Shopify Competitor Sales Last Less Than 24 Hours: What the Data Shows',
    description:
      'The median Shopify competitor sale lasts 0.7 days -- roughly 17 hours. If you are running a daily monitoring digest, most competitor flash sales are over before you read about them.',
    publishedAt: '2026-06-30',
    tags: ['Data & Research'],
    readingTime: 6,
  },
  {
    slug: 'shopify-price-changes-automated',
    title: '99% of Shopify Price Changes Are Automated, Not Decisions',
    description:
      '98.9% of all price-changed SKUs belong to catalog-wide moves of 50+ products on the same day. Before you respond to a competitor price alert, ask yourself: was this a decision?',
    publishedAt: '2026-07-01',
    tags: ['Data & Research'],
    readingTime: 7,
  },
  {
    slug: 'shopify-competitor-product-churn',
    title: 'One in 14 Shopify Product Launches Gets Pulled Within Weeks: The Data',
    description:
      'In 15 days of monitoring, 9,372 new products were added to competitor catalogs. 664 of them -- 7.1% -- were removed before the window closed. Here is what fast-kill patterns tell you about competitor strategy.',
    publishedAt: '2026-07-02',
    tags: ['Data & Research'],
    readingTime: 7,
  },
  {
    slug: 'shopify-competitor-price-increases-data',
    title: 'Competitor Price Increases Outnumber Cuts 55% to 45% on Shopify',
    description:
      'Most merchants configure competitor monitoring to catch price cuts. Our data across 468,451 events shows prices go up more than they go down -- and increases are just as important to catch.',
    publishedAt: '2026-07-03',
    tags: ['Data & Research'],
    readingTime: 6,
  },
  {
    slug: 'shopify-permanent-sale-compare-at-price',
    title: "23% of Shopify Products Are Permanently 'On Sale': What the Data Shows",
    description:
      "Across 178,623 tracked products, 23% have a compare_at_price set right now. For 18% of brands we track, more than a third of their catalog is permanently framed as discounted -- not a promotion, a strategy.",
    publishedAt: '2026-07-04',
    tags: ['Data & Research'],
    readingTime: 6,
  },
];

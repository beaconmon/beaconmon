export type CompetitorPresetId =
  | 'pricing'
  | 'features'
  | 'changelog'
  | 'terms'
  | 'product-price'
  | 'new-arrivals'
  | 'announcement-bar'
  | 'sale-collection';

export type CompetitorPresetVertical = 'saas' | 'ecommerce';

export interface CompetitorPreset {
  id: CompetitorPresetId;
  vertical: CompetitorPresetVertical;
  label: string;
  description: string;
  /** Specific selectors tried in order. A match here sets matched:true. */
  selectors: string[];
  /** Used as the tracking selector when no specific selector matched. Never triggers "detected". */
  fallbackSelector: string;
  /** Path suggestion shown to the user when picking a competitor URL for this preset. */
  suggestedPath?: string;
}

export const COMPETITOR_PRESETS: CompetitorPreset[] = [
  // ─── SaaS ──────────────────────────────────────────────────────────────────
  {
    id: 'pricing',
    vertical: 'saas',
    label: 'Pricing page',
    description: 'Track plan changes, price tiers, and discount badges.',
    selectors: ['.pricing', '[data-pricing]', 'table', '[class*="pricing"]', '[id*="pricing"]'],
    fallbackSelector: 'main',
    suggestedPath: '/pricing',
  },
  {
    id: 'features',
    vertical: 'saas',
    label: 'Features page',
    description: 'Watch for new features added or removed from the marketing site.',
    selectors: ['.features', '.feature-list', '[class*="features"]', '[id*="features"]'],
    fallbackSelector: 'main',
    suggestedPath: '/features',
  },
  {
    id: 'changelog',
    vertical: 'saas',
    label: 'Changelog / release notes',
    description: 'Get notified when a competitor publishes a new release.',
    selectors: ['.changelog', '[class*="changelog"]', '[id*="changelog"]', '[class*="release"]'],
    fallbackSelector: 'article',
    suggestedPath: '/changelog',
  },
  {
    id: 'terms',
    vertical: 'saas',
    label: 'Legal terms',
    description: 'Detect changes to terms of service, privacy, or data processing agreements.',
    selectors: [
      '.terms', '.tos', '.legal', '.privacy', '.policy',
      '[class*="terms-of"]', '[class*="privacy-policy"]', '[class*="legal-"]',
      '[id="terms"]', '[id="privacy"]', '[id="legal"]',
    ],
    fallbackSelector: 'body',
    suggestedPath: '/terms',
  },

  // ─── E-commerce (Shopify-flavored, works on most themes) ───────────────────
  {
    id: 'product-price',
    vertical: 'ecommerce',
    label: 'Product price',
    description: 'Catch price drops and discount badges on a hero product page.',
    selectors: [
      '.price__sale', '.price-item--sale',
      '.price__regular', '.price-item--regular',
      '.product-form__price', '.product__price',
      '[data-product-price]', '[data-price]',
      '[class*="price__"]', '[class*="ProductPrice"]',
      '.price',
    ],
    fallbackSelector: 'main',
    suggestedPath: '/products/<hero-sku>',
  },
  {
    id: 'new-arrivals',
    vertical: 'ecommerce',
    label: 'New arrivals / collection',
    description: 'Spot new product drops landing in a competitor collection.',
    selectors: [
      '.product-grid', '.collection-grid', '.collection-product-list',
      '[class*="product-grid"]', '[class*="collection__"]',
      '.grid--products', '[data-collection-products]',
    ],
    fallbackSelector: 'main',
    suggestedPath: '/collections/all',
  },
  {
    id: 'announcement-bar',
    vertical: 'ecommerce',
    label: 'Promo / announcement bar',
    description: 'Track sitewide promo banners (free shipping, codes, sitewide sale).',
    selectors: [
      '.announcement-bar', '.announcement', '.utility-bar',
      '.header__announcement', '.shopify-section--announcement-bar',
      '[class*="announcement"]', '[class*="AnnouncementBar"]',
      '[data-announcement-bar]',
    ],
    fallbackSelector: 'header',
    suggestedPath: '/',
  },
  {
    id: 'sale-collection',
    vertical: 'ecommerce',
    label: 'Sale page',
    description: 'Track which products land in a competitor sale collection.',
    selectors: [
      '.product-grid', '.collection-grid', '.collection-product-list',
      '[class*="collection__"]', '.grid--products',
    ],
    fallbackSelector: 'main',
    suggestedPath: '/collections/sale',
  },
];

/** Skincare / DTC-specific competitor URL seed list for the first GTM vertical. */
export interface SkincareCompetitorSeed {
  /** Slug used inside the prospect tag (lowercase, hyphenated). */
  slug: string;
  /** Display name shown in the picker. */
  name: string;
  /** Store homepage. */
  url: string;
  /** Preset IDs we recommend turning on by default for this brand. */
  recommendedPresets: CompetitorPresetId[];
}

export const SKINCARE_COMPETITOR_SEEDS: SkincareCompetitorSeed[] = [
  { slug: 'the-ordinary',     name: 'The Ordinary',     url: 'https://theordinary.com',     recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'cerave',           name: 'CeraVe',           url: 'https://www.cerave.com',      recommendedPresets: ['product-price', 'announcement-bar'] },
  { slug: 'paulas-choice',    name: "Paula's Choice",   url: 'https://www.paulaschoice.com', recommendedPresets: ['product-price', 'sale-collection', 'announcement-bar'] },
  { slug: 'glossier',         name: 'Glossier',         url: 'https://www.glossier.com',    recommendedPresets: ['new-arrivals', 'announcement-bar', 'product-price'] },
  { slug: 'drunk-elephant',   name: 'Drunk Elephant',   url: 'https://www.drunkelephant.com', recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'youth-to-the-people', name: 'Youth To The People', url: 'https://www.youthtothepeople.com', recommendedPresets: ['product-price', 'new-arrivals'] },
  { slug: 'krave-beauty',     name: 'Krave Beauty',     url: 'https://kravebeauty.com',     recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'inkey-list',       name: 'The Inkey List',   url: 'https://www.theinkeylist.com', recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'versed',           name: 'Versed',           url: 'https://versedskin.com',      recommendedPresets: ['product-price', 'new-arrivals', 'sale-collection'] },
  { slug: 'topicals',         name: 'Topicals',         url: 'https://mytopicals.com',      recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'bubble-skincare',  name: 'Bubble',           url: 'https://hellobubble.com',     recommendedPresets: ['product-price', 'new-arrivals', 'announcement-bar'] },
  { slug: 'naturium',         name: 'Naturium',         url: 'https://naturium.com',        recommendedPresets: ['product-price', 'sale-collection', 'announcement-bar'] },
];

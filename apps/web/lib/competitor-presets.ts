export interface CompetitorPreset {
  id: 'pricing' | 'features' | 'changelog' | 'terms';
  label: string;
  description: string;
  /** Specific selectors tried in order. A match here sets matched:true. */
  selectors: string[];
  /** Used as the tracking selector when no specific selector matched. Never triggers "detected". */
  fallbackSelector: string;
}

export const COMPETITOR_PRESETS: CompetitorPreset[] = [
  {
    id: 'pricing',
    label: 'Pricing page',
    description: 'Track plan changes, price tiers, and discount badges.',
    selectors: ['.pricing', '[data-pricing]', 'table', '[class*="pricing"]', '[id*="pricing"]'],
    fallbackSelector: 'main',
  },
  {
    id: 'features',
    label: 'Features page',
    description: 'Watch for new features added or removed from the marketing site.',
    selectors: ['.features', '.feature-list', '[class*="features"]', '[id*="features"]'],
    fallbackSelector: 'main',
  },
  {
    id: 'changelog',
    label: 'Changelog / release notes',
    description: 'Get notified when a competitor publishes a new release.',
    selectors: ['.changelog', '[class*="changelog"]', '[id*="changelog"]', '[class*="release"]'],
    fallbackSelector: 'article',
  },
  {
    id: 'terms',
    label: 'Legal terms',
    description: 'Detect changes to terms of service, privacy, or data processing agreements.',
    selectors: [
      '.terms', '.tos', '.legal', '.privacy', '.policy',
      '[class*="terms-of"]', '[class*="privacy-policy"]', '[class*="legal-"]',
      '[id="terms"]', '[id="privacy"]', '[id="legal"]',
    ],
    fallbackSelector: 'body',
  },
];

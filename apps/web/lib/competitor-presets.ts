export interface CompetitorPreset {
  id: 'pricing' | 'features' | 'changelog' | 'terms';
  label: string;
  description: string;
  selectors: string[];
}

export const COMPETITOR_PRESETS: CompetitorPreset[] = [
  {
    id: 'pricing',
    label: 'Pricing page',
    description: 'Track plan changes, price tiers, and discount badges.',
    selectors: ['.pricing', '[data-pricing]', 'table'],
  },
  {
    id: 'features',
    label: 'Features page',
    description: 'Watch for new features added or removed from the marketing site.',
    selectors: ['.features', '.feature-list', 'main'],
  },
  {
    id: 'changelog',
    label: 'Changelog / release notes',
    description: 'Get notified when a competitor publishes a new release.',
    selectors: ['.changelog', 'article', 'main'],
  },
  {
    id: 'terms',
    label: 'Legal terms',
    description: 'Detect changes to terms of service, privacy, or data processing agreements.',
    selectors: ['main', 'article', 'body'],
  },
];

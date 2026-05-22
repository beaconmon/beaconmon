import type { MetadataRoute } from 'next';

const BASE_URL = 'https://beaconmon.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Tier 1: Homepage ─────────────────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified: new Date('2026-05-10'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },

    // ── Tier 2: Core marketing ────────────────────────────────────────────
    {
      url: `${BASE_URL}/features`,
      lastModified: new Date('2026-05-10'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date('2026-05-10'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/integrations`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ── Tier 3: Solution pages ────────────────────────────────────────────
    {
      url: `${BASE_URL}/for/ecommerce`,
      lastModified: new Date('2026-05-21'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/for/shopify`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/for/woocommerce`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ── Tier 4: Comparison pages ──────────────────────────────────────────
    {
      url: `${BASE_URL}/vs`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/vs/uptimerobot`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vs/pingdom`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vs/better-uptime`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vs/statuscake`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ── Tier 4.5: SEO content pages ──────────────────────────────────────
    {
      url: `${BASE_URL}/shopify-competitor-monitoring`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/competitor-price-tracking`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing-change-alerts`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/ecommerce-website-monitoring`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/website-change-detection`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/homepage-monitoring`,
      lastModified: new Date('2026-05-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // ── Tier 5: Trust / informational ────────────────────────────────────
    {
      url: `${BASE_URL}/changelog`,
      lastModified: new Date('2026-05-01'),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/security`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },

    // ── Tier 6: Legal ─────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}

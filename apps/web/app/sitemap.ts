import type { MetadataRoute } from 'next';

const BASE_URL = 'https://beaconmon.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Tier 1: Homepage ─────────────────────────────────────────────────
    { url: `${BASE_URL}`, lastModified: new Date('2026-05-10') },

    // ── Tier 2: Core marketing ────────────────────────────────────────────
    { url: `${BASE_URL}/features`, lastModified: new Date('2026-05-10') },
    { url: `${BASE_URL}/pricing`, lastModified: new Date('2026-05-10') },
    { url: `${BASE_URL}/features/intelligence`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/integrations`, lastModified: new Date('2026-05-23') },

    // ── Tier 3: Solution pages ────────────────────────────────────────────
    { url: `${BASE_URL}/for/ecommerce`, lastModified: new Date('2026-05-21') },
    { url: `${BASE_URL}/for/shopify`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/for/woocommerce`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/for/dtc-brands`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/for/solo-founders`, lastModified: new Date('2026-05-23') },

    // ── Tier 4: Comparison pages ──────────────────────────────────────────
    { url: `${BASE_URL}/vs`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/vs/uptimerobot`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/vs/pingdom`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/vs/better-uptime`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/vs/statuscake`, lastModified: new Date('2026-05-23') },

    // ── Tier 4.5: SEO content pages ──────────────────────────────────────
    { url: `${BASE_URL}/shopify-competitor-monitoring`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/competitor-price-tracking`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/pricing-change-alerts`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/ecommerce-website-monitoring`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/website-change-detection`, lastModified: new Date('2026-05-23') },
    { url: `${BASE_URL}/homepage-monitoring`, lastModified: new Date('2026-05-23') },

    // ── Tier 5: Trust / informational ────────────────────────────────────
    { url: `${BASE_URL}/changelog`, lastModified: new Date('2026-05-24') },
    { url: `${BASE_URL}/about`, lastModified: new Date('2026-01-01') },
    { url: `${BASE_URL}/contact`, lastModified: new Date('2026-01-01') },
    { url: `${BASE_URL}/security`, lastModified: new Date('2026-01-01') },

    // ── Tier 6: Legal ─────────────────────────────────────────────────────
    { url: `${BASE_URL}/privacy`, lastModified: new Date('2026-01-01') },
    { url: `${BASE_URL}/terms`, lastModified: new Date('2026-01-01') },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date('2026-01-01') },
  ];
}

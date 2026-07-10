import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog';

const BASE_URL = 'https://beaconmon.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Tier 1: Homepage ─────────────────────────────────────────────────
    { url: `${BASE_URL}`, lastModified: new Date('2026-06-27'), changeFrequency: 'weekly', priority: 1.0 },

    // ── Tier 2: Core marketing ────────────────────────────────────────────
    { url: `${BASE_URL}/features`,              lastModified: new Date('2026-05-10'), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/pricing`,               lastModified: new Date('2026-05-10'), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/features/intelligence`, lastModified: new Date('2026-05-23'), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/integrations`,          lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.7 },

    // ── Tier 3: Solution pages ────────────────────────────────────────────
    { url: `${BASE_URL}/for/shopify`,         lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/for/woocommerce`,     lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/for/dtc-brands`,      lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/for/dtc-fashion`,     lastModified: new Date('2026-07-09'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/for/beauty-skincare`, lastModified: new Date('2026-07-09'), changeFrequency: 'monthly', priority: 0.6 },

    // ── Tier 4: Comparison pages ──────────────────────────────────────────
    { url: `${BASE_URL}/vs`,              lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/uptimerobot`,  lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/pingdom`,      lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/better-uptime`,lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/statuscake`,   lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/distill`,      lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/hexowatch`,    lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/prisync`,      lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/visualping`,   lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/intelis`,     lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/panoramata`,  lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/vs/rivalert`,    lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives`,             lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/betterstack`, lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/distill`,     lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/hexowatch`,   lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/intelis`,     lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/pagecrawl`,   lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/panoramata`,  lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/price2spy`,   lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/prisync`,     lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/rivalert`,    lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/uptimerobot`, lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/visualping`,  lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/alternatives/wachete`,     lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },

    // ── Tier 4.5: SEO content pages ──────────────────────────────────────
    { url: `${BASE_URL}/shopify-competitor-monitoring`,        lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/woocommerce-competitor-monitoring`,    lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/shopify-store-monitoring`,             lastModified: new Date('2026-07-10'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/woocommerce-store-monitoring`,         lastModified: new Date('2026-07-10'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/competitor-price-tracking`,            lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/competitor-collections-monitoring`,    lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/competitor-stock-monitoring`,          lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/competitor-promotion-monitoring`,      lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/competitor-product-launch-tracking`,   lastModified: new Date('2026-06-07'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/ecommerce-competitor-intelligence`,    lastModified: new Date('2026-05-30'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ecommerce-uptime-monitoring-guide`,    lastModified: new Date('2026-05-30'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/website-change-detection`,             lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/homepage-monitoring`,                  lastModified: new Date('2026-05-23'), changeFrequency: 'monthly', priority: 0.6 },

    // ── Tier 4.6: Free tools ─────────────────────────────────────────────
    { url: `${BASE_URL}/tools`,                                        lastModified: new Date('2026-06-29'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/shopify-competitor-snapshot`,            lastModified: new Date('2026-06-20'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/shopify-competitor-changes`,             lastModified: new Date('2026-06-20'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/shopify-uptime-test`,                    lastModified: new Date('2026-06-27'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/woocommerce-uptime-test`,                lastModified: new Date('2026-06-27'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/bfcm-readiness`,                         lastModified: new Date('2026-06-27'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/downtime-detection-calculator`,          lastModified: new Date('2026-06-27'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/competitor-intelligence-report`,         lastModified: new Date('2026-06-29'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/tools/competitor-intelligence-roi`,            lastModified: new Date('2026-06-29'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/monitoring-coverage`,                    lastModified: new Date('2026-06-29'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/ssl-checker`,                            lastModified: new Date('2026-06-29'), changeFrequency: 'monthly', priority: 0.6 },

    // ── Tier 4.7: Blog (derived from BLOG_POSTS) ─────────────────────────
    { url: `${BASE_URL}/blog`, lastModified: new Date('2026-06-27'), changeFrequency: 'weekly', priority: 0.7 },
    ...BLOG_POSTS.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Tier 5: Trust / informational ────────────────────────────────────
    { url: `${BASE_URL}/changelog`, lastModified: new Date('2026-06-27'), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE_URL}/about`,     lastModified: new Date('2026-06-07'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/contact`,   lastModified: new Date('2026-05-30'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/security`,  lastModified: new Date('2026-06-07'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/research`,  lastModified: new Date('2026-07-09'), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date('2026-07-09'), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/glossary`,  lastModified: new Date('2026-07-09'), changeFrequency: 'monthly', priority: 0.5 },

    // ── Tier 6: Legal ─────────────────────────────────────────────────────
    { url: `${BASE_URL}/privacy`,       lastModified: new Date('2026-06-22'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date('2026-05-30'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date('2026-05-24'), changeFrequency: 'yearly', priority: 0.3 },
  ];
}

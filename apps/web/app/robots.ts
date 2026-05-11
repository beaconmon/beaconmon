import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Block all crawlers from auth, dashboard, API, and status sub-routes
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/reset-password',
          '/verify',
          '/overview',
          '/monitors',
          '/incidents',
          '/alert-channels',
          '/escalation-policies',
          '/maintenance-windows',
          '/status-pages',
          '/reports',
          '/settings',
          '/invite/',
          '/s/',
        ],
      },
    ],
    sitemap: 'https://beaconmon.com/sitemap.xml',
  };
}

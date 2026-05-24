import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'GPTBot',
        allow: ['/'],
        disallow: ['/api/', '/sign-in', '/sign-up', '/overview', '/monitors', '/settings'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/'],
        disallow: ['/api/', '/sign-in', '/sign-up', '/overview', '/monitors', '/settings'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/'],
        disallow: ['/api/', '/sign-in', '/sign-up', '/overview', '/monitors', '/settings'],
      },
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/og',
        ],
        disallow: [
          '/api/',
          '/ingest/',
          '/onboarding',
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

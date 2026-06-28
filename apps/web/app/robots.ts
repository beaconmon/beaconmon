import type { MetadataRoute } from 'next';

const APP_ROUTES = [
  '/api/',
  '/ingest/',
  '/onboarding',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/today',
  '/wire',
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
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot'],
        allow: ['/'],
        disallow: APP_ROUTES,
      },
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: APP_ROUTES,
      },
    ],
    sitemap: 'https://beaconmon.com/sitemap.xml',
  };
}

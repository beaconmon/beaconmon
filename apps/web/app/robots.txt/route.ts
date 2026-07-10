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

const RSL_LICENSE_URL = 'https://beaconmon.com/rsl.xml';

// Custom route (rather than a robots.ts metadata file) because the RSL
// License directive isn't part of Next's typed MetadataRoute.Robots output.
export async function GET() {
  const disallow = APP_ROUTES.map((route) => `Disallow: ${route}`).join('\n');

  const body = `License: ${RSL_LICENSE_URL}

User-Agent: GPTBot
User-Agent: ClaudeBot
User-Agent: PerplexityBot
User-Agent: OAI-SearchBot
Allow: /
${disallow}

User-Agent: *
Allow: /
Allow: /api/og
${disallow}

Sitemap: https://beaconmon.com/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

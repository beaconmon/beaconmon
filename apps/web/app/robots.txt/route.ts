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

export async function GET() {
  const disallow = APP_ROUTES.map((route) => `Disallow: ${route}`).join('\n');

  const body = `User-Agent: GPTBot
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

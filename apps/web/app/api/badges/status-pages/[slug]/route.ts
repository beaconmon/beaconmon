import { z } from 'zod';
import { getStatusPageData } from '@/lib/cache/status-pages';
import { logger } from '@/lib/logger';
import type { StatusPageOverallStatus } from '@beaconmon/types';

const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(3).max(50);

const STATUS_CONFIG: Record<StatusPageOverallStatus, { color: string; text: string }> = {
  operational: { color: '#16a34a', text: 'operational' },
  degraded:    { color: '#d97706', text: 'degraded' },
  outage:      { color: '#dc2626', text: 'outage' },
};

const UNKNOWN_CONFIG = { color: '#6b7280', text: 'unknown' };

function buildSvg(status: StatusPageOverallStatus | 'unknown'): string {
  const { color, text } = status === 'unknown' ? UNKNOWN_CONFIG : STATUS_CONFIG[status];

  // Shields.io flat-style pill: grey left ("status"), colored right (status text)
  // Approximate character widths: label width ~42px, value width scales with text length
  const labelWidth = 46;
  const valueWidth = Math.max(text.length * 7 + 10, 56);
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="status: ${text}">
  <title>status: ${text}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text aria-hidden="true" x="${Math.round(labelWidth / 2 + 1) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}" lengthAdjust="spacing">status</text>
    <text x="${Math.round(labelWidth / 2 + 1) * 10}" y="140" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}" lengthAdjust="spacing">status</text>
    <text aria-hidden="true" x="${(labelWidth + Math.round(valueWidth / 2)) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}" lengthAdjust="spacing">${text}</text>
    <text x="${(labelWidth + Math.round(valueWidth / 2)) * 10}" y="140" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}" lengthAdjust="spacing">${text}</text>
  </g>
</svg>`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return new Response('Not found', { status: 404 });
  }

  let overallStatus: StatusPageOverallStatus | 'unknown' = 'unknown';

  try {
    const data = await getStatusPageData(parsed.data);
    if (!data) {
      return new Response('Not found', { status: 404 });
    }
    overallStatus = data.overallStatus;
  } catch (err) {
    logger.error({ service: 'api', slug: parsed.data, err }, 'Failed to fetch status page data for badge');
    // Redis / DB failure — return unknown badge rather than 500
  }

  return new Response(buildSvg(overallStatus), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    },
  });
}

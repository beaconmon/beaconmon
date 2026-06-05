import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { toCsv, CSV_ROW_LIMIT } from '@/lib/csv/encode';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

const VALID_TYPES = new Set([
  'price_changed',
  'product_added',
  'product_removed',
  'stock_changed',
  'out_of_stock',
  'back_in_stock',
  'sale_started',
  'sale_ended',
  'site_changed',
  'promo_detected',
]);

const COLUMNS = [
  { key: 'detected_at', header: 'detected_at' },
  { key: 'type', header: 'type' },
  { key: 'competitor', header: 'competitor' },
  { key: 'product_name', header: 'product_name' },
  { key: 'payload_summary', header: 'payload_summary' },
];

function payloadSummary(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'price_changed':
      return `${payload.oldPrice} -> ${payload.newPrice}`;
    case 'product_added':
      return `New: ${payload.title}`;
    case 'product_removed':
      return `Removed: ${payload.title}`;
    case 'stock_changed':
      return payload.newAvailable ? 'Back in stock' : 'Out of stock';
    case 'out_of_stock':
      return `Out of stock: ${payload.productHandle ?? ''}`;
    case 'back_in_stock':
      return `Back in stock: ${payload.productHandle ?? ''}`;
    case 'sale_started':
      return `Sale: ${payload.currentPrice} (was ${payload.compareAtPrice})`;
    case 'sale_ended':
      return `Sale ended (was ${payload.wasCompareAtPrice})`;
    case 'site_changed':
    case 'promo_detected':
      return (payload.diffSummary as string | undefined) ?? 'Content changed';
    default:
      return '';
  }
}

export const GET = withAuth<Params>(async (req, { teamId }, params) => {
  const url = new URL(req.url);

  const rawDays = url.searchParams.get('days') ?? '30';
  const days = parseInt(rawDays, 10);
  if (isNaN(days) || days < 1 || days > 90) {
    throw new ValidationError('days must be between 1 and 90');
  }

  const rawTypes = url.searchParams.get('types');
  let types: string[] | undefined;
  if (rawTypes) {
    const requested = rawTypes.split(',').map((t) => t.trim()).filter(Boolean);
    const invalid = requested.filter((t) => !VALID_TYPES.has(t));
    if (invalid.length > 0) {
      throw new ValidationError(`Unknown event types: ${invalid.join(', ')}`);
    }
    types = requested;
  }

  const competitor = await competitorRepository.findById(teamId, params.id);
  if (!competitor) throw new NotFoundError();

  const events = await competitorRepository.findEventsForExport(teamId, params.id, {
    days,
    types,
  });

  if (events.length > CSV_ROW_LIMIT) {
    return Response.json(
      { error: `Export exceeds ${CSV_ROW_LIMIT.toLocaleString()} row limit. Reduce the date range.` },
      { status: 422 }
    );
  }

  const rows = events.map((e) => ({
    detected_at: e.detectedAt.toISOString(),
    type: e.type,
    competitor: competitor.name,
    product_name: e.productTitle ?? '',
    payload_summary: payloadSummary(e.type, (e.payload as Record<string, unknown>) ?? {}),
  }));

  const csv = toCsv(rows as Record<string, unknown>[], COLUMNS);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${competitor.domain}-events-${days}d.csv"`,
    },
  });
});

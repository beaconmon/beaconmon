import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { toCsv, CSV_ROW_LIMIT } from '@/lib/csv/encode';
import { NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

const COLUMNS = [
  { key: 'product_name', header: 'product_name' },
  { key: 'product_url', header: 'product_url' },
  { key: 'competitor', header: 'competitor' },
  { key: 'current_price', header: 'current_price' },
  { key: 'last_known_price', header: 'last_known_price' },
  { key: 'change_delta', header: 'change_delta' },
  { key: 'last_checked', header: 'last_checked' },
  { key: 'in_stock', header: 'in_stock' },
];

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const competitor = await competitorRepository.findById(teamId, params.id);
  if (!competitor) throw new NotFoundError();

  const [products, priceMap] = await Promise.all([
    competitorRepository.findProducts(teamId, params.id),
    competitorRepository.findLatestPriceEventsByProduct(teamId, params.id),
  ]);

  if (products.length > CSV_ROW_LIMIT) {
    return Response.json(
      { error: `Export exceeds ${CSV_ROW_LIMIT.toLocaleString()} row limit` },
      { status: 422 }
    );
  }

  const rows = products.map((p) => {
    const currentNum = p.currentPrice != null ? parseFloat(String(p.currentPrice)) : null;
    const oldPrice = priceMap.get(p.id) ?? null;
    const oldNum = oldPrice != null ? parseFloat(String(oldPrice)) : null;
    const delta =
      currentNum != null && oldNum != null ? (currentNum - oldNum).toFixed(2) : '';

    return {
      product_name: p.title,
      product_url: p.sourceUrl ?? `https://${competitor.domain}/products/${p.handle}`,
      competitor: competitor.name,
      current_price: p.currentPrice != null ? String(p.currentPrice) : '',
      last_known_price: oldPrice != null ? String(oldPrice) : '',
      change_delta: delta,
      last_checked: p.lastSeenAt.toISOString(),
      in_stock: p.isAvailable ? 'yes' : 'no',
    };
  });

  const csv = toCsv(rows as Record<string, unknown>[], COLUMNS);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${competitor.domain}-products.csv"`,
    },
  });
});

#!/usr/bin/env tsx
/**
 * Deactivate the 5 fix_url brands whose homepage URLs were wrong (HTTP 404,
 * bucket=other in the classifier) and are not worth re-deriving. PRODUCTION WRITE.
 *
 * Bounded and reversible. Hardcodes the 5 page IDs from _remediation_plan.json
 * (action=fix_url). Before any write, records the before-state to
 * scripts/_applied_deactivations_fix_url.json.
 *
 * Revert:
 *   UPDATE competitor_pages SET is_active = true
 *    WHERE id IN (<pageIds from _applied_deactivations_fix_url.json>);
 *
 * Environment:
 *   DATABASE_URL  required, direct (prod via SSH tunnel on localhost)
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/deactivate-fix-url-brands.ts
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVERT_PATH = join(__dirname, '_applied_deactivations_fix_url.json');

const FIX_URL_BRANDS = [
  { domain: 'backbeat.co',        competitorId: 'cmqck3xjbtnw3xkt2qo11ukm4', pageId: 'cmqck3xjbjnvmk4h7exd159kp' },
  { domain: 'freesoul.co.uk',     competitorId: 'cmqcjuok5jeskmkmgq7koush4', pageId: 'cmqcjuok54914kmr7bx7nitvo' },
  { domain: 'mightygum.com',      competitorId: 'cmqcjvgebr4m9xf89qxwghmgw', pageId: 'cmqcjvgeb8gu1mstvwht2gu72' },
  { domain: 'oliversapparel.com', competitorId: 'cmqck4myl9sbk6lhwfcjb98c9', pageId: 'cmqck4myl2x0yt2f7i2xh3f70' },
  { domain: 'tobecalm.com.au',    competitorId: 'cmqck0skbbnxyi89ljudm3i0g', pageId: 'cmqck0skbtr2szp84lkutcf0d' },
] as const;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }), log: [] });

async function main(): Promise<void> {
  const pageIds = FIX_URL_BRANDS.map((b) => b.pageId);

  const rows = await prisma.competitorPage.findMany({
    where: { id: { in: pageIds } },
    select: { id: true, isActive: true, consecutiveFailures: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const revert = FIX_URL_BRANDS.map((b) => {
    const row = byId.get(b.pageId);
    return {
      pageId: b.pageId,
      competitorId: b.competitorId,
      domain: b.domain,
      was_is_active: row?.isActive ?? false,
      consecutive_failures: row?.consecutiveFailures ?? 0,
    };
  });

  writeFileSync(REVERT_PATH, JSON.stringify(revert, null, 2) + '\n', 'utf8');
  console.log(`Revert record written: ${REVERT_PATH}`);

  const toDeactivate = revert.filter((r) => r.was_is_active).map((r) => r.pageId);
  const alreadyInactive = revert.filter((r) => !r.was_is_active);

  let changed = 0;
  if (toDeactivate.length > 0) {
    const result = await prisma.competitorPage.updateMany({
      where: { id: { in: toDeactivate }, isActive: true },
      data: { isActive: false },
    });
    changed = result.count;
  }

  console.log('\nSummary');
  console.log('-------');
  console.log(`Targeted:         ${FIX_URL_BRANDS.length}`);
  console.log(`Already inactive: ${alreadyInactive.length}`);
  console.log(`Set to inactive:  ${changed}`);
  console.log('');
  for (const r of revert) {
    const status = r.was_is_active ? 'deactivated' : 'already-inactive';
    console.log(`  ${r.domain.padEnd(26)} ${status}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

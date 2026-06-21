import { PrismaClient } from '../packages/db/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }) });
const TEAM = 'cmqanmrxy000007ofptlnmx07';
const q = (sql: string) => prisma.$queryRawUnsafe(sql) as Promise<any[]>;
const n = (v: any) => Number(v);

async function main() {
  // 1. full_catalog cohort sync state
  const tier = await q(`SELECT data_tier, discovery_state, COUNT(*)::int c
    FROM competitors WHERE team_id='${TEAM}' AND is_active AND deleted_at IS NULL
    GROUP BY data_tier, discovery_state ORDER BY data_tier, c DESC`);
  console.log('=== data_tier x discovery_state (active competitors) ===');
  for (const r of tier) console.log(`  ${r.data_tier.padEnd(18)} ${r.discovery_state.padEnd(16)} ${n(r.c)}`);

  // 2. products synced for full_catalog cohort
  const prod = await q(`SELECT COUNT(DISTINCT c.id)::int comps_with_products, COUNT(p.id)::int total_products
    FROM competitors c JOIN competitor_products p ON p.competitor_id=c.id
    WHERE c.team_id='${TEAM}' AND c.data_tier='full_catalog' AND c.is_active AND c.deleted_at IS NULL`);
  console.log('\n=== full_catalog products ===');
  console.log(`  competitors with >=1 product: ${n(prod[0].comps_with_products)}`);
  console.log(`  total products tracked:       ${n(prod[0].total_products)}`);

  // sync recency
  const rec = await q(`SELECT
      COUNT(*) FILTER (WHERE discovery_synced_at >= now()-interval '24 hours')::int synced_24h,
      COUNT(*) FILTER (WHERE discovery_synced_at >= now()-interval '2 hours')::int synced_2h,
      COUNT(*) FILTER (WHERE discovery_error IS NOT NULL)::int with_error
    FROM competitors WHERE team_id='${TEAM}' AND data_tier='full_catalog' AND is_active AND deleted_at IS NULL`);
  console.log(`  synced in last 24h:           ${n(rec[0].synced_24h)}`);
  console.log(`  synced in last 2h:            ${n(rec[0].synced_2h)}`);
  console.log(`  with discovery_error:         ${n(rec[0].with_error)}`);

  // 3. events in last 24h
  const e24 = await q(`SELECT COUNT(*)::int total, COUNT(DISTINCT competitor_id)::int comps
    FROM competitor_events WHERE team_id='${TEAM}' AND detected_at >= now()-interval '24 hours'`);
  console.log(`\n=== events last 24h ===`);
  console.log(`  total events: ${n(e24[0].total)}   distinct competitors: ${n(e24[0].comps)}`);
  const t24 = await q(`SELECT type, COUNT(*)::int c FROM competitor_events
    WHERE team_id='${TEAM}' AND detected_at >= now()-interval '24 hours' GROUP BY type ORDER BY c DESC`);
  for (const r of t24) console.log(`    ${r.type.padEnd(18)} ${n(r.c)}`);

  // 4. STORM detection: top competitors by 24h events, with product count + ratio
  const storm = await q(`
    SELECT c.id, c.name, c.data_tier,
           (SELECT COUNT(*) FROM competitor_events e WHERE e.competitor_id=c.id AND e.detected_at>=now()-interval '24 hours')::int ev24,
           (SELECT COUNT(*) FROM competitor_products p WHERE p.competitor_id=c.id)::int prods
    FROM competitors c WHERE c.team_id='${TEAM}' AND c.is_active AND c.deleted_at IS NULL
    ORDER BY ev24 DESC LIMIT 20`);
  console.log(`\n=== top 20 competitors by events in last 24h (storm watch) ===`);
  console.log(`  ${'name'.padEnd(34)} ${'ev24'.padEnd(7)} ${'prods'.padEnd(7)} ev/prod`);
  for (const r of storm) {
    const ratio = n(r.prods) > 0 ? (n(r.ev24)/n(r.prods)).toFixed(2) : 'n/a';
    const flag = (n(r.prods)>0 && n(r.ev24)/n(r.prods) > 0.8) ? '  <-- STORM?' : '';
    console.log(`  ${(r.name||r.id).slice(0,33).padEnd(34)} ${String(n(r.ev24)).padEnd(7)} ${String(n(r.prods)).padEnd(7)} ${String(ratio).padEnd(7)}${flag}`);
  }
}
main().catch(e=>{console.error('FAIL:',e.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());

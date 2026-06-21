#!/usr/bin/env tsx
/**
 * Freemius webhook E2E test
 *
 * Fires signed webhook payloads at a running web server and verifies the DB
 * state changes correctly after each event.
 *
 * Modes:
 *   Full mode  — DATABASE_URL is set and reachable. Creates a throwaway team,
 *                verifies DB state after every HTTP call, cleans up.
 *   HTTP-only  — DATABASE_URL not set or DB unreachable. Tests only HTTP
 *                response codes and dedup behavior.
 *
 * What it covers:
 *   1. Bad signature          -> 400
 *   2. subscription.created   -> HTTP 200, team.plan = growth (full mode)
 *   3. Duplicate event id     -> 200 silently deduped
 *   4. subscription.updated   -> HTTP 200, plan = starter (full mode)
 *   5. payment.failed         -> HTTP 200, status = past_due (full mode)
 *   6. subscription.canceled  -> HTTP 200, plan = free (full mode)
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   FREEMIUS_WEBHOOK_SECRET=<secret> \
 *   FREEMIUS_GROWTH_PLAN_ID=<id> \
 *   FREEMIUS_STARTER_PLAN_ID=<id> \
 *   DATABASE_URL=<direct-postgres-url> \   # optional but recommended
 *   tsx scripts/test-freemius-e2e.ts
 *
 * Quick one-liner (sources matching keys from apps/web/.env.local):
 *   source <(grep -E '^(FREEMIUS_WEBHOOK_SECRET|FREEMIUS_GROWTH_PLAN_ID|FREEMIUS_STARTER_PLAN_ID|DATABASE_URL)=' apps/web/.env.local) && \
 *   BASE_URL=http://localhost:3000 pnpm test:freemius
 *
 * Exits 0 on all pass, 1 on any failure.
 */

import crypto from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const WEBHOOK_SECRET = process.env['FREEMIUS_WEBHOOK_SECRET'];
const GROWTH_PLAN_ID = process.env['FREEMIUS_GROWTH_PLAN_ID'] ?? '200';
const STARTER_PLAN_ID = process.env['FREEMIUS_STARTER_PLAN_ID'] ?? '100';
const DATABASE_URL = process.env['DATABASE_URL'];

if (!WEBHOOK_SECRET) {
  console.error('ERROR: FREEMIUS_WEBHOOK_SECRET is required');
  process.exit(1);
}

// ─── DB (optional) ────────────────────────────────────────────────────────────

type PrismaLike = {
  team: {
    create(args: { data: { name: string; plan: string } }): Promise<{ id: string }>;
    findUnique(args: { where: { id: string }; select: { plan: true } }): Promise<{ plan: string } | null>;
    deleteMany(args: { where: { id: string } }): Promise<unknown>;
  };
  subscription: {
    findUnique(args: { where: { teamId: string }; select: { plan: true; status: true; freemiusUserId: true } }): Promise<{ plan: string; status: string; freemiusUserId: string | null } | null>;
    deleteMany(args: { where: { teamId: string } }): Promise<unknown>;
  };
  processedWebhookEvent: {
    deleteMany(args: { where: { id: { startsWith: string } } }): Promise<unknown>;
  };
  $disconnect(): Promise<void>;
};

let db: PrismaLike | null = null;
let dbAvailable = false;

async function initDb(): Promise<void> {
  if (!DATABASE_URL) {
    console.log('  DATABASE_URL not set — running in HTTP-only mode (no DB assertions)\n');
    return;
  }
  try {
    const { prisma: client } = await import('../packages/db/src/index.js');
    await client.$queryRaw`SELECT 1`;
    db = client as unknown as PrismaLike;
    dbAvailable = true;
    console.log('  DB connected — running in full mode\n');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  DB unreachable (${msg.split('\n')[0]}) — running in HTTP-only mode\n`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sign(body: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET!).update(body, 'utf8').digest('hex');
}

async function postWebhook(
  payload: object,
  opts: { badSig?: boolean } = {}
): Promise<{ status: number; body: unknown }> {
  const raw = JSON.stringify(payload);
  const sig = opts.badSig ? 'deadbeef'.repeat(8) : sign(raw);
  const res = await fetch(`${BASE_URL}/api/webhooks/freemius`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Signature': sig },
    body: raw,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

let passed = 0;
let failed = 0;
let skipped = 0;

function ok(label: string, detail?: string) {
  passed++;
  console.log(`  PASS  ${label}${detail ? `  (${detail})` : ''}`);
}

function fail(label: string, detail: string) {
  failed++;
  console.log(`  FAIL  ${label}  — ${detail}`);
}

function skip(label: string, reason: string) {
  skipped++;
  console.log(`  SKIP  ${label}  — ${reason}`);
}

function assert(label: string, condition: boolean, detail: string) {
  condition ? ok(label, detail) : fail(label, detail);
}

function assertDb(label: string, condition: boolean, detail: string) {
  if (!dbAvailable) {
    skip(label, 'no DB connection');
    return;
  }
  assert(label, condition, detail);
}

// ─── Test data ────────────────────────────────────────────────────────────────

const FREEMIUS_USER_ID = `e2e-user-${Date.now()}`;
const FREEMIUS_SUB_ID = `e2e-sub-${Date.now()}`;

let teamId: string | null = null;

async function setupTeam(): Promise<void> {
  if (!db) return;
  const team = await db.team.create({ data: { name: '_freemius-e2e-team_', plan: 'free' } });
  teamId = team.id;
  console.log(`  Test team: ${teamId}\n`);
}

async function getSubscription() {
  if (!db || !teamId) return null;
  return db.subscription.findUnique({
    where: { teamId },
    select: { plan: true, status: true, freemiusUserId: true },
  });
}

async function getTeamPlan(): Promise<string | null> {
  if (!db || !teamId) return null;
  const t = await db.team.findUnique({ where: { id: teamId }, select: { plan: true } });
  return t?.plan ?? null;
}

async function cleanup(): Promise<void> {
  if (!db || !teamId) {
    await db?.$disconnect().catch(() => {});
    return;
  }
  await db.processedWebhookEvent.deleteMany({ where: { id: { startsWith: 'e2e-' } } }).catch(() => {});
  await db.subscription.deleteMany({ where: { teamId } }).catch(() => {});
  await db.team.deleteMany({ where: { id: teamId } }).catch(() => {});
  await db.$disconnect().catch(() => {});
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<boolean> {
  console.log(`\nFreemius webhook E2E  ->  ${BASE_URL}\n`);

  // Server check
  process.stdout.write('  Checking server... ');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    // Any HTTP response means the process is up. 503 = DB/Redis unhealthy but
    // the route handler is reachable.
    console.log(`OK (HTTP ${res.status})`);
    if (res.status === 503) {
      console.log('  Note: server health is degraded (503). Webhook tests may return 500 if DB is down.\n');
    } else {
      console.log();
    }
  } catch (err) {
    console.log('FAIL');
    console.error(`  Cannot reach ${BASE_URL} — is the server running?\n  ${err}\n`);
    process.exit(1);
  }

  await initDb();
  await setupTeam();

  // ── Test 1: Bad signature ─────────────────────────────────────────────────
  console.log('[1] Bad signature');
  {
    const { status } = await postWebhook(
      { id: 'e2e-bad', type: 'subscription.created', data: {} },
      { badSig: true }
    );
    assert('rejects bad signature', status === 400, `HTTP ${status}`);
  }

  // ── Test 2: subscription.created via user_dictionary ─────────────────────
  console.log('\n[2] subscription.created (user_dictionary path)');
  {
    const { status } = await postWebhook({
      id: 'e2e-evt-1',
      type: 'subscription.created',
      data: {
        id: FREEMIUS_SUB_ID,
        user_id: FREEMIUS_USER_ID,
        plan_id: GROWTH_PLAN_ID,
        billing_cycle: 1,
        next_payment: '2027-06-18T00:00:00Z',
        user: { id: FREEMIUS_USER_ID, email: 'e2e-test@example.com' },
        user_dictionary: { teamId: teamId ?? 'no-team-http-only' },
      },
    });
    assert('HTTP 200', status === 200, `HTTP ${status}`);

    const sub = await getSubscription();
    assertDb('subscription row created', sub !== null, sub ? 'found' : 'missing');
    assertDb('plan = growth', sub?.plan === 'growth', `plan=${sub?.plan}`);
    assertDb('status = active', sub?.status === 'active', `status=${sub?.status}`);
    assertDb('freemiusUserId stored', sub?.freemiusUserId === FREEMIUS_USER_ID, `got ${sub?.freemiusUserId}`);
    assertDb('team.plan = growth', (await getTeamPlan()) === 'growth', `team.plan=${await getTeamPlan()}`);
  }

  // ── Test 3: Duplicate event ───────────────────────────────────────────────
  console.log('\n[3] Duplicate event (same id)');
  {
    const { status, body } = await postWebhook({
      id: 'e2e-evt-1',
      type: 'subscription.created',
      data: {
        id: FREEMIUS_SUB_ID,
        user_id: FREEMIUS_USER_ID,
        plan_id: GROWTH_PLAN_ID,
        billing_cycle: 1,
        next_payment: null,
        user_dictionary: { teamId: teamId ?? 'no-team-http-only' },
      },
    });
    assert('HTTP 200 (not rejected)', status === 200, `HTTP ${status}`);
    const b = body as Record<string, unknown>;
    assert('received:true in response', b?.['received'] === true, JSON.stringify(body));
  }

  // ── Test 4: subscription.updated ─────────────────────────────────────────
  console.log('\n[4] subscription.updated (growth -> starter)');
  {
    const { status } = await postWebhook({
      id: 'e2e-evt-2',
      type: 'subscription.updated',
      data: {
        id: FREEMIUS_SUB_ID,
        user_id: FREEMIUS_USER_ID,
        plan_id: STARTER_PLAN_ID,
        billing_cycle: 12,
        next_payment: '2027-06-18T00:00:00Z',
      },
    });
    assert('HTTP 200', status === 200, `HTTP ${status}`);

    const sub = await getSubscription();
    assertDb('plan = starter', sub?.plan === 'starter', `plan=${sub?.plan}`);
    assertDb('status = active', sub?.status === 'active', `status=${sub?.status}`);
    assertDb('team.plan = starter', (await getTeamPlan()) === 'starter', `team.plan=${await getTeamPlan()}`);
  }

  // ── Test 5: payment.failed ────────────────────────────────────────────────
  console.log('\n[5] payment.failed');
  {
    const { status } = await postWebhook({
      id: 'e2e-evt-3',
      type: 'payment.failed',
      data: {
        id: FREEMIUS_SUB_ID,
        user_id: FREEMIUS_USER_ID,
        plan_id: STARTER_PLAN_ID,
        billing_cycle: 12,
        next_payment: null,
      },
    });
    assert('HTTP 200', status === 200, `HTTP ${status}`);

    const sub = await getSubscription();
    assertDb('status = past_due', sub?.status === 'past_due', `status=${sub?.status}`);
  }

  // ── Test 6: subscription.canceled ────────────────────────────────────────
  console.log('\n[6] subscription.canceled');
  {
    const { status } = await postWebhook({
      id: 'e2e-evt-4',
      type: 'subscription.canceled',
      data: { id: FREEMIUS_SUB_ID, user_id: FREEMIUS_USER_ID },
    });
    assert('HTTP 200', status === 200, `HTTP ${status}`);

    const sub = await getSubscription();
    assertDb('status = canceled', sub?.status === 'canceled', `status=${sub?.status}`);
    assertDb('plan = free', sub?.plan === 'free', `plan=${sub?.plan}`);
    assertDb('team.plan = free', (await getTeamPlan()) === 'free', `team.plan=${await getTeamPlan()}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed + skipped;
  console.log(`\n${'─'.repeat(40)}`);
  const skipNote = skipped > 0 ? `, ${skipped} skipped (no DB)` : '';
  if (failed === 0) {
    console.log(`\n  All ${passed}/${total} checks passed${skipNote}\n`);
  } else {
    console.log(`\n  ${passed}/${total} passed, ${failed} failed${skipNote}\n`);
  }

  return failed === 0;
}

main()
  .then(async (ok) => {
    await cleanup();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('\nUnhandled error:', err);
    await cleanup();
    process.exit(1);
  });

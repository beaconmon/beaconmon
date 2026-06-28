import 'server-only';
import { createHash } from 'crypto';
import * as React from 'react';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { prisma } from '@beaconmon/db';
import { ToolReportConfirmation } from '../../../../../workers/emails/tool-report-confirmation.js';

export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().email(),
  competitorUrl: z.string().min(1).max(2048),
});

const RATE_IP_BURST = { limit: 5, windowSec: 3600 };
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_S = 7 * 24 * 60 * 60;


function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase().replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
  return host;
}

function emailHash(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 32);
}

interface StoredProduct {
  id: number;
  handle: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
}

interface InitialSnapshot {
  takenAt: string;
  products: StoredProduct[];
}

async function fetchShopifyCatalog(domain: string): Promise<StoredProduct[] | null> {
  try {
    const res = await fetch(`https://${domain}/products.json?limit=250`, {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Beaconmon/1.0 (+https://beaconmon.com)' },
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    if (!Array.isArray(data?.products)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.products.map((p: any): StoredProduct => {
      const prices = (p.variants ?? []).map((v: { price: string }) => parseFloat(v.price)).filter(isFinite);
      const compareAts = (p.variants ?? [])
        .map((v: { compare_at_price: string | null }) => v.compare_at_price)
        .filter(Boolean)
        .map(parseFloat)
        .filter(isFinite);
      return {
        id: Number(p.id),
        handle: String(p.handle),
        title: String(p.title),
        price: prices.length ? String(Math.min(...prices)) : '0',
        compareAtPrice: compareAts.length ? String(Math.min(...compareAts)) : null,
      };
    });
  } catch {
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleIntelligenceReport(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Intelligence report route unhandled error');
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

async function handleIntelligenceReport(req: Request): Promise<Response> {
  const ip = clientIp(req);
  const burst = await rateLimit(`tools:report:ip:${ip}`, RATE_IP_BURST.limit, RATE_IP_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { email } = parsed.data;
  const domain = normalizeDomain(parsed.data.competitorUrl);
  if (!domain) throw new ValidationError('Enter a valid store URL');

  const ssrf = await isHostnameSafe(domain);
  if (!ssrf.allowed) {
    throw new ValidationError(`Cannot scan that URL: ${ssrf.reason ?? 'reserved address'}`);
  }

  // Email-level dedup via Redis: key stores the reportDueAt ISO so we can
  // return it in the already_requested response without a DB round-trip.
  const dedupKey = `tool:report:dedup:${emailHash(email)}:${domain}`;
  try {
    const existing = await getRedis().get(dedupKey);
    if (existing) {
      return Response.json({
        ok: false,
        reason: 'already_requested',
        reportDueAt: existing,
        message: `You already have a report running for ${domain}. Check your inbox on ${new Date(existing).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
      });
    }
  } catch {
    // Redis unavailable — fall through to DB check
  }

  // Verify Shopify and take initial catalog snapshot
  const catalog = await fetchShopifyCatalog(domain);
  if (catalog === null) {
    return Response.json({ ok: false, reason: 'not_shopify' });
  }

  const reportDueAt = new Date(Date.now() + SEVEN_DAYS_MS);
  const initialSnapshot: InitialSnapshot = { takenAt: new Date().toISOString(), products: catalog };

  // Insert tool_reports row. The unique index on (email, domain, status='pending')
  // is a DB-level safety net against a race that bypasses the Redis dedup above.
  let reportId: string;
  try {
    const row = await prisma.toolReport.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { email, domain, reportDueAt, initialSnapshot: initialSnapshot as any },
      select: { id: true },
    });
    reportId = row.id;
  } catch (err: unknown) {
    // Unique constraint violation: a pending report already exists in the DB.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Unique constraint') || msg.includes('P2002')) {
      const row = await prisma.toolReport.findFirst({
        where: { email, domain, status: 'pending' },
        select: { reportDueAt: true },
      });
      const dueAt = row?.reportDueAt ?? reportDueAt;
      return Response.json({
        ok: false,
        reason: 'already_requested',
        reportDueAt: dueAt.toISOString(),
        message: `You already have a report running for ${domain}. It arrives on ${dueAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
      });
    }
    throw err;
  }

  // Cache the dedup key for 7 days
  try {
    await getRedis().set(dedupKey, reportDueAt.toISOString(), 'EX', SEVEN_DAYS_S);
  } catch {
    // Non-fatal: DB row is the source of truth
  }

  // Send confirmation email (best-effort — do not block the response on it)
  void sendConfirmationEmail(email, domain, reportDueAt).catch((err) => {
    logger.error({ service: 'web', reportId, domain, err }, 'Failed to send tool report confirmation email');
  });

  return Response.json({
    ok: true,
    domain,
    reportDueAt: reportDueAt.toISOString(),
    message: `We're watching ${domain}. Your report arrives in 7 days.`,
  });
}

async function sendConfirmationEmail(email: string, domain: string, reportDueAt: Date): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY'];
  const from = process.env['EMAIL_FROM'];
  if (!apiKey || !from) return;

  const snapshotUrl = `https://beaconmon.com/tools/shopify-competitor-changes?url=${encodeURIComponent(domain)}`;
  const html = await render(
    React.createElement(ToolReportConfirmation, { domain, reportDueAt, snapshotUrl })
  );

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Your 7-day report on ${domain} is running`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

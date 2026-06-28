import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { prisma } from '@beaconmon/db';
import { logger } from './lib/logger.js';

export interface ToolReportJob {
  toolReportId: string;
  email: string;
  domain: string;
}
import { env } from './lib/env.js';
import { ToolReportResult } from './emails/tool-report-result.js';
import type { ToolReportChange } from './emails/tool-report-result.js';

const service = 'tool-report-worker';

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

async function fetchCurrentCatalog(domain: string): Promise<StoredProduct[] | null> {
  try {
    const res = await fetch(`https://${domain}/products.json?limit=250`, {
      signal: AbortSignal.timeout(15000),
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

function diffCatalog(initial: StoredProduct[], current: StoredProduct[]): ToolReportChange[] {
  const changes: ToolReportChange[] = [];
  const initialMap = new Map(initial.map((p) => [p.handle, p]));
  const currentMap = new Map(current.map((p) => [p.handle, p]));

  // Products in current: check for price/sale changes vs initial
  for (const [handle, curr] of currentMap) {
    const init = initialMap.get(handle);
    if (!init) {
      // New product
      changes.push({ title: curr.title, changeType: 'added' });
      continue;
    }

    const oldPrice = parseFloat(init.price);
    const newPrice = parseFloat(curr.price);
    const oldCa = init.compareAtPrice ? parseFloat(init.compareAtPrice) : null;
    const newCa = curr.compareAtPrice ? parseFloat(curr.compareAtPrice) : null;

    // Sale started: price is now below compare-at, and it wasn't before.
    const saleNow = newCa !== null && newPrice < newCa;
    const saleBefore = oldCa !== null && oldPrice < oldCa;
    if (saleNow && !saleBefore) {
      changes.push({
        title: curr.title,
        changeType: 'sale_started',
        oldPrice: init.price,
        newPrice: curr.price,
        oldCompareAt: init.compareAtPrice,
        newCompareAt: curr.compareAtPrice,
      });
      continue;
    }

    // Sale ended: compare_at_price disappeared
    if (oldCa !== null && newCa === null && newPrice > oldPrice) {
      changes.push({
        title: curr.title,
        changeType: 'sale_ended',
        oldPrice: init.price,
        newPrice: curr.price,
        oldCompareAt: init.compareAtPrice,
        newCompareAt: null,
      });
      continue;
    }

    // Plain price change (skip tiny noise; skip if initial had no variants so price was stored as '0')
    if (init.price !== '0' && isFinite(oldPrice) && isFinite(newPrice) && Math.abs(newPrice - oldPrice) >= 0.01) {
      changes.push({
        title: curr.title,
        changeType: newPrice < oldPrice ? 'price_drop' : 'price_rise',
        oldPrice: init.price,
        newPrice: curr.price,
      });
    }
  }

  // Products in initial but not in current: removed
  for (const [handle, init] of initialMap) {
    if (!currentMap.has(handle)) {
      changes.push({ title: init.title, changeType: 'removed' });
    }
  }

  return changes;
}

export async function processToolReportJob(data: ToolReportJob): Promise<void> {
  const { toolReportId, email, domain } = data;

  // Atomic claim: prevents duplicate delivery if the scheduler restarts mid-send.
  // updateMany returns count=0 if the row is missing, already claimed, or already sent.
  const claimed = await prisma.toolReport.updateMany({
    where: { id: toolReportId, status: 'pending' },
    data: { status: 'processing' },
  });

  if (claimed.count === 0) {
    logger.info({ service, toolReportId }, 'Tool report not pending or already claimed, skipping');
    return;
  }

  const report = await prisma.toolReport.findUnique({
    where: { id: toolReportId },
    select: { requestedAt: true, initialSnapshot: true },
  });

  if (!report) {
    logger.info({ service, toolReportId }, 'Tool report row not found after claim, skipping');
    return;
  }

  const windowStart = report.requestedAt;
  const windowEnd = new Date();

  // Fetch current catalog and diff
  const current = await fetchCurrentCatalog(domain);
  let changes: ToolReportChange[] = [];

  if (current !== null) {
    const snapshot = report.initialSnapshot as InitialSnapshot | null;
    if (snapshot?.products?.length) {
      changes = diffCatalog(snapshot.products, current);
    }
  }

  // Send report email
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;

  if (!apiKey || !from) {
    logger.warn({ service, toolReportId }, 'RESEND_API_KEY or EMAIL_FROM not set, marking failed');
    await prisma.toolReport.update({
      where: { id: toolReportId },
      data: { status: 'failed' },
    });
    return;
  }

  const signUpUrl = `https://beaconmon.com/sign-up?competitor=${encodeURIComponent(domain)}&ref=tool-report`;
  const html = await render(
    React.createElement(ToolReportResult, { domain, windowStart, windowEnd, changes, signUpUrl })
  );

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject:
      changes.length === 0
        ? `Your 7-day report on ${domain}: no changes detected`
        : `Your 7-day report on ${domain}: ${changes.length} change${changes.length !== 1 ? 's' : ''} detected`,
    html,
  });

  if (error) {
    throw new Error(`Resend error sending tool report: ${error.message}`);
  }

  await prisma.toolReport.update({
    where: { id: toolReportId },
    data: { status: 'sent', sentAt: new Date() },
  });

  logger.info({ service, toolReportId, domain, changeCount: changes.length }, 'Tool report sent');
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@beaconmon/db';
import { verifyUnsubscribeToken } from '@beaconmon/queue';

export const dynamic = 'force-dynamic';

const appUrl = () => process.env['BETTER_AUTH_URL'] ?? '';

// GET: validate the token and redirect to a confirmation page.
// Does not write to the DB — guards against automated link prefetchers.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const secret = process.env['LIFECYCLE_EMAIL_SECRET'];
  if (!secret) {
    return NextResponse.json({ error: 'Unsubscribe not configured' }, { status: 503 });
  }

  const parsed = verifyUnsubscribeToken(token, secret);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or tampered token' }, { status: 400 });
  }

  const { category } = parsed;
  return NextResponse.redirect(
    `${appUrl()}/unsubscribed?token=${encodeURIComponent(token)}&category=${encodeURIComponent(category)}`
  );
}

// POST: confirm the unsubscribe after the user clicks the button on the confirmation page.
export async function POST(request: NextRequest): Promise<NextResponse> {
  let token: string | undefined;
  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === 'string' ? body.token : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const secret = process.env['LIFECYCLE_EMAIL_SECRET'];
  if (!secret) {
    return NextResponse.json({ error: 'Unsubscribe not configured' }, { status: 503 });
  }

  const parsed = verifyUnsubscribeToken(token, secret);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or tampered token' }, { status: 400 });
  }

  const { teamId, category } = parsed;

  await prisma.emailUnsubscribe.upsert({
    where: { teamId_category: { teamId, category } },
    create: { teamId, category },
    update: {},
  });

  return NextResponse.json({ ok: true, category });
}

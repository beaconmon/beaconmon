import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@beaconmon/db';
import { verifyUnsubscribeToken } from '@beaconmon/queue';

export const dynamic = 'force-dynamic';

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

  const { teamId, category } = parsed;

  // Upsert is safe to call multiple times — idempotent
  await prisma.emailUnsubscribe.upsert({
    where: { teamId_category: { teamId, category } },
    create: { teamId, category },
    update: {},
  });

  // Redirect to a confirmation page rather than returning JSON
  const appUrl = process.env['BETTER_AUTH_URL'] ?? '';
  return NextResponse.redirect(`${appUrl}/unsubscribed?category=${encodeURIComponent(category)}`);
}

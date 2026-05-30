import { NextRequest } from 'next/server';

// Serves the IndexNow key verification file at /{NEXT_PUBLIC_INDEXNOW_KEY}.txt
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const key = process.env.NEXT_PUBLIC_INDEXNOW_KEY;
  if (!key || slug !== `${key}.txt`) {
    return new Response(null, { status: 404 });
  }
  return new Response(key, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

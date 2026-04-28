import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';

/**
 * Public heartbeat ping endpoint — no authentication required.
 * The token IS the authentication (stored in monitor.config.token).
 * Lookup uses the partial index: monitors_heartbeat_token (WHERE type = 'heartbeat').
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length > 200) {
    return new Response(null, { status: 404 });
  }

  const monitor = await prisma.monitor.findFirst({
    where: {
      type: 'heartbeat',
      isActive: true,
      config: { path: ['token'], equals: token },
    },
    select: { id: true },
  });

  if (!monitor) {
    return new Response(null, { status: 404 });
  }

  await prisma.monitor.update({
    where: { id: monitor.id },
    data: { lastHeartbeatAt: new Date() },
  });

  logger.info({ service: 'web', monitorId: monitor.id }, 'Heartbeat received');
  return new Response(null, { status: 200 });
}

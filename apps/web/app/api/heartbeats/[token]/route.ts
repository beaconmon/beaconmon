import { heartbeatRepository } from '@/lib/repositories/heartbeats';
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

  try {
    const monitor = await heartbeatRepository.findActiveMonitorByToken(token);

    if (!monitor) {
      return new Response(null, { status: 404 });
    }

    await heartbeatRepository.recordHeartbeat(monitor.id);

    logger.info({ service: 'web', monitorId: monitor.id }, 'Heartbeat received');
    return new Response(null, { status: 200 });
  } catch (err) {
    logger.error({ service: 'web', err }, 'Heartbeat processing failed');
    return new Response(null, { status: 500 });
  }
}

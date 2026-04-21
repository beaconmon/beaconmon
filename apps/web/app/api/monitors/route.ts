import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement monitorRepository.findAll(teamId)
    return Response.json({ monitors: [] });
  } catch (err) {
    logger.error({ err }, 'Failed to list monitors');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement monitorRepository.create(teamId, data)
    const _body = await req.json() as unknown;
    return Response.json({ monitor: null }, { status: 201 });
  } catch (err) {
    logger.error({ err }, 'Failed to create monitor');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

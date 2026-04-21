import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement monitorRepository.findById(teamId, params.id)
    return Response.json({ monitor: null });
  } catch (err) {
    logger.error({ err, monitorId: params.id }, 'Failed to get monitor');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement monitorRepository.update(teamId, params.id, data)
    const _body = await req.json() as unknown;
    return Response.json({ monitor: null });
  } catch (err) {
    logger.error({ err, monitorId: params.id }, 'Failed to update monitor');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement monitorRepository.delete(teamId, params.id)
    return new Response(null, { status: 204 });
  } catch (err) {
    logger.error({ err, monitorId: params.id }, 'Failed to delete monitor');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import type { Env } from './types.js';
import { REGION_DO_LOCATION_HINTS } from './types.js';
import { ProbeDurableObject } from './probe-do.js';

// Re-export the DO class so Wrangler can bind it
export { ProbeDurableObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Validate auth
    const authHeader = request.headers.get('Authorization');
    const expected = `Bearer ${env.REGION_PROBE_SECRET}`;
    if (!authHeader || authHeader !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Only accept POST
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // 3. Get DO stub pinned to this region via locationHint
    const locationHint = REGION_DO_LOCATION_HINTS[env.REGION_NAME];
    const doId = env.PROBE_DO.idFromName('probe');
    const stub = env.PROBE_DO.get(doId, { locationHint });

    // 4. Forward to DO
    return stub.fetch(request);
  },
} satisfies ExportedHandler<Env>;

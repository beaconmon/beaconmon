import { withAuth } from '@/lib/api/with-auth';
import { COMPETITOR_PRESETS } from '@/lib/competitor-presets';

export const GET = withAuth(async () => {
  return Response.json({ presets: COMPETITOR_PRESETS });
});

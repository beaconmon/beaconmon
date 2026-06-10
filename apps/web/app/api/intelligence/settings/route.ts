import { digestPrefsSchema, updateDigestPrefsSchema, DEFAULT_DIGEST_PREFS } from '@beaconmon/types';
import { digestRepository, alertChannelRepository } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { ValidationError, ForbiddenError } from '@/lib/api/errors';

export const GET = withAuth(async (_req, ctx) => {
  const { teamId, plan } = ctx;

  const settings = await digestRepository.getDigestPrefs(teamId);

  const parsedPrefs = digestPrefsSchema.safeParse(settings?.digestPrefs ?? {});
  const prefs = parsedPrefs.success ? parsedPrefs.data : DEFAULT_DIGEST_PREFS;

  return Response.json({ prefs, plan, timezone: settings?.timezone ?? 'Etc/UTC' });
});

export const PATCH = withAuth(async (req, ctx) => {
  const { teamId, plan } = ctx;

  const body = await req.json().catch(() => null);
  const parsed = updateDigestPrefsSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid request body');
  }

  const input = parsed.data;

  // Plan gates
  if (plan === 'free' && input.frequency !== null) {
    throw new ForbiddenError('Intelligence Digest requires a paid plan');
  }
  if (plan === 'starter' && (input.frequency === 'daily' || input.frequency === 'both')) {
    throw new ForbiddenError('Daily digest requires Growth or Scale plan');
  }

  // Validate that all channelIds belong to this team
  if (input.channelIds.length > 0) {
    const valid = await alertChannelRepository.validateChannelIds(input.channelIds, teamId);
    if (!valid) {
      throw new ValidationError('One or more channel IDs are invalid');
    }
  }

  // Timezone lives on Team, not inside the digest_prefs JSON
  const { timezone, ...prefs } = input;
  await digestRepository.updateDigestPrefs(teamId, prefs, timezone);

  return Response.json({ ok: true });
});

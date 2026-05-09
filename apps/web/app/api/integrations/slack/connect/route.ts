import { createHmac, randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { ACTIVE_TEAM_COOKIE } from '@/lib/api/cookies';
import { logger } from '@/lib/logger';

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  const prefix = `${name}=`;
  for (const part of header.split('; ')) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function GET(req: Request) {
  let userId: string | undefined;
  let teamId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user?.id;
    if (!userId) {
      const signIn = new URL('/sign-in', req.url);
      return Response.redirect(signIn.toString());
    }

    const cookieTeamId = readCookie(req, ACTIVE_TEAM_COOKIE);
    teamId = cookieTeamId ?? session!.user.teamId ?? undefined;

    if (!teamId) {
      const signIn = new URL('/sign-in', req.url);
      return Response.redirect(signIn.toString());
    }

    const secret = process.env.BETTER_AUTH_SECRET!;
    const payload = {
      teamId,
      nonce: randomBytes(16).toString('hex'),
      exp: Date.now() + 10 * 60 * 1000,
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = createHmac('sha256', secret).update(b64).digest('base64url');
    const state = `${b64}.${sig}`;

    const appUrl = process.env.BETTER_AUTH_URL!;
    const redirectUri = `${appUrl}/api/integrations/slack/callback`;

    const slackUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackUrl.searchParams.set('client_id', process.env.SLACK_CLIENT_ID!);
    slackUrl.searchParams.set('scope', 'incoming-webhook');
    slackUrl.searchParams.set('redirect_uri', redirectUri);
    slackUrl.searchParams.set('state', state);

    return Response.redirect(slackUrl.toString());
  } catch (err) {
    logger.error({ service: 'web', err, userId, teamId }, 'Slack connect initiation failed');
    return new Response('Internal server error', { status: 500 });
  }
}

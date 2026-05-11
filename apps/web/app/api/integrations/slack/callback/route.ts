import { createHmac, timingSafeEqual } from 'crypto';
import { alertChannelRepository } from '@/lib/repositories/alert-channels';
import { teamRepository } from '@/lib/repositories/teams';
import { PLAN_LIMITS } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import type { PlanTier } from '@beaconmon/types';
import { getPostHogClient } from '@/lib/posthog-server';

interface SlackState {
  teamId: string;
  nonce: string;
  exp: number;
}

function verifyState(state: string, secret: string): SlackState | null {
  const dot = state.lastIndexOf('.');
  if (dot === -1) return null;
  const b64 = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(b64).digest('base64url');
  const expectedBuf = Buffer.from(expected, 'base64url');
  const sigBuf = Buffer.from(sig, 'base64url');
  if (expectedBuf.length !== sigBuf.length || !timingSafeEqual(expectedBuf, sigBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as SlackState;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    if (typeof payload.teamId !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

async function resolveTeamPlan(teamId: string): Promise<PlanTier> {
  const team = await teamRepository.findPlanInfo(teamId);
  if (!team) return 'free';
  let plan = team.plan as PlanTier;
  if (plan !== 'free' && team.trialEndsAt) {
    const trialExpired = team.trialEndsAt < new Date();
    const subStatus = team.subscription?.status;
    const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
    if (trialExpired && !hasActiveSub) plan = 'free';
  }
  return plan;
}

export async function GET(req: Request) {
  const appUrl = process.env.BETTER_AUTH_URL!;
  const channelsUrl = `${appUrl}/alert-channels`;

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const slackError = url.searchParams.get('error');

  if (slackError || !code || !state) {
    return Response.redirect(`${channelsUrl}?error=slack_cancelled`);
  }

  const payload = verifyState(state, process.env.BETTER_AUTH_SECRET!);
  if (!payload) {
    return Response.redirect(`${channelsUrl}?error=slack_failed`);
  }

  const redirectUri = `${appUrl}/api/integrations/slack/callback`;

  let tokenData: Record<string, unknown>;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri,
      }),
      signal: controller.signal,
    });
    tokenData = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      logger.error({ service: 'web', teamId: payload.teamId }, 'Slack token exchange timed out');
    } else {
      logger.error({ service: 'web', err, teamId: payload.teamId }, 'Slack token exchange failed');
    }
    return Response.redirect(`${channelsUrl}?error=slack_failed`);
  } finally {
    clearTimeout(timeout);
  }

  if (
    !tokenData['ok'] ||
    typeof tokenData['incoming_webhook'] !== 'object' ||
    !tokenData['incoming_webhook']
  ) {
    logger.warn({ service: 'web', teamId: payload.teamId, slackError: tokenData['error'] }, 'Slack OAuth denied or missing webhook');
    return Response.redirect(`${channelsUrl}?error=slack_failed`);
  }

  const webhook = tokenData['incoming_webhook'] as Record<string, unknown>;
  const webhookUrl = webhook['url'] as string;
  const channelName = (webhook['channel'] as string | undefined) ?? 'Slack';

  if (!webhookUrl) {
    return Response.redirect(`${channelsUrl}?error=slack_failed`);
  }

  let channelId = '';
  try {
    const plan = await resolveTeamPlan(payload.teamId);
    const limits = PLAN_LIMITS[plan];
    if (limits.alertChannels !== -1) {
      const count = await alertChannelRepository.countByTeam(payload.teamId);
      if (count >= limits.alertChannels) {
        return Response.redirect(`${channelsUrl}?error=slack_limit`);
      }
    }

    const channel = await alertChannelRepository.create(payload.teamId, {
      type: 'slack',
      name: `Slack ${channelName}`,
      config: { webhookUrl },
    });
    logger.info({ service: 'web', teamId: payload.teamId, channelId: channel.id }, 'Slack channel connected via OAuth');
    channelId = channel.id;
  } catch (err) {
    logger.error({ service: 'web', err, teamId: payload.teamId }, 'Failed to create Slack alert channel');
    return Response.redirect(`${channelsUrl}?error=slack_failed`);
  }

  try {
    getPostHogClient().capture({
      distinctId: payload.teamId,
      event: 'slack_channel_connected',
      properties: { channel_id: channelId },
    });
  } catch (err) {
    logger.error({ service: 'web', err, teamId: payload.teamId }, 'PostHog capture failed for slack_channel_connected');
  }

  return Response.redirect(`${channelsUrl}?success=slack_connected`);
}

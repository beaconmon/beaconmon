import 'server-only';
import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;
const noopClient = new Proxy({} as PostHog, { get: () => () => {} });

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — server analytics disabled');
      return noopClient;
    }
    posthogClient = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 10_000,
    });
  }
  return posthogClient;
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}

import { createAiProvider } from '@beaconmon/ai';
import type { AiProvider } from '@beaconmon/ai';

export function getWebAiProvider(): AiProvider {
  const providerName = process.env.AI_PROVIDER ?? 'noop';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  const validProviders = ['anthropic', 'openai', 'deepseek', 'noop'] as const;
  type ProviderName = (typeof validProviders)[number];
  const resolved: ProviderName = validProviders.includes(providerName as ProviderName)
    ? (providerName as ProviderName)
    : 'noop';

  if (resolved !== 'noop' && !apiKey) {
    return createAiProvider({ provider: 'noop' });
  }

  return createAiProvider({ provider: resolved, apiKey, model });
}

export function isWebAiSmartSetupEnabled(plan: string): boolean {
  return (
    process.env.FEATURE_AI_SMART_SETUP === 'true' &&
    !!process.env.AI_PROVIDER &&
    process.env.AI_PROVIDER !== 'noop' &&
    (plan === 'growth' || plan === 'scale')
  );
}

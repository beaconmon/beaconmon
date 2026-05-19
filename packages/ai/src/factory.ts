import { AnthropicProvider } from './providers/anthropic.js';
import { DeepSeekProvider } from './providers/deepseek.js';
import { NoopProvider } from './providers/noop.js';
import { OpenAiProvider } from './providers/openai.js';
import type { AiProvider, AiProviderConfig } from './types.js';

export function createAiProvider(config: AiProviderConfig): AiProvider {
  switch (config.provider) {
    case 'anthropic':
      if (!config.apiKey) {
        throw new Error('createAiProvider: anthropic provider requires apiKey');
      }
      return new AnthropicProvider(config.apiKey, config.model);
    case 'openai':
      if (!config.apiKey) {
        throw new Error('createAiProvider: openai provider requires apiKey');
      }
      return new OpenAiProvider(config.apiKey, config.model);
    case 'deepseek':
      if (!config.apiKey) {
        throw new Error('createAiProvider: deepseek provider requires apiKey');
      }
      return new DeepSeekProvider(config.apiKey, config.model);
    case 'noop':
      return new NoopProvider();
    default: {
      const _exhaustive: never = config.provider as never;
      throw new Error(`createAiProvider: unknown provider "${String(_exhaustive)}"`);
    }
  }
}

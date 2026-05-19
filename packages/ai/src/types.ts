import type { z } from 'zod';

export type AiProviderName = 'anthropic' | 'openai' | 'deepseek' | 'noop';

export interface AiCompletionRequest<T extends z.ZodTypeAny = z.ZodTypeAny> {
  system: string;
  user: string;
  schema: T;
  schemaName?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiCompletionResult<T> {
  data: T;
  model: string;
  usage: AiUsage;
}

export interface AiProvider {
  readonly name: AiProviderName;
  readonly model: string;
  complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>>;
}

export interface AiProviderConfig {
  provider: AiProviderName;
  apiKey?: string;
  model?: string;
}

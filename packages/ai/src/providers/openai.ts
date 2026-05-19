import OpenAI from 'openai';
import type { z } from 'zod';
import { zodToJsonSchema } from '../zod-to-json-schema.js';
import {
  AiProviderError,
  AiQuotaError,
  AiSchemaError,
  AiTimeoutError,
} from '../errors.js';
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProvider,
} from '../types.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai' as const;
  readonly model: string;
  private readonly client: OpenAI;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model ?? DEFAULT_MODEL;
  }

  async complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>> {
    const jsonSchema = zodToJsonSchema(req.schema);

    const requestOptions: { signal?: AbortSignal } = {};
    if (req.timeoutMs != null) {
      requestOptions.signal = AbortSignal.timeout(req.timeoutMs);
    }

    let response: OpenAI.Chat.Completions.ChatCompletion;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: req.schemaName ?? 'structured_output',
            strict: true,
            schema: jsonSchema as Record<string, unknown>,
          },
        },
      }, requestOptions);
    } catch (err) {
      throw mapOpenAiError(err);
    }

    const message = response.choices[0]?.message?.content;
    if (!message) {
      throw new AiSchemaError('OpenAI response contained no message content');
    }

    let json: unknown;
    try {
      json = JSON.parse(message);
    } catch (err) {
      throw new AiSchemaError(
        'OpenAI returned non-JSON content despite json_schema response_format',
        err
      );
    }

    const parsed = req.schema.safeParse(json);
    if (!parsed.success) {
      throw new AiSchemaError(
        `OpenAI output failed schema validation: ${parsed.error.message}`
      );
    }

    return {
      data: parsed.data,
      model: this.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}

function mapOpenAiError(err: unknown): Error {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return new AiQuotaError(err.message, err);
    if (err.status === 408 || err.status === 504) {
      return new AiTimeoutError(err.message, err);
    }
    return new AiProviderError(`OpenAI API error (${err.status}): ${err.message}`, err);
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return new AiTimeoutError(err.message, err);
  }
  return new AiProviderError(
    err instanceof Error ? err.message : 'Unknown OpenAI error',
    err
  );
}

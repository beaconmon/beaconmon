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

const DEFAULT_MODEL = 'deepseek-chat';
const BASE_URL = 'https://api.deepseek.com/v1';

export class DeepSeekProvider implements AiProvider {
  readonly name = 'deepseek' as const;
  readonly model: string;
  private readonly client: OpenAI;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey, baseURL: BASE_URL });
    this.model = model ?? DEFAULT_MODEL;
  }

  async complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>> {
    const requestOptions: { signal?: AbortSignal } = {};
    if (req.timeoutMs != null) {
      requestOptions.signal = AbortSignal.timeout(req.timeoutMs);
    }

    const jsonSchema = zodToJsonSchema(req.schema);
    const systemWithSchema = `${req.system}\n\nYou MUST return a JSON object that exactly matches this schema. Every field is required; never output null for a string field — use an empty string instead.\n\nSchema:\n${JSON.stringify(jsonSchema, null, 2)}`;

    let response: OpenAI.Chat.Completions.ChatCompletion;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0,
        messages: [
          { role: 'system', content: systemWithSchema },
          { role: 'user', content: req.user },
        ],
        response_format: { type: 'json_object' },
      }, requestOptions);
    } catch (err) {
      throw mapDeepSeekError(err);
    }

    const choice = response.choices[0];
    if (choice?.finish_reason === 'length') {
      throw new AiSchemaError(
        `DeepSeek output was truncated (hit max_tokens=${req.maxTokens ?? 1024}). Increase maxTokens.`
      );
    }
    const message = choice?.message?.content;
    if (!message) {
      throw new AiSchemaError('DeepSeek response contained no message content');
    }

    let json: unknown;
    try {
      json = JSON.parse(message);
    } catch (err) {
      throw new AiSchemaError(
        'DeepSeek returned non-JSON content despite json_object response_format',
        err
      );
    }

    const parsed = req.schema.safeParse(json);
    if (!parsed.success) {
      throw new AiSchemaError(
        `DeepSeek output failed schema validation: ${parsed.error.message}`
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

function mapDeepSeekError(err: unknown): Error {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return new AiQuotaError(err.message, err);
    if (err.status === 408 || err.status === 504) {
      return new AiTimeoutError(err.message, err);
    }
    return new AiProviderError(`DeepSeek API error (${err.status}): ${err.message}`, err);
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return new AiTimeoutError(err.message, err);
  }
  return new AiProviderError(
    err instanceof Error ? err.message : 'Unknown DeepSeek error',
    err
  );
}

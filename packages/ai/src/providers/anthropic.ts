import Anthropic from '@anthropic-ai/sdk';
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

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const TOOL_NAME = 'emit_structured_output';

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic' as const;
  readonly model: string;
  private readonly client: Anthropic;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model ?? DEFAULT_MODEL;
  }

  async complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>> {
    const jsonSchema = zodToJsonSchema(req.schema);

    let response: Anthropic.Messages.Message;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0,
        // System prompt is sent as a cache-eligible block so identical system
        // prompts across calls hit the prompt cache (huge cost lever for
        // high-volume use cases like content-diff summarization).
        system: [
          {
            type: 'text',
            text: req.system,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description:
              'Emit the structured output for the requested analysis. You MUST call this tool exactly once.',
            input_schema: jsonSchema as Anthropic.Messages.Tool.InputSchema,
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
        messages: [{ role: 'user', content: req.user }],
      });
    } catch (err) {
      throw mapAnthropicError(err);
    }

    const toolUse = response.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );
    if (!toolUse) {
      throw new AiSchemaError(
        'Anthropic response contained no tool_use block — model failed to emit structured output'
      );
    }

    const parsed = req.schema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new AiSchemaError(
        `Anthropic tool output failed schema validation: ${parsed.error.message}`
      );
    }

    return {
      data: parsed.data,
      model: this.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}

function mapAnthropicError(err: unknown): Error {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 429) return new AiQuotaError(err.message, err);
    if (err.status === 408 || err.status === 504) {
      return new AiTimeoutError(err.message, err);
    }
    return new AiProviderError(`Anthropic API error (${err.status}): ${err.message}`, err);
  }
  if (err instanceof Error && err.name === 'AbortError') {
    return new AiTimeoutError(err.message, err);
  }
  return new AiProviderError(
    err instanceof Error ? err.message : 'Unknown Anthropic error',
    err
  );
}

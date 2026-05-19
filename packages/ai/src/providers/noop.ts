import type { z } from 'zod';
import { AiSchemaError } from '../errors.js';
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProvider,
} from '../types.js';

/**
 * NoopProvider returns a deterministic stub matching the requested schema.
 * Used by tests and when AI_DRY_RUN=true so the rest of the pipeline can run
 * without hitting a real LLM.
 *
 * Strategy: build a minimal-but-typed object by inspecting the Zod schema. If
 * the schema is too exotic (no obvious default for a required field), throw
 * AiSchemaError — callers in dry-run mode should pass a content-diff-shaped
 * schema with known field defaults.
 */
export class NoopProvider implements AiProvider {
  readonly name = 'noop' as const;
  readonly model = 'noop';

  async complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>> {
    const stub = buildStub();
    const parsed = req.schema.safeParse(stub);
    if (!parsed.success) {
      throw new AiSchemaError(
        `NoopProvider could not build a stub matching the provided schema: ${parsed.error.message}`
      );
    }
    return {
      data: parsed.data,
      model: this.model,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
}

// Hard-coded shape matching the v1 use case (content-diff).
// If we add a second use case with a different schema, extend this map.
function buildStub(): Record<string, unknown> {
  return {
    summary: '[AI disabled]',
    classification: 'copy',
    confidence: 0,
  };
}

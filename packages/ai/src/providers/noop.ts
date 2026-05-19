import { z } from 'zod';
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
 * Strategy: walk the Zod schema recursively to generate typed defaults for
 * every field. Supports string, number, boolean, enum, array, and object
 * schemas — the full set used across all AI use cases in this package.
 */
export class NoopProvider implements AiProvider {
  readonly name = 'noop' as const;
  readonly model = 'noop';

  async complete<T extends z.ZodTypeAny>(
    req: AiCompletionRequest<T>
  ): Promise<AiCompletionResult<z.infer<T>>> {
    let stub: unknown;
    try {
      stub = buildStubFromSchema(req.schema);
    } catch (err) {
      throw new AiSchemaError(
        `NoopProvider could not build a stub for schema: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    const parsed = req.schema.safeParse(stub);
    if (!parsed.success) {
      throw new AiSchemaError(
        `NoopProvider stub failed schema validation: ${parsed.error.message}`
      );
    }
    return {
      data: parsed.data,
      model: this.model,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
}

type ZodDef = { type: string };
type ZodCheck = { _zod?: { def?: { check?: string; minimum?: number } } };

function buildStubFromSchema(schema: z.ZodTypeAny): unknown {
  const def = schema._def as ZodDef;
  const type = def.type;

  switch (type) {
    case 'string': {
      // minLength is exposed directly on ZodString instances in Zod 4
      const minLen = (schema as z.ZodTypeAny & { minLength?: number | null }).minLength ?? 0;
      return minLen > 0 ? 'stub' : '';
    }
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'enum': {
      const entries = (def as unknown as { entries: Record<string, unknown> }).entries;
      return Object.values(entries)[0];
    }
    case 'array': {
      const arrDef = def as unknown as { element: z.ZodTypeAny; checks?: ZodCheck[] };
      const minLen = (arrDef.checks ?? []).reduce<number>((acc, c) => {
        if (c._zod?.def?.check === 'min_length' && (c._zod.def.minimum ?? 0) > 0) {
          return c._zod.def.minimum ?? 0;
        }
        return acc;
      }, 0);
      return minLen > 0 ? [buildStubFromSchema(arrDef.element)] : [];
    }
    case 'object': {
      const shape = (def as unknown as { shape: Record<string, z.ZodTypeAny> }).shape;
      const result: Record<string, unknown> = {};
      for (const [key, fieldSchema] of Object.entries(shape)) {
        result[key] = buildStubFromSchema(fieldSchema);
      }
      return result;
    }
    case 'optional':
    case 'nullable':
      return undefined;
    default:
      throw new Error(`unsupported schema type: ${type}`);
  }
}

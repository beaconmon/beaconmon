import { z } from 'zod';

/**
 * Thin wrapper around zod v4's built-in `toJSONSchema`, tuned for LLM tool
 * input schemas. Strips `$schema`, requires `target: 'draft-7'` (Anthropic +
 * OpenAI prefer this), and casts the result to a plain JSON-schema-shaped
 * object that the SDK types will accept.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { target: 'draft-7' }) as Record<string, unknown>;
  // Anthropic + OpenAI both ignore $schema and some reject it outright.
  delete json['$schema'];
  return json;
}

import type { AiCompletionResult, AiProvider } from '../types.js';
import {
  CONTENT_DIFF_SYSTEM_PROMPT,
  ContentDiffOutput,
  buildDiffPrompt,
} from './prompt.js';

const MAX_TOKENS = 600;

export async function summarizeContentDiff(
  provider: AiProvider,
  previous: string,
  next: string
): Promise<AiCompletionResult<ContentDiffOutput>> {
  return provider.complete({
    system: CONTENT_DIFF_SYSTEM_PROMPT,
    user: buildDiffPrompt(previous, next),
    schema: ContentDiffOutput,
    schemaName: 'content_diff_analysis',
    maxTokens: MAX_TOKENS,
    temperature: 0,
  });
}

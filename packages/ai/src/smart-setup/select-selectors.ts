import type { AiCompletionResult, AiProvider } from '../types.js';
import {
  SMART_SETUP_SELECTORS_SYSTEM_PROMPT,
  SelectorsOutput,
  buildSelectorsPrompt,
} from './prompt-selectors.js';

const MAX_TOKENS = 512;

export interface ProposeSelectorsInput {
  pageHtml: string;
  intentName: string;
}

export async function proposeSelectors(
  provider: AiProvider,
  input: ProposeSelectorsInput
): Promise<AiCompletionResult<SelectorsOutput>> {
  return provider.complete({
    system: SMART_SETUP_SELECTORS_SYSTEM_PROMPT,
    user: buildSelectorsPrompt(input.pageHtml, input.intentName),
    schema: SelectorsOutput,
    schemaName: 'smart_setup_selectors',
    maxTokens: MAX_TOKENS,
    temperature: 0,
  });
}

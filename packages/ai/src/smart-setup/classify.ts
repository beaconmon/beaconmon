import type { AiCompletionResult, AiProvider } from '../types.js';
import {
  SMART_SETUP_CLASSIFY_SYSTEM_PROMPT,
  ClassifyOutput,
  buildClassifyPrompt,
} from './prompt-classify.js';

const MAX_TOKENS = 1500;

export interface ClassifySiteInput {
  homepageText: string;
  urls: string[];
}

export async function classifySite(
  provider: AiProvider,
  input: ClassifySiteInput
): Promise<AiCompletionResult<ClassifyOutput>> {
  return provider.complete({
    system: SMART_SETUP_CLASSIFY_SYSTEM_PROMPT,
    user: buildClassifyPrompt(input.homepageText, input.urls),
    schema: ClassifyOutput,
    schemaName: 'smart_setup_classify',
    maxTokens: MAX_TOKENS,
    temperature: 0,
  });
}

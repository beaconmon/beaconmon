export type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProvider,
  AiProviderConfig,
  AiProviderName,
  AiUsage,
} from './types.js';
export {
  AiError,
  AiProviderError,
  AiQuotaError,
  AiSchemaError,
  AiTimeoutError,
} from './errors.js';
export { createAiProvider } from './factory.js';
export {
  CONTENT_DIFF_SYSTEM_PROMPT,
  ContentDiffOutput,
  buildDiffPrompt,
  summarizeContentDiff,
} from './content-diff/index.js';
export type { ContentDiffClassification } from './content-diff/index.js';
export {
  SMART_SETUP_CLASSIFY_SYSTEM_PROMPT,
  ClassifyOutput,
  ClassifyIntentSchema,
  buildClassifyPrompt,
  SMART_SETUP_SELECTORS_SYSTEM_PROMPT,
  SelectorsOutput,
  buildSelectorsPrompt,
  classifySite,
  proposeSelectors,
  suggestCompetitors,
  CompetitorSuggestOutput,
} from './smart-setup/index.js';
export type {
  ClassifyIntent,
  ClassifySiteInput,
  ProposeSelectorsInput,
  SuggestCompetitorsInput,
  SuggestCompetitorsResult,
} from './smart-setup/index.js';

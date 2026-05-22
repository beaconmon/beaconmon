export {
  SMART_SETUP_CLASSIFY_SYSTEM_PROMPT,
  ClassifyOutput,
  ClassifyIntentSchema,
  buildClassifyPrompt,
} from './prompt-classify.js';
export type { ClassifyIntent } from './prompt-classify.js';

export {
  SMART_SETUP_SELECTORS_SYSTEM_PROMPT,
  SelectorsOutput,
  buildSelectorsPrompt,
} from './prompt-selectors.js';

export { classifySite } from './classify.js';
export type { ClassifySiteInput } from './classify.js';

export { proposeSelectors } from './select-selectors.js';
export type { ProposeSelectorsInput } from './select-selectors.js';

export { suggestCompetitors, CompetitorSuggestOutput } from './suggest-competitors.js';
export type { SuggestCompetitorsInput, SuggestCompetitorsResult } from './suggest-competitors.js';

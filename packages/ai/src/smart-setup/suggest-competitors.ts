import { z } from 'zod';
import type { AiProvider } from '../types.js';

export const CompetitorSuggestOutput = z.object({
  competitors: z.array(z.string().max(100)).max(5),
});

export type CompetitorSuggestOutput = z.infer<typeof CompetitorSuggestOutput>;

export interface SuggestCompetitorsInput {
  domain: string;
  extractedText: string;
}

export interface SuggestCompetitorsResult {
  competitors: string[];
}

export async function suggestCompetitors(
  provider: AiProvider,
  input: SuggestCompetitorsInput
): Promise<SuggestCompetitorsResult> {
  const result = await provider.complete({
    system:
      'You are a competitive intelligence assistant for ecommerce brands. Given a store homepage, identify 3 to 5 real competitor domains. Return only verified, real domain names as a JSON object.',
    user: `Store homepage:\n${input.extractedText}\n\nSuggest 3-5 competitor domains.`,
    schema: CompetitorSuggestOutput,
    schemaName: 'suggest_competitors',
    maxTokens: 400,
    temperature: 0,
    timeoutMs: 15000,
  });

  return { competitors: result.data.competitors };
}

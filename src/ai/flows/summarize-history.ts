'use server';
/**
 * @fileOverview A Genkit flow for summarizing a user's counter history.
 *
 * - summarizeHistory - A function that generates a personalized summary of the user's practice.
 */

import { ai } from '@/ai/genkit';
import {
  SummarizeHistoryInputSchema,
  type SummarizeHistoryInput,
  SummarizeHistoryOutputSchema,
  type SummarizeHistoryOutput,
} from '@/lib/types';

export async function summarizeHistory(input: SummarizeHistoryInput): Promise<SummarizeHistoryOutput> {
  return summarizeHistoryFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'summarizeHistoryPrompt',
  input: { schema: SummarizeHistoryInputSchema },
  output: { schema: SummarizeHistoryOutputSchema },
  prompt: `You are a kind and encouraging spiritual guide for a user of a Jap Counter app.
Your task is to provide a short, personalized summary of the user's practice based on their recent activity.

{{#if userName}}
Address the user as {{userName}}.
{{/if}}

Here is the user's recent history:
{{#each history}}
- On {{date}}, they completed {{count}} repetitions.
{{/each}}

Analyze their consistency, the totals, and offer gentle encouragement. Keep the summary to 2-3 sentences. Be positive and uplifting.
If there is no history, provide a simple message encouraging them to start.
If the user's name is available, use it to make the message more personal.
`,
});

const summarizeHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeHistoryFlow',
    inputSchema: SummarizeHistoryInputSchema,
    outputSchema: SummarizeHistoryOutputSchema,
  },
  async (input) => {
    if (input.history.length === 0) {
      return { summary: "You have no practice history yet. Start a session to begin your journey!" };
    }

    const { output } = await summaryPrompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview A Genkit flow for intelligently generating personalized counter reminders.
 *
 * - personalizeCounterReminder - A function that generates a personalized reminder for the user's Jap Counter.
 * - PersonalizeCounterReminderInput - The input type for the personalizeCounterReminder function.
 * - PersonalizeCounterReminderOutput - The return type for the personalizeCounterReminder function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizeCounterReminderInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  currentCount: z.number().describe('The user\'s current counter value.'),
  targetGoal: z.number().describe('The user\'s set target goal (e.g., 108, 1008).'),
  hoursSinceLastActivity: z.number().min(0).describe('The number of hours since the user\'s last interaction with the counter.'),
  notificationPreference: z.enum(['subtle', 'regular', 'urgent', 'none']).describe('The user\'s preferred notification frequency.'),
  timeOfDayDescription: z.string().describe('A descriptive string of the current time of day (e.g., "morning", "afternoon", "evening", "late night").'),
});
export type PersonalizeCounterReminderInput = z.infer<typeof PersonalizeCounterReminderInputSchema>;

const PersonalizeCounterReminderOutputSchema = z.object({
  shouldSendReminder: z.boolean().describe('True if a reminder should be sent, false otherwise.'),
  reminderMessage: z.string().optional().describe('The personalized reminder message to send, if shouldSendReminder is true.'),
  suggestedFrequencyAdjustment: z.enum(['increase', 'decrease', 'keep_same', 'none']).optional().describe('A suggestion for adjusting the user\'s notification frequency based on their recent activity.'),
});
export type PersonalizeCounterReminderOutput = z.infer<typeof PersonalizeCounterReminderOutputSchema>;

export async function personalizeCounterReminder(input: PersonalizeCounterReminderInput): Promise<PersonalizeCounterReminderOutput> {
  return personalizeCounterReminderFlow(input);
}

const reminderPrompt = ai.definePrompt({
  name: 'personalizedCounterReminderPrompt',
  input: { schema: PersonalizeCounterReminderInputSchema },
  output: { schema: PersonalizeCounterReminderOutputSchema },
  prompt: `You are an intelligent assistant for a Jap Counter mobile application. Your goal is to provide personalized and timely reminders to help users stay motivated towards their spiritual goals, without being intrusive.

Analyze the following user data to decide if a reminder should be sent and to craft a suitable message.

User ID: {{{userId}}}
Current Count: {{{currentCount}}}
Target Goal: {{{targetGoal}}}
Hours Since Last Activity: {{{hoursSinceLastActivity}}}
Notification Preference: {{{notificationPreference}}}
Current Time of Day: {{{timeOfDayDescription}}}

Consider the following rules and guidelines:

1.  **Notification Preference**: If the user's 'notificationPreference' is 'none', then 'shouldSendReminder' must be false, and 'reminderMessage' must be empty.
2.  **Recent Activity**: If 'hoursSinceLastActivity' is less than 2 hours, it's generally too soon for a reminder, especially if the 'notificationPreference' is 'subtle' or 'regular'. If 'hoursSinceLastActivity' is less than 0.5 hours, 'shouldSendReminder' must be false.
3.  **Progress Towards Goal**:
    *   If 'currentCount' is equal to or greater than 'targetGoal', the user has reached their goal. In this case, 'shouldSendReminder' should be false, and the 'reminderMessage' (if any) should be a congratulatory one. The 'suggestedFrequencyAdjustment' should be 'keep_same' or 'none'.
    *   Calculate the percentage of goal completed: (currentCount / targetGoal) * 100.
    *   If the user is very close to their 'targetGoal' (e.g., 80% or more completed), provide an encouraging message to help them reach the finish line.
    *   If the user is significantly below their 'targetGoal' and 'hoursSinceLastActivity' is high (e.g., > 6 hours), a motivating reminder is more appropriate.
4.  **Tone and Content**:
    *   **Subtle Preference**: Reminders should be gentle, suggestive, and infrequent. Focus on positive reinforcement.
    *   **Regular Preference**: Reminders can be more direct but still encouraging.
    *   **Urgent Preference**: Reminders can be more frequent and direct, emphasizing consistency.
    *   Incorporate the 'timeOfDayDescription' to make the message more contextually relevant (e.g., "Good morning!").
    *   Messages should be concise, uplifting, and personalized to the user's progress. Avoid negative phrasing.
5.  **Suggested Frequency Adjustment**:
    *   If 'hoursSinceLastActivity' is consistently low (e.g., < 1 hour) over a long period or 'currentCount' is regularly meeting or exceeding goals, suggest 'decrease' or 'keep_same'.
    *   If 'hoursSinceLastActivity' is consistently high (e.g., > 12 hours) and 'currentCount' is far from 'targetGoal', suggest 'increase' (unless 'notificationPreference' is 'subtle' or 'none').
    *   Otherwise, suggest 'keep_same'.

Provide the output in JSON format with the fields 'shouldSendReminder', 'reminderMessage', and 'suggestedFrequencyAdjustment'. The 'reminderMessage' should only be present if 'shouldSendReminder' is true. If 'shouldSendReminder' is false, 'reminderMessage' should be omitted. If 'targetGoal' is 0 or less, consider it as no target set, and reminders should focus on general encouragement rather than goal completion. If 'targetGoal' is 0, also assume it means no target.

Example Scenarios:
- User is active, close to goal, regular preference: { "shouldSendReminder": true, "reminderMessage": "You're so close to your goal of {{{targetGoal}}}! Just a few more to go, keep up the great work!", "suggestedFrequencyAdjustment": "keep_same" }
- User inactive for a while (e.g., 8 hours), far from goal (e.g., 20/108), subtle preference: { "shouldSendReminder": true, "reminderMessage": "Good {{{timeOfDayDescription}}}, remember your practice. Every step counts towards your goal of {{{targetGoal}}}.", "suggestedFrequencyAdjustment": "increase" }
- User inactive for a while (e.g., 8 hours), far from goal (e.g., 20/108), urgent preference: { "shouldSendReminder": true, "reminderMessage": "Time to resume your practice, you are at {{{currentCount}}} out of {{{targetGoal}}}. Stay consistent!", "suggestedFrequencyAdjustment": "keep_same" }
- Goal reached: { "shouldSendReminder": false, "reminderMessage": "Congratulations on reaching your goal of {{{targetGoal}}}! Amazing achievement!", "suggestedFrequencyAdjustment": "keep_same" }
- No preference for reminders: { "shouldSendReminder": false }
- Very recent activity (e.g., 0.5 hours ago): { "shouldSendReminder": false }
`,
});

const personalizeCounterReminderFlow = ai.defineFlow(
  {
    name: 'personalizeCounterReminderFlow',
    inputSchema: PersonalizeCounterReminderInputSchema,
    outputSchema: PersonalizeCounterReminderOutputSchema,
  },
  async (input) => {
    // The prompt is designed to handle the logic and output generation directly.
    const { output } = await reminderPrompt(input);
    return output!;
  }
);

import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type UserSettings = {
  vibration: boolean;
  sound: boolean;
  notifications: 'subtle' | 'regular' | 'urgent' | 'none';
  theme: 'light' | 'dark' | 'system';
};

export type UserData = {
  id: string;
  counter: number;
  target: number;
  lastUpdated: any; // Can be Timestamp or FieldValue
  settings: UserSettings;
};

export type HistoryEntry = {
  id: string;
  userId: string;
  count: number;
  date: Timestamp;
};

// === AI Flow Types ===

// For summarize-history flow
export const HistoryEntrySchema = z.object({
  date: z.string().describe("The date of the session."),
  count: z.number().describe("The number of repetitions in that session."),
});

export const SummarizeHistoryInputSchema = z.object({
  history: z.array(HistoryEntrySchema).describe("An array of the user's recent counting sessions."),
  userName: z.string().optional().describe("The user's name, for personalization."),
});
export type SummarizeHistoryInput = z.infer<typeof SummarizeHistoryInputSchema>;

export const SummarizeHistoryOutputSchema = z.object({
  summary: z.string().describe("A short, encouraging, and personalized summary of the user's practice based on their history. Address the user directly if their name is provided."),
});
export type SummarizeHistoryOutput = z.infer<typeof SummarizeHistoryOutputSchema>;


// For personalized-counter-reminders flow
export const PersonalizeCounterReminderInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  currentCount: z.number().describe('The user\'s current counter value.'),
  targetGoal: z.number().describe('The user\'s set target goal (e.g., 108, 1008).'),
  hoursSinceLastActivity: z.number().min(0).describe('The number of hours since the user\'s last interaction with the counter.'),
  notificationPreference: z.enum(['subtle', 'regular', 'urgent', 'none']).describe('The user\'s preferred notification frequency.'),
  timeOfDayDescription: z.string().describe('A descriptive string of the current time of day (e.g., "morning", "afternoon", "evening", "late night").'),
});
export type PersonalizeCounterReminderInput = z.infer<typeof PersonalizeCounterReminderInputSchema>;

export const PersonalizeCounterReminderOutputSchema = z.object({
  shouldSendReminder: z.boolean().describe('True if a reminder should be sent, false otherwise.'),
  reminderMessage: z.string().optional().describe('The personalized reminder message to send, if shouldSendReminder is true.'),
  suggestedFrequencyAdjustment: z.enum(['increase', 'decrease', 'keep_same', 'none']).optional().describe('A suggestion for adjusting the user\'s notification frequency based on their recent activity.'),
});
export type PersonalizeCounterReminderOutput = z.infer<typeof PersonalizeCounterReminderOutputSchema>;

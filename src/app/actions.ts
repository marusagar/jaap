'use server';

import { personalizeCounterReminder, PersonalizeCounterReminderInput } from '@/ai/flows/personalized-counter-reminders';
import { summarizeHistory, type SummarizeHistoryInput } from '@/ai/flows/summarize-history';

export async function getReminderSuggestion(input: PersonalizeCounterReminderInput) {
    try {
        const result = await personalizeCounterReminder(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting reminder suggestion:", error);
        return { success: false, error: "Failed to get suggestion from AI." };
    }
}

export async function getHistorySummary(input: SummarizeHistoryInput) {
    try {
        const result = await summarizeHistory(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting history summary:", error);
        return { success: false, error: "Failed to get summary from AI." };
    }
}

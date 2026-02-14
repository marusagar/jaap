'use server';

import { personalizeCounterReminder, PersonalizeCounterReminderInput } from '@/ai/flows/personalized-counter-reminders';

export async function getReminderSuggestion(input: PersonalizeCounterReminderInput) {
    try {
        const result = await personalizeCounterReminder(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting reminder suggestion:", error);
        return { success: false, error: "Failed to get suggestion from AI." };
    }
}

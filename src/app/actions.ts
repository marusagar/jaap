'use server';

import { personalizeCounterReminder, type PersonalizeCounterReminderInput } from '@/ai/flows/personalized-counter-reminders';
import { summarizeHistory, type SummarizeHistoryInput } from '@/ai/flows/summarize-history';

function checkApiKey() {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "REPLACE_WITH_YOUR_GOOGLE_AI_API_KEY") {
        return "The Google AI API key is not configured. Please add it to your .env file.";
    }
    return null;
}

export async function getReminderSuggestion(input: PersonalizeCounterReminderInput) {
    const apiKeyError = checkApiKey();
    if (apiKeyError) {
        return { success: false, error: apiKeyError };
    }
    try {
        const result = await personalizeCounterReminder(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting reminder suggestion:", error);
        return { success: false, error: "Failed to get suggestion from AI." };
    }
}

export async function getHistorySummary(input: SummarizeHistoryInput) {
    const apiKeyError = checkApiKey();
    if (apiKeyError) {
        return { success: false, error: apiKeyError };
    }
    try {
        const result = await summarizeHistory(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting history summary:", error);
        return { success: false, error: "Failed to get summary from AI." };
    }
}

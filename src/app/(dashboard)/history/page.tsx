
import { HistoryClient } from "@/components/history-client";
import { getHistory } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { HistoryEntry } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { unstable_noStore as noStore } from 'next/cache';

async function getHistoryData() {
    noStore();
    const user = auth.currentUser;
    if (!user) {
        return [];
    }
    const history = await getHistory(user.uid);
    // Serialize date objects for client component
    return history.map(entry => ({
        ...entry,
        date: entry.date.toDate().toISOString(),
    }));
}


export default async function HistoryPage() {
    const historyData = await getHistoryData();

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Your History</CardTitle>
                    <CardDescription>
                        A log of your past counting sessions, with a chart of your recent activity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryClient initialHistory={historyData} />
                </CardContent>
            </Card>
        </div>
    );
}

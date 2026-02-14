'use client';

import { HistoryClient } from "@/components/history-client";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HistoryPage() {
    const { user } = useUser();
    const db = useFirestore();

    const historyQuery = useMemoFirebase(() => {
        if (!user) return undefined;
        return query(
            collection(db, 'users', user.uid, 'history'),
            orderBy('date', 'desc'),
            limit(50)
        );
    }, [user, db]);

    const { data: historyData, isLoading } = useCollection(historyQuery);

    if (isLoading) {
        return (
            <div className="container mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Your History</CardTitle>
                        <CardDescription>
                            A log of your past counting sessions, with a chart of your recent activity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            <HistoryClient history={historyData || []} />
        </div>
    );
}

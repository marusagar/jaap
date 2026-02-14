'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { HistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { getHistorySummary } from '@/app/actions';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

// Convert Firestore Timestamp to Date for formatting
const toDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    // Fallback for when data is being serialized
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }
    return new Date(); // fallback
}

export function HistoryClient({ history }: { history: HistoryEntry[] }) {
  const { user } = useUser();
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const chartData = useMemo(() => {
    return history
      .slice(0, 10) // Get the 10 most recent sessions
      .reverse() // Order from oldest to newest for the chart
      .map((entry) => ({
        date: format(toDate(entry.date), 'MMM d'),
        count: entry.count,
      }));
  }, [history]);

  const handleGetSummary = async () => {
    setIsAiLoading(true);
    setAiSummary('');
    setAiError('');

    const historyForAi = history.map(h => ({
        // Ensure date is a string for the action
        date: toDate(h.date).toLocaleDateString(),
        count: h.count,
    })).slice(0, 20); // Limit to recent 20 entries for performance

    const res = await getHistorySummary({
        history: historyForAi,
        userName: user?.displayName || undefined,
    });

    if (res.success && res.data) {
        setAiSummary(res.data.summary);
    } else {
        setAiError(res.error || 'An unknown error occurred.');
    }
    setIsAiLoading(false);
  }
  
  if (history.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your History</CardTitle>
                <CardDescription>
                    A log of your past counting sessions, with a chart of your recent activity.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground p-8">No history yet. Complete a session to see it here.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Your History</CardTitle>
            <CardDescription>
                A log of your past counting sessions, with a chart of your recent activity.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <h3 className="text-lg font-medium mb-4 font-headline">AI-Powered Summary</h3>
                <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                    <Button onClick={handleGetSummary} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Summary
                    </Button>
                    {aiSummary && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>Your Progress Summary</AlertTitle>
                            <AlertDescription>
                                {aiSummary}
                            </AlertDescription>
                        </Alert>
                    )}
                    {aiError && (
                        <Alert variant="destructive">
                           <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {aiError}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {chartData.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-4 font-headline">Recent Activity</h3>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={30}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            )}

            <div>
                <h3 className="text-lg font-medium mb-4 font-headline">Full Log</h3>
                <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {history.map((entry) => (
                        <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                            {format(toDate(entry.date), 'MMMM d, yyyy, h:mm a')}
                        </TableCell>
                        <TableCell className="text-right font-mono">{entry.count}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

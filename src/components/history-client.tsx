
'use client';

import { useMemo } from 'react';
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

type SerializedHistoryEntry = Omit<HistoryEntry, 'date'> & { date: string };

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function HistoryClient({ initialHistory }: { initialHistory: SerializedHistoryEntry[] }) {
  const chartData = useMemo(() => {
    return initialHistory
      .slice(0, 10) // Get the 10 most recent sessions
      .reverse() // Order from oldest to newest for the chart
      .map((entry) => ({
        date: format(new Date(entry.date), 'MMM d'),
        count: entry.count,
      }));
  }, [initialHistory]);
  
  if (initialHistory.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No history yet. Complete a session to see it here.</p>;
  }

  return (
    <div className="space-y-8">
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
              {initialHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {format(new Date(entry.date), 'MMMM d, yyyy, h:mm a')}
                  </TableCell>
                  <TableCell className="text-right font-mono">{entry.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

import { CounterClient } from '@/components/counter-client';
import { Card, CardContent } from '@/components/ui/card';

export default function CounterPage() {
  return (
    <div className="container mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <CounterClient />
        </CardContent>
      </Card>
    </div>
  );
}

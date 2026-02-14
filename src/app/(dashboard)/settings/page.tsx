import { SettingsClient } from '@/components/settings-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Customize your JapCounter Pro experience.</CardDescription>
            </CardHeader>
            <CardContent>
                <SettingsClient />
            </CardContent>
        </Card>
    </div>
  );
}

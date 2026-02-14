'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth-provider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { UserData, UserSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from './theme-provider';
import { updateUserSettings } from '@/lib/firestore';
import { getReminderSuggestion } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

export function SettingsClient() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setSettings(data.settings);
          setTheme(data.settings.theme || 'system');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, setTheme]);

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (user && settings) {
      setSaving(true);
      await updateUserSettings(user.uid, settings);
      if(settings.theme) {
        setTheme(settings.theme)
      }
      setSaving(false);
      toast({ title: 'Settings Saved', description: 'Your preferences have been updated.' });
    }
  };

  const handleGetReminder = async () => {
    if (!user || !userData) {
      toast({ variant: "destructive", title: "Error", description: "User data not loaded."});
      return;
    }
    setAiLoading(true);

    const now = new Date();
    const lastActivityDate = userData.lastUpdated.toDate();
    const hoursSinceLastActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    const res = await getReminderSuggestion({
      userId: user.uid,
      currentCount: userData.counter,
      targetGoal: userData.target,
      hoursSinceLastActivity,
      notificationPreference: userData.settings.notifications,
      timeOfDayDescription: now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'
    });

    if (res.success && res.data) {
      if (res.data.shouldSendReminder) {
        toast({ title: "AI Reminder Suggestion", description: res.data.reminderMessage });
      } else {
        toast({ title: "AI Reminder Suggestion", description: "No reminder needed at this time." });
      }
    } else {
      toast({ variant: "destructive", title: "AI Error", description: res.error });
    }

    setAiLoading(false);
  }

  if (loading) {
    return <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium font-headline">Appearance</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="theme" className="flex flex-col space-y-1">
            <span>Theme</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Select the application theme.
            </span>
          </Label>
          <Select
            value={settings.theme}
            onValueChange={(value) => handleSettingsChange('theme', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium font-headline">Feedback</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="sound" className="flex flex-col space-y-1">
            <span>Sound Feedback</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Play a sound on each count.
            </span>
          </Label>
          <Switch
            id="sound"
            checked={settings.sound}
            onCheckedChange={(checked) => handleSettingsChange('sound', checked)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="vibration" className="flex flex-col space-y-1">
            <span>Vibration Feedback</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Vibrate on each count.
            </span>
          </Label>
          <Switch
            id="vibration"
            checked={settings.vibration}
            onCheckedChange={(checked) => handleSettingsChange('vibration', checked)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="notifications" className="flex flex-col space-y-1">
            <span>Reminder Frequency</span>
            <span className="font-normal leading-snug text-muted-foreground">
              How often to receive smart reminders.
            </span>
          </Label>
          <Select
            value={settings.notifications}
            onValueChange={(value) => handleSettingsChange('notifications', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subtle">Subtle</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>

      <Separator />

      <Card className="bg-secondary/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-accent"/>
                AI Reminder Assistant
            </CardTitle>
            <CardDescription>
                Test the GenAI-powered reminder system. Based on your activity and preferences, it suggests if a notification is needed.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" onClick={handleGetReminder} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
                Get Reminder Suggestion
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

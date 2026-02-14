import type { Timestamp } from 'firebase/firestore';

export type UserSettings = {
  vibration: boolean;
  sound: boolean;
  notifications: 'subtle' | 'regular' | 'urgent' | 'none';
  theme: 'light' | 'dark' | 'system';
};

export type UserData = {
  counter: number;
  target: number;
  lastUpdated: Timestamp;
  settings: UserSettings;
};

export type HistoryEntry = {
  userId: string;
  count: number;
  date: Timestamp;
};

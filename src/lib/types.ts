import type { Timestamp } from 'firebase/firestore';

export type UserSettings = {
  vibration: boolean;
  sound: boolean;
  notifications: 'subtle' | 'regular' | 'urgent' | 'none';
  theme: 'light' | 'dark' | 'system';
};

export type UserData = {
  id: string;
  counter: number;
  target: number;
  lastUpdated: any; // Can be Timestamp or FieldValue
  settings: UserSettings;
};

export type HistoryEntry = {
  id: string;
  userId: string;
  count: number;
  date: Timestamp;
};

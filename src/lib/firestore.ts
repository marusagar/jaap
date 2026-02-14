import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserData, UserSettings } from './types';

// These functions are now designed to be called from client components that have access to the Firestore instance.

export const initializeNewUser = (db: Firestore, user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const newUser: Omit<UserData, 'lastUpdated' | 'id'> = {
    counter: 0,
    target: 108,
    settings: {
      vibration: true,
      sound: true,
      notifications: 'regular',
      theme: 'system',
    },
  };
  return setDoc(userRef, {
    ...newUser,
    id: user.uid,
    lastUpdated: serverTimestamp(),
  });
};

export const updateUserCounter = (db: Firestore, userId: string, counter: number) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, { counter, lastUpdated: serverTimestamp() });
};

export const updateUserTarget = (db: Firestore, userId:string, target: number) => {
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, { target });
}

export const updateUserSettings = (db: Firestore, userId: string, settings: Partial<UserSettings>) => {
  const userRef = doc(db, 'users', userId);
  // To merge only settings, we need to use dot notation for nested objects
  const settingsUpdate: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(settings)) {
    settingsUpdate[`settings.${key}`] = value;
  }
  return updateDoc(userRef, settingsUpdate);
};

export const addHistoryEntry = (db: Firestore, userId: string, count: number) => {
  if (count === 0) return Promise.resolve();
  const historyCollection = collection(db, 'users', userId, 'history');
  const newEntry = {
    userId,
    count,
    date: serverTimestamp(),
  };
  return addDoc(historyCollection, newEntry);
};

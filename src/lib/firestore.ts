import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';
import type { UserData, HistoryEntry } from './types';

export const initializeNewUser = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: UserData = {
      counter: 0,
      target: 108,
      lastUpdated: serverTimestamp() as any, // Will be converted by Firestore
      settings: {
        vibration: true,
        sound: true,
        notifications: 'regular',
        theme: 'system',
      },
    };
    await setDoc(userRef, newUser);
  }
};

export const updateUserCounter = async (userId: string, counter: number) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { counter, lastUpdated: serverTimestamp() }, { merge: true });
};

export const updateUserTarget = async (userId:string, target: number) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { target }, { merge: true });
}

export const updateUserSettings = async (userId: string, settings: Partial<UserData['settings']>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { settings }, { merge: true });
};

export const addHistoryEntry = async (userId: string, count: number) => {
  if (count === 0) return;
  const historyCollection = collection(db, 'history');
  const newEntry: HistoryEntry = {
    userId,
    count,
    date: serverTimestamp() as any,
  };
  await addDoc(historyCollection, newEntry);
};

export const getHistory = async (userId: string): Promise<HistoryEntry[]> => {
  const historyCollection = collection(db, 'history');
  const q = query(historyCollection, where('userId', '==', userId), orderBy('date', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as HistoryEntry);
};

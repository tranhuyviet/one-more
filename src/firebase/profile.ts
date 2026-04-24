import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Profile, Language } from '@/types';

function profileRef(userId: string) {
  return doc(db, 'users', userId, 'data', 'profile');
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const snap = await getDoc(profileRef(userId));
  if (!snap.exists()) return null;
  return snap.data() as Profile;
}

export async function createProfile(
  userId: string,
  name: string,
  language: Language,
): Promise<void> {
  await setDoc(profileRef(userId), {
    userId,
    name,
    language,
    darkMode: false,
    createdAt: Date.now(),
  });
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'language' | 'darkMode'>>,
): Promise<void> {
  await updateDoc(profileRef(userId), updates);
}

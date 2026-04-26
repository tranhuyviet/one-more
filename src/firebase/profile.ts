import {
  doc, getDoc, setDoc, updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Profile, Language, AppearanceMode } from '@/types';

function profileRef(userId: string) {
  return doc(db, 'users', userId);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const snap = await getDoc(profileRef(userId));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  if (!data.name) return null;
  return data as Profile;
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
    darkMode: 'auto' as AppearanceMode,
    createdAt: Date.now(),
  }, { merge: true });
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'language' | 'darkMode'>>,
): Promise<void> {
  await updateDoc(profileRef(userId), updates);
}

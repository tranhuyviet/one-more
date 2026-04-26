import {
  doc, getDoc, setDoc, updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Profile, Language, AppearanceMode } from '@/types';

// Profile stored directly on the user document: users/{userId}
function profileRef(userId: string) {
  return doc(db, 'users', userId);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const snap = await getDoc(profileRef(userId));
  if (snap.exists()) {
    const data = snap.data() as any;
    if (data.name) {
      if (typeof data.darkMode === 'boolean') {
        data.darkMode = data.darkMode ? 'dark' : 'auto';
      }
      return data as Profile;
    }
  }

  // Migrate from old path: users/{userId}/data/profile
  const oldSnap = await getDoc(doc(db, 'users', userId, 'data', 'profile'));
  if (!oldSnap.exists()) return null;
  const data = oldSnap.data() as any;
  if (typeof data.darkMode === 'boolean') {
    data.darkMode = data.darkMode ? 'dark' : 'auto';
  }
  await setDoc(profileRef(userId), data, { merge: true });
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

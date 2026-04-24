import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';

export async function signInAnon(): Promise<User> {
  const { user } = await signInAnonymously(auth);
  return user;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

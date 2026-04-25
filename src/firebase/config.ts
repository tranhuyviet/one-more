import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, Persistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAjbAWEFA4RtNy1aUjBsD_m-Id5A4BpDuk',
  authDomain: 'one-more-2f360.firebaseapp.com',
  projectId: 'one-more-2f360',
  storageBucket: 'one-more-2f360.firebasestorage.app',
  messagingSenderId: '796543263702',
  appId: '1:796543263702:web:f64ba45acdc64dbb3c3a77',
};

// getReactNativePersistence is only in the RN bundle — Metro resolves it correctly at runtime
// but the TypeScript types entry in @firebase/auth exports map doesn't expose it
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => Persistence;
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getApps().length === 1
  ? initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })
  : getAuth(app);

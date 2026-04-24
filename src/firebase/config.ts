import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAjbAWEFA4RtNy1aUjBsD_m-Id5A4BpDuk',
  authDomain: 'one-more-2f360.firebaseapp.com',
  projectId: 'one-more-2f360',
  storageBucket: 'one-more-2f360.firebasestorage.app',
  messagingSenderId: '796543263702',
  appId: '1:796543263702:web:f64ba45acdc64dbb3c3a77',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

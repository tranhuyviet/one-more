import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const keyPath = join(__dirname, 'serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error('❌  serviceAccountKey.json not found.');
  console.error('   Go to Firebase Console → Project Settings → Service Accounts → Generate new private key');
  console.error(`   Save the file to: ${keyPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export const db = admin.firestore();

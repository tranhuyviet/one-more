import type { Firestore } from 'firebase-admin/firestore';

export interface Migration {
  id: string;
  name: string;
  description: string;
  up: (db: Firestore) => Promise<void>;
  down: (db: Firestore) => Promise<void>;
}

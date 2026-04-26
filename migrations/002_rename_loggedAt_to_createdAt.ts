import { FieldValue } from 'firebase-admin/firestore';
import type { Migration } from './types';

// Renames loggedAt → createdAt on all exercise_logs documents for consistency.

export const migration: Migration = {
  id: '002',
  name: 'rename_loggedAt_to_createdAt',
  description: 'Rename loggedAt → createdAt on exercise_logs to unify timestamp naming.',

  up: async (db) => {
    const users = await db.collection('users').listDocuments();
    let total = 0;
    for (const userRef of users) {
      const logs = await userRef.collection('exercise_logs').get();
      if (logs.empty) continue;
      const batch = db.batch();
      logs.docs.forEach(doc => {
        const data = doc.data();
        if ('loggedAt' in data) {
          batch.update(doc.ref, { createdAt: data.loggedAt, loggedAt: FieldValue.delete() });
          total++;
        }
      });
      await batch.commit();
    }
    console.log(`Updated ${total} exercise_log document(s).`);
  },

  down: async (db) => {
    const users = await db.collection('users').listDocuments();
    let total = 0;
    for (const userRef of users) {
      const logs = await userRef.collection('exercise_logs').get();
      if (logs.empty) continue;
      const batch = db.batch();
      logs.docs.forEach(doc => {
        const data = doc.data();
        if ('createdAt' in data) {
          batch.update(doc.ref, { loggedAt: data.createdAt, createdAt: FieldValue.delete() });
          total++;
        }
      });
      await batch.commit();
    }
    console.log(`Reverted ${total} exercise_log document(s).`);
  },
};

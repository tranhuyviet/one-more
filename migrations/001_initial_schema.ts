import type { Migration } from './types';

// Schema:
//   users/{userId}                    ← document (userId, name, language, darkMode, createdAt)
//   users/{userId}/exercises/{id}     ← subcollection
//   users/{userId}/exercise_logs/{id} ← subcollection
//   _migrations/{id}                  ← migration tracking (managed by runner)

export const migration: Migration = {
  id: '001',
  name: 'initial_schema',
  description:
    'Initial schema — profile fields on users/{userId} doc, exercises and exercise_logs as subcollections.',

  up: async (_db) => {
    // No-op: the app seeds this structure on first run (createProfile + seedDefaultExercises).
    console.log('Initial schema is created automatically by the app on first launch.');
  },

  down: async (db) => {
    // Deletes ALL user data. Use with extreme caution.
    const users = await db.collection('users').listDocuments();
    if (users.length === 0) { console.log('No users to delete.'); return; }
    const batch = db.batch();
    users.forEach(ref => batch.delete(ref));
    await batch.commit();
    console.log(`Deleted ${users.length} user document(s).`);
  },
};

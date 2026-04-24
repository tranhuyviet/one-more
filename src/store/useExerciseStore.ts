import { create } from 'zustand';
import { Exercise } from '@/types';
import {
  getExercises, addExercise, updateExercise,
  deleteExercise, seedDefaultExercises,
} from '@/firebase/exercises';
import { DEFAULT_EXERCISES } from '@/constants/defaultExercises';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  loadExercises: (userId: string) => Promise<void>;
  addExercise: (userId: string, exercise: Omit<Exercise, 'id'>) => Promise<void>;
  updateExercise: (userId: string, id: string, updates: Partial<Omit<Exercise, 'id'>>) => Promise<void>;
  deleteExercise: (userId: string, id: string) => Promise<void>;
  seedDefaults: (userId: string) => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loading: true,

  loadExercises: async (userId) => {
    let exercises = await getExercises(userId);
    if (exercises.length === 0) {
      const pushup = DEFAULT_EXERCISES[0];
      await seedDefaultExercises(userId, [{ ...pushup, createdAt: Date.now() }]);
      exercises = await getExercises(userId);
    }
    set({ exercises, loading: false });
  },

  addExercise: async (userId, exercise) => {
    const id = await addExercise(userId, exercise);
    set(s => ({ exercises: [...s.exercises, { id, ...exercise }] }));
  },

  updateExercise: async (userId, id, updates) => {
    await updateExercise(userId, id, updates);
    set(s => ({
      exercises: s.exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex),
    }));
  },

  deleteExercise: async (userId, id) => {
    await deleteExercise(userId, id);
    set(s => ({ exercises: s.exercises.filter(ex => ex.id !== id) }));
  },

  seedDefaults: async (userId) => {
    await seedDefaultExercises(
      userId,
      DEFAULT_EXERCISES.map(ex => ({ ...ex, createdAt: Date.now() })),
    );
    await get().loadExercises(userId);
  },
}));

import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  orderBy, query, setDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Exercise } from '@/types';

function exercisesCol(userId: string) {
  return collection(db, 'users', userId, 'exercises');
}

export async function getExercises(userId: string): Promise<Exercise[]> {
  const q = query(exercisesCol(userId), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
}

export async function addExercise(
  userId: string,
  exercise: Omit<Exercise, 'id'>,
): Promise<string> {
  const ref = await addDoc(exercisesCol(userId), exercise);
  return ref.id;
}

export async function updateExercise(
  userId: string,
  exerciseId: string,
  updates: Partial<Omit<Exercise, 'id'>>,
): Promise<void> {
  await updateDoc(doc(exercisesCol(userId), exerciseId), updates);
}

export async function deleteExercise(
  userId: string,
  exerciseId: string,
): Promise<void> {
  await deleteDoc(doc(exercisesCol(userId), exerciseId));
}

export async function seedDefaultExercises(
  userId: string,
  defaults: Omit<Exercise, 'id'>[],
): Promise<void> {
  const existing = await getExercises(userId);
  if (existing.length > 0) return;
  await Promise.all(defaults.map(ex => addDoc(exercisesCol(userId), ex)));
}

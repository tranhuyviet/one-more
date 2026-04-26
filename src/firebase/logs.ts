import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { ExerciseLog, DailyStats } from '@/types';
import { ExerciseLogSchema } from '@/schemas';

function logsCol(userId: string) {
  return collection(db, 'users', userId, 'exercise_logs');
}

export async function getLogs(
  userId: string,
  startMs: number,
  endMs: number,
): Promise<ExerciseLog[]> {
  const q = query(
    logsCol(userId),
    where('createdAt', '>=', startMs),
    where('createdAt', '<=', endMs),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.flatMap(d => {
    const result = ExerciseLogSchema.safeParse({ id: d.id, ...d.data() });
    if (!result.success) {
      console.warn('[Firebase] Invalid log doc:', d.id, result.error.issues);
      return [];
    }
    return [result.data as ExerciseLog];
  });
}

export async function getTodayLogs(userId: string): Promise<ExerciseLog[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return getLogs(userId, start.getTime(), end.getTime());
}

export async function addLog(
  userId: string,
  log: Omit<ExerciseLog, 'id'>,
): Promise<string> {
  const ref = await addDoc(logsCol(userId), log);
  return ref.id;
}

export async function deleteLog(
  userId: string,
  logId: string,
): Promise<void> {
  await deleteDoc(doc(logsCol(userId), logId));
}

export function aggregateDailyStats(
  logs: ExerciseLog[],
  date: string,
): DailyStats[] {
  const byExercise: Record<string, { total: number; sets: number; best: number }> = {};

  for (const log of logs) {
    const logDate = new Date(log.createdAt).toISOString().split('T')[0];
    if (logDate !== date) continue;
    if (!byExercise[log.exerciseId]) {
      byExercise[log.exerciseId] = { total: 0, sets: 0, best: 0 };
    }
    byExercise[log.exerciseId].total += log.value;
    byExercise[log.exerciseId].sets += 1;
    byExercise[log.exerciseId].best = Math.max(
      byExercise[log.exerciseId].best,
      log.value,
    );
  }

  return Object.entries(byExercise).map(([exerciseId, stats]) => ({
    date,
    exerciseId,
    ...stats,
  }));
}

export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDates(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

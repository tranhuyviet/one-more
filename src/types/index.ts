export type Language = 'vi' | 'en';
export type Unit = 'reps' | 'duration' | 'distance';

export interface Profile {
  userId: string;
  name: string;
  language: Language;
  darkMode: boolean;
  createdAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  icon: string;
  unit: Unit;
  color: string;
  muscleGroup?: string;
  dailyGoal?: number;
  sortOrder: number;
  createdAt: number;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  value: number;
  note: string;
  loggedAt: number;
}

export interface DailyStats {
  date: string;
  exerciseId: string;
  total: number;
  sets: number;
  best: number;
}

export interface WeeklyStats {
  weekStart: string;
  exerciseId: string;
  total: number;
  activeDays: number;
}

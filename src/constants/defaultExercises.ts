import { Exercise } from '@/types';

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  {
    name: 'Hít đất',
    icon: '💪',
    unit: 'reps',
    color: '#0F7A3A',
    muscleGroup: 'Ngực / Vai',
    sortOrder: 0,
  },
  {
    name: 'Nhảy dây',
    icon: '⚡',
    unit: 'reps',
    color: '#C89A1A',
    muscleGroup: 'Cardio',
    sortOrder: 1,
  },
];

export const EXERCISE_ICON_OPTIONS = [
  '💪', '🏋️', '🦵', '🔥', '⚡', '🏃',
  '🚴', '🧘', '🤸', '🏊', '⏱️', '🚶',
  '🥊', '🧗', '🤼', '🏇', '🎾', '⛹️',
];

export const EXERCISE_COLOR_OPTIONS = [
  '#0F7A3A', '#C89A1A', '#8B4CB8',
  '#C55A3A', '#2E8BC0', '#D94B6B',
];

export const SUGGESTED_EXERCISES = [
  { icon: '🏋️', name: 'Kéo xà' },
  { icon: '🧘', name: 'Yoga' },
  { icon: '🏃', name: 'Chạy bộ' },
  { icon: '🚴', name: 'Đạp xe' },
  { icon: '🔥', name: 'Gập bụng' },
  { icon: '🤸', name: 'Burpee' },
];

export const QUICK_PICK_VALUES = {
  reps: [5, 10, 15, 20, 25, 30],
  duration: [15, 30, 45, 60, 90, 120],
  distance: [100, 200, 500, 1000, 2000, 5000],
};

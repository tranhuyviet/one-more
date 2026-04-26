import { Exercise } from '@/types';

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  {
    name: 'Chống đẩy',
    icon: '💪',
    unit: 'reps',
    color: '#0F7A3A',
    muscleGroup: 'Ngực / Vai',
    sortOrder: 0,
  },
  {
    name: 'Nhảy dây',
    icon: '🤸',
    unit: 'reps',
    color: '#C89A1A',
    muscleGroup: 'Toàn thân',
    sortOrder: 1,
  },
];

export const EXERCISE_ICON_OPTIONS = [
  '💪', '🏋️', '🦵', '🔥', '⚡', '🏃',
  '🚴', '🧘', '🤸', '🏊', '⏱️', '🚶',
  '🥊', '🧗', '🤼', '🏇', '🎾', '⛹️',
  '🥋', '🏸', '🚣', '💃', '🤾', '🏐',
];

export const EXERCISE_COLOR_OPTIONS = [
  '#0F7A3A', '#5FBF60', '#2E8BC0', '#4A90D9', '#8B4CB8', '#C06BBD', '#D94B6B',
  '#C55A3A', '#E8873A', '#C89A1A', '#A8B400', '#5BA08A', '#7B7B7B', '#3D3D3D',
];

export const SUGGESTED_EXERCISES = [
  { icon: '🏋️', name: 'Kéo xà' },
  { icon: '🧘', name: 'Yoga' },
  { icon: '🏃', name: 'Chạy bộ' },
  { icon: '🚴', name: 'Đạp xe' },
  { icon: '🔥', name: 'Gập bụng' },
  { icon: '🤸', name: 'Burpee' },
];

export const QUICK_PICK_VALUES: Record<string, number[]> = {
  reps:     [5, 10, 15, 20, 25, 30],
  duration: [15, 30, 45, 60, 90, 120],  // giây — backward compat
  minutes:  [5, 10, 15, 20, 30, 45],
  distance: [50, 100, 200, 400, 800, 1000],  // mét — backward compat
  km:       [1, 2, 3, 5, 10, 15],
};

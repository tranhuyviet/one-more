import { z } from 'zod';

export const UnitSchema = z.enum(['reps', 'duration', 'distance', 'minutes', 'km']);

export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tên bài tập không được để trống').max(50),
  icon: z.string().min(1),
  unit: UnitSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Màu không hợp lệ'),
  muscleGroup: z.string().optional(),
  dailyGoal: z.number().int().positive().optional(),
  quickPicks: z.array(z.number().int().positive()).min(1).max(6).optional(),
  sortOrder: z.number().int().min(0),
  createdAt: z.number().positive(),
});

export const ExerciseLogSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  value: z.number().positive('Giá trị phải lớn hơn 0'),
  note: z.string().max(200),
  createdAt: z.number().positive(),
});

export const ProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, 'Tên không được để trống').max(50),
  language: z.enum(['vi', 'en']),
  darkMode: z.enum(['auto', 'light', 'dark']),
  createdAt: z.number().positive(),
});

// Input schemas (không cần id/createdAt khi tạo mới)
export const CreateExerciseInputSchema = ExerciseSchema.omit({ id: true, createdAt: true });
export const CreateLogInputSchema = ExerciseLogSchema.omit({ id: true, createdAt: true });

// Inferred types — dùng thay thế types/index.ts
export type Unit = z.infer<typeof UnitSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseLog = z.infer<typeof ExerciseLogSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type CreateExerciseInput = z.infer<typeof CreateExerciseInputSchema>;
export type CreateLogInput = z.infer<typeof CreateLogInputSchema>;

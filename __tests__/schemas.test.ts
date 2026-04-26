import {
  ExerciseSchema,
  ExerciseLogSchema,
  ProfileSchema,
  CreateExerciseInputSchema,
} from '../src/schemas';

const validExercise = {
  id: 'ex1',
  name: 'Chống đẩy',
  icon: '💪',
  unit: 'reps' as const,
  color: '#0F7A3A',
  sortOrder: 0,
  createdAt: Date.now(),
};

describe('ExerciseSchema', () => {
  it('accepts valid exercise', () => {
    expect(ExerciseSchema.safeParse(validExercise).success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = ExerciseSchema.safeParse({ ...validExercise, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name over 50 chars', () => {
    const result = ExerciseSchema.safeParse({ ...validExercise, name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid unit', () => {
    const result = ExerciseSchema.safeParse({ ...validExercise, unit: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid units', () => {
    const units = ['reps', 'duration', 'distance', 'minutes', 'km'] as const;
    units.forEach(unit => {
      expect(ExerciseSchema.safeParse({ ...validExercise, unit }).success).toBe(true);
    });
  });

  it('rejects invalid hex color', () => {
    const cases = ['red', '#GGG', '#12345', 'rgba(0,0,0,1)'];
    cases.forEach(color => {
      expect(ExerciseSchema.safeParse({ ...validExercise, color }).success).toBe(false);
    });
  });

  it('accepts both uppercase and lowercase hex', () => {
    expect(ExerciseSchema.safeParse({ ...validExercise, color: '#0f7a3a' }).success).toBe(true);
    expect(ExerciseSchema.safeParse({ ...validExercise, color: '#0F7A3A' }).success).toBe(true);
  });

  it('accepts quickPicks with 1-6 positive integers', () => {
    expect(ExerciseSchema.safeParse({ ...validExercise, quickPicks: [5, 10, 15, 20, 25, 30] }).success).toBe(true);
    expect(ExerciseSchema.safeParse({ ...validExercise, quickPicks: [10] }).success).toBe(true);
  });

  it('rejects quickPicks with 0 or negative values', () => {
    expect(ExerciseSchema.safeParse({ ...validExercise, quickPicks: [0, 10, 15] }).success).toBe(false);
    expect(ExerciseSchema.safeParse({ ...validExercise, quickPicks: [-5, 10] }).success).toBe(false);
  });

  it('rejects quickPicks with more than 6 items', () => {
    expect(ExerciseSchema.safeParse({ ...validExercise, quickPicks: [1,2,3,4,5,6,7] }).success).toBe(false);
  });

  it('rejects negative sortOrder', () => {
    expect(ExerciseSchema.safeParse({ ...validExercise, sortOrder: -1 }).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { name: _, ...withoutName } = validExercise;
    expect(ExerciseSchema.safeParse(withoutName).success).toBe(false);
  });
});

describe('ExerciseLogSchema', () => {
  const validLog = {
    id: 'log1',
    exerciseId: 'ex1',
    value: 25,
    note: '',
    createdAt: Date.now(),
  };

  it('accepts valid log', () => {
    expect(ExerciseLogSchema.safeParse(validLog).success).toBe(true);
  });

  it('rejects value = 0', () => {
    expect(ExerciseLogSchema.safeParse({ ...validLog, value: 0 }).success).toBe(false);
  });

  it('rejects negative value', () => {
    expect(ExerciseLogSchema.safeParse({ ...validLog, value: -10 }).success).toBe(false);
  });

  it('rejects note over 200 chars', () => {
    expect(ExerciseLogSchema.safeParse({ ...validLog, note: 'a'.repeat(201) }).success).toBe(false);
  });

  it('accepts note at exactly 200 chars', () => {
    expect(ExerciseLogSchema.safeParse({ ...validLog, note: 'a'.repeat(200) }).success).toBe(true);
  });

  it('rejects empty exerciseId', () => {
    expect(ExerciseLogSchema.safeParse({ ...validLog, exerciseId: '' }).success).toBe(false);
  });
});

describe('ProfileSchema', () => {
  const validProfile = {
    userId: 'user1',
    name: 'Viet',
    language: 'vi' as const,
    darkMode: 'auto' as const,
    createdAt: Date.now(),
  };

  it('accepts valid profile', () => {
    expect(ProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('rejects unsupported language', () => {
    expect(ProfileSchema.safeParse({ ...validProfile, language: 'fr' }).success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(ProfileSchema.safeParse({ ...validProfile, name: '' }).success).toBe(false);
  });

  it('rejects invalid darkMode', () => {
    expect(ProfileSchema.safeParse({ ...validProfile, darkMode: 'night' }).success).toBe(false);
  });
});

describe('CreateExerciseInputSchema', () => {
  it('does not require id or createdAt', () => {
    const input = {
      name: 'Squat',
      icon: '🦵',
      unit: 'reps' as const,
      color: '#8B4CB8',
      sortOrder: 1,
    };
    expect(CreateExerciseInputSchema.safeParse(input).success).toBe(true);
  });
});

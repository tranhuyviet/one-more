import { computePeriodStats, computeBestInPeriod, computeDiffPercent, getActiveDays } from '../src/utils/statsUtils';
import { ExerciseLog } from '../src/schemas';

function makeLog(overrides: Partial<ExerciseLog> & { createdAt: number; value: number }): ExerciseLog {
  return {
    id: `log-${Math.random()}`,
    exerciseId: 'ex1',
    note: '',
    ...overrides,
  };
}

function dateMs(y: number, m: number, d: number, h = 12): number {
  return new Date(y, m - 1, d, h).getTime();
}

describe('computePeriodStats', () => {
  it('returns zeros for empty logs', () => {
    const stats = computePeriodStats([], 7);
    expect(stats.total).toBe(0);
    expect(stats.avg).toBe(0);
  });

  it('calculates total correctly', () => {
    const logs = [makeLog({ createdAt: dateMs(2026,4,20), value: 30 }),
                  makeLog({ createdAt: dateMs(2026,4,21), value: 20 })];
    expect(computePeriodStats(logs, 7).total).toBe(50);
  });

  it('rounds avg to nearest integer', () => {
    const logs = [makeLog({ createdAt: dateMs(2026,4,20), value: 10 })];
    const stats = computePeriodStats(logs, 7);
    expect(stats.avg).toBe(1); // 10/7 ≈ 1.43 → rounded to 1
  });

  it('avg = 0 when no logs', () => {
    expect(computePeriodStats([], 30).avg).toBe(0);
  });
});

describe('computeBestInPeriod (week)', () => {
  const now = new Date(2026, 3, 26); // CN 26/04/2026

  it('returns 0 for empty logs', () => {
    expect(computeBestInPeriod([], 'week', 0, now)).toBe(0);
  });

  it('returns best single day total', () => {
    const logs = [
      makeLog({ createdAt: dateMs(2026,4,20), value: 30 }), // Mon
      makeLog({ createdAt: dateMs(2026,4,20), value: 20 }), // Mon (2nd set)
      makeLog({ createdAt: dateMs(2026,4,21), value: 10 }), // Tue
    ];
    expect(computeBestInPeriod(logs, 'week', 0, now)).toBe(50); // Mon total = 50
  });

  it('returns best when single day has all logs', () => {
    const logs = [makeLog({ createdAt: dateMs(2026,4,26), value: 100 })];
    expect(computeBestInPeriod(logs, 'week', 0, now)).toBe(100);
  });
});

describe('computeBestInPeriod (month)', () => {
  const now = new Date(2026, 3, 26);

  it('returns best day in April', () => {
    const logs = [
      makeLog({ createdAt: dateMs(2026,4,1), value: 50 }),
      makeLog({ createdAt: dateMs(2026,4,15), value: 80 }),
      makeLog({ createdAt: dateMs(2026,4,15), value: 30 }), // same day
      makeLog({ createdAt: dateMs(2026,4,26), value: 20 }),
    ];
    expect(computeBestInPeriod(logs, 'month', 0, now)).toBe(110); // Apr 15 = 80+30
  });
});

describe('computeBestInPeriod (year)', () => {
  const now = new Date(2026, 3, 26);

  it('returns best month total', () => {
    const logs = [
      makeLog({ createdAt: dateMs(2026,1,15), value: 200 }), // Jan
      makeLog({ createdAt: dateMs(2026,4,10), value: 500 }), // Apr
      makeLog({ createdAt: dateMs(2026,4,20), value: 100 }), // Apr
    ];
    expect(computeBestInPeriod(logs, 'year', 0, now)).toBe(600); // Apr = 600
  });
});

describe('computeDiffPercent', () => {
  it('calculates positive percentage', () => {
    expect(computeDiffPercent(120, 100)).toBe(20);
  });

  it('calculates negative percentage', () => {
    expect(computeDiffPercent(80, 100)).toBe(-20);
  });

  it('returns 0 when prev is 0', () => {
    expect(computeDiffPercent(100, 0)).toBe(0);
  });

  it('returns 0 when both are 0', () => {
    expect(computeDiffPercent(0, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(computeDiffPercent(115, 100)).toBe(15);
    expect(computeDiffPercent(133, 100)).toBe(33);
  });
});

describe('computeBestInPeriod default parameter', () => {
  it('uses current date when now not provided', () => {
    const logs = [makeLog({ createdAt: Date.now(), value: 50 })];
    // Just verify it runs without error and returns a non-negative number
    expect(computeBestInPeriod(logs, 'week', 0)).toBeGreaterThanOrEqual(0);
  });
});

describe('getActiveDays', () => {
  it('returns 0 for empty logs', () => {
    expect(getActiveDays([])).toBe(0);
  });

  it('counts unique days (not sets)', () => {
    const logs = [
      makeLog({ createdAt: dateMs(2026,4,20), value: 10 }),
      makeLog({ createdAt: dateMs(2026,4,20,14), value: 20 }), // same day different time
      makeLog({ createdAt: dateMs(2026,4,21), value: 30 }),
    ];
    expect(getActiveDays(logs)).toBe(2);
  });

  it('counts each day once regardless of exercise', () => {
    const logs = [
      makeLog({ createdAt: dateMs(2026,4,26), value: 10, exerciseId: 'ex1' }),
      makeLog({ createdAt: dateMs(2026,4,26), value: 50, exerciseId: 'ex2' }),
    ];
    expect(getActiveDays(logs)).toBe(1);
  });
});

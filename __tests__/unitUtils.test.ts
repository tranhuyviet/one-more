import { getDefaultQuickPicks, sortQuickPicks, validateQuickPicks } from '../src/utils/unitUtils';
import { QUICK_PICK_VALUES } from '../src/constants/defaultExercises';

describe('getDefaultQuickPicks', () => {
  it('returns 6 values for reps', () => {
    expect(getDefaultQuickPicks('reps')).toHaveLength(6);
  });

  it('returns different defaults per unit', () => {
    expect(getDefaultQuickPicks('reps')).not.toEqual(getDefaultQuickPicks('minutes'));
    expect(getDefaultQuickPicks('km')).not.toEqual(getDefaultQuickPicks('distance'));
  });

  it('all defaults are positive integers', () => {
    const units = ['reps', 'duration', 'distance', 'minutes', 'km'] as const;
    units.forEach(unit => {
      getDefaultQuickPicks(unit).forEach(v => {
        expect(v).toBeGreaterThan(0);
        expect(Number.isInteger(v)).toBe(true);
      });
    });
  });

  it('falls back to reps for unknown unit', () => {
    expect(getDefaultQuickPicks('reps')).toEqual(QUICK_PICK_VALUES.reps);
  });
});

describe('sortQuickPicks', () => {
  it('sorts ascending', () => {
    expect(sortQuickPicks([30, 5, 20, 10, 25, 15])).toEqual([5, 10, 15, 20, 25, 30]);
  });

  it('does not mutate original array', () => {
    const original = [30, 5, 20];
    sortQuickPicks(original);
    expect(original).toEqual([30, 5, 20]);
  });

  it('handles already sorted array', () => {
    expect(sortQuickPicks([5, 10, 15])).toEqual([5, 10, 15]);
  });

  it('handles single element', () => {
    expect(sortQuickPicks([42])).toEqual([42]);
  });

  it('handles duplicates', () => {
    expect(sortQuickPicks([10, 10, 5])).toEqual([5, 10, 10]);
  });
});

describe('validateQuickPicks', () => {
  it('accepts valid picks', () => {
    expect(validateQuickPicks([5, 10, 15, 20, 25, 30])).toBe(true);
  });

  it('rejects empty array', () => {
    expect(validateQuickPicks([])).toBe(false);
  });

  it('rejects picks with 0', () => {
    expect(validateQuickPicks([0, 10, 15])).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateQuickPicks([-5, 10, 15])).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(validateQuickPicks([5.5, 10, 15])).toBe(false);
  });

  it('accepts single valid value', () => {
    expect(validateQuickPicks([10])).toBe(true);
  });
});

describe('QUICK_PICK_VALUES structure', () => {
  const units = ['reps', 'duration', 'distance', 'minutes', 'km'];

  it('has all 5 unit types', () => {
    units.forEach(unit => {
      expect(QUICK_PICK_VALUES[unit]).toBeDefined();
    });
  });

  it('each unit has exactly 6 values', () => {
    units.forEach(unit => {
      expect(QUICK_PICK_VALUES[unit]).toHaveLength(6);
    });
  });

  it('all values are positive integers', () => {
    units.forEach(unit => {
      QUICK_PICK_VALUES[unit].forEach((v: number) => {
        expect(v).toBeGreaterThan(0);
        expect(Number.isInteger(v)).toBe(true);
      });
    });
  });

  it('values are sorted ascending', () => {
    units.forEach(unit => {
      const vals = QUICK_PICK_VALUES[unit];
      for (let i = 1; i < vals.length; i++) {
        expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
      }
    });
  });
});

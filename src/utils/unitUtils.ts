import { Unit } from '@/schemas';
import { QUICK_PICK_VALUES } from '@/constants/defaultExercises';

export function getUnitShortLabel(unit: Unit, t: {
  reps: string; seconds: string; minutes: string; km: string; meters: string;
}): string {
  switch (unit) {
    case 'reps':     return t.reps;
    case 'duration': return t.seconds;
    case 'minutes':  return t.minutes;
    case 'km':       return t.km;
    case 'distance': return t.meters;
  }
}

export function getDefaultQuickPicks(unit: Unit): number[] {
  return QUICK_PICK_VALUES[unit] ?? QUICK_PICK_VALUES.reps;
}

export function sortQuickPicks(picks: number[]): number[] {
  return [...picks].sort((a, b) => a - b);
}

export function validateQuickPicks(picks: number[]): boolean {
  return picks.length > 0 && picks.every(p => Number.isInteger(p) && p > 0);
}

import { ExerciseLog } from '@/schemas';
import { getDateString, getWeekDates, TimeRange } from '@/utils/dateUtils';

export interface PeriodStats {
  total: number;
  avg: number;
  best: number;
}

export function computePeriodStats(
  logs: ExerciseLog[],
  periodCount: number,
): PeriodStats {
  const total = logs.reduce((s, l) => s + l.value, 0);
  const avg = total > 0 ? Math.round(total / periodCount) : 0;
  return { total, avg, best: 0 };
}

export function computeBestInPeriod(
  logs: ExerciseLog[],
  range: TimeRange,
  offset: number,
  now = new Date(),
): number {
  if (logs.length === 0) return 0;

  if (range === 'week') {
    const base = new Date(getWeekDates(now)[0]);
    base.setDate(base.getDate() + offset * 7);
    const weekDs = getWeekDates(base);
    const dailyTotals = weekDs.map(d => {
      const ds = getDateString(d);
      return logs
        .filter(l => getDateString(new Date(l.createdAt)) === ds)
        .reduce((s, l) => s + l.value, 0);
    });
    return Math.max(0, ...dailyTotals);
  }

  if (range === 'month') {
    const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    let best = 0;
    for (let i = 1; i <= days; i++) {
      const ds = getDateString(new Date(ref.getFullYear(), ref.getMonth(), i));
      const dayTotal = logs
        .filter(l => getDateString(new Date(l.createdAt)) === ds)
        .reduce((s, l) => s + l.value, 0);
      if (dayTotal > best) best = dayTotal;
    }
    return best;
  }

  // year: best month
  const y = now.getFullYear() + offset;
  let best = 0;
  for (let m = 0; m < 12; m++) {
    const monthTotal = logs
      .filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .reduce((s, l) => s + l.value, 0);
    if (monthTotal > best) best = monthTotal;
  }
  return best;
}

export function computeDiffPercent(current: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((current - prev) / prev) * 100);
}

export function getActiveDays(logs: ExerciseLog[]): number {
  return new Set(logs.map(l => getDateString(new Date(l.createdAt)))).size;
}

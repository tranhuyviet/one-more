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

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export type TimeRange = 'week' | 'month' | 'year';

export interface PeriodBounds {
  startMs: number;
  endMs: number;
}

export function getCurrentPeriodBounds(range: TimeRange, offset: number, now = new Date()): PeriodBounds {
  if (range === 'week') {
    const base = new Date(getWeekDates(now)[0]);
    base.setDate(base.getDate() + offset * 7);
    const weekDs = getWeekDates(base);
    const start = new Date(weekDs[0]); start.setHours(0, 0, 0, 0);
    const end = new Date(weekDs[6]); end.setHours(23, 59, 59, 999);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }
  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }
  const y = now.getFullYear() + offset;
  const start = new Date(y, 0, 1); start.setHours(0, 0, 0, 0);
  const end = new Date(y, 11, 31); end.setHours(23, 59, 59, 999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

export function getPeriodCount(range: TimeRange, offset: number, now = new Date()): number {
  if (range === 'week') return 7;
  if (range === 'month') return getDaysInMonth(now.getFullYear(), now.getMonth() + offset);
  return getDaysInYear(now.getFullYear() + offset);
}

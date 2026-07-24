import { MONTH_NAMES } from './constants';

export function toMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

export function normalizeMonthDate(date: Date): Date {
  return toMonthStart(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]}/${year}`;
}

export function addMonths(base: Date, increment: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + increment, 1));
}

export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

export function monthDiff(start: Date, end: Date): number {
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

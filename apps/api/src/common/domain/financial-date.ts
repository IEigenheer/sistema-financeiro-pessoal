import { normalizeMonthStart } from '@finance/config';

export function parseLocalDate(value: string): Date {
  const [year, month, day] = splitDate(value);
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid local date: ${value}`);
  }

  return date;
}

export function formatLocalDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function monthStartFromDate(value: string): string {
  return normalizeMonthStart(value);
}

export function parseMonthStart(value: string): Date {
  return parseLocalDate(normalizeMonthStart(value));
}

export function formatMonthStart(value: Date): string {
  return normalizeMonthStart(formatLocalDate(value));
}

export function addMonths(monthStart: string, count: number): string {
  const [year, month] = splitDate(monthStart).slice(0, 2) as [string, string];
  const date = new Date(Date.UTC(Number(year), Number(month) - 1 + count, 1));
  return `${date.getUTCFullYear().toString().padStart(4, '0')}-${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-01`;
}

export function compareMonthStarts(left: string, right: string): number {
  return left.localeCompare(right);
}

export function lastDayOfMonth(monthStart: string): string {
  const [year, month] = splitDate(monthStart).slice(0, 2) as [string, string];
  const date = new Date(Date.UTC(Number(year), Number(month), 0));
  return formatLocalDate(date);
}

export function clampDayToMonth(monthStart: string, day: number): string {
  const [year, month] = splitDate(monthStart).slice(0, 2) as [string, string];
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  const clampedDay = Math.min(Math.max(day, 1), lastDay);
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${clampedDay.toString().padStart(2, '0')}`;
}

function splitDate(value: string): [string, string, string] {
  const parts = value.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid local date: ${value}`);
  }

  const [year, month, day] = parts as [string, string, string];
  if (!year || !month || !day) {
    throw new Error(`Invalid local date: ${value}`);
  }

  return [year, month, day];
}

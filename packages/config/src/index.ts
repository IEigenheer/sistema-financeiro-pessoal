export const DEFAULT_LOCALE = 'pt-BR';
export const DEFAULT_CURRENCY = 'BRL';
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export const MONETARY_SCALE = 2;
export const RATE_SCALE = 8;

export function normalizeMonthStart(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date format: ${value}`);
  }

  const [year, month] = value.split('-');
  return `${year}-${month}-01`;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return roundCurrency(Number(value));
}

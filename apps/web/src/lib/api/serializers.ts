export function serializeLocalDate(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

export function serializeMoney(value: string): string {
  return value;
}

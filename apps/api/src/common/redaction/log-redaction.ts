const REDACTED = '[REDACTED]';

export function redactSensitiveValue(value: string): string {
  return value.replace(/(password|token|secret|authorization)\s*[:=]\s*[^,\s]+/gi, `$1=${REDACTED}`);
}

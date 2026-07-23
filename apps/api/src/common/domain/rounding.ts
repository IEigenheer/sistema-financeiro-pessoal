export function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new Error('Denominator must be positive.');
  }

  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder === 0n) {
    return quotient;
  }

  const doubled = remainder * 2n;
  const isNegative = numerator < 0n;
  if ((!isNegative && doubled >= denominator) || (isNegative && doubled <= -denominator)) {
    return quotient + (isNegative ? -1n : 1n);
  }

  return quotient;
}

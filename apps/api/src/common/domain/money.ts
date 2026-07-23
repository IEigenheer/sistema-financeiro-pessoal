import { roundHalfUp } from './rounding';

const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{2})?$/;
const RATE_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;

export type MoneyString = string;
export type RateString = string;

export function normalizeMoneyString(value: string): MoneyString {
  if (!MONEY_PATTERN.test(value)) {
    throw new Error(`Invalid money string: ${value}`);
  }

  const [integerPart, decimalPart] = splitDecimal(value, 2);
  return `${stripLeadingZeros(integerPart)}.${decimalPart}`;
}

export function normalizeRateString(value: string): RateString {
  if (!RATE_PATTERN.test(value)) {
    throw new Error(`Invalid rate string: ${value}`);
  }

  const [integerPart, decimalPart] = splitDecimal(value, 8);
  return `${stripLeadingZeros(integerPart)}.${decimalPart}`;
}

export function moneyStringToMinorUnits(value: string): bigint {
  const normalized = normalizeMoneyString(value);
  const [integerPart, decimalPart] = normalized.split('.') as [string, string];
  return BigInt(integerPart) * 100n + BigInt(decimalPart);
}

export function minorUnitsToMoneyString(value: bigint): MoneyString {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const integerPart = absolute / 100n;
  const decimalPart = absolute % 100n;
  return `${negative ? '-' : ''}${integerPart.toString()}.${decimalPart.toString().padStart(2, '0')}`;
}

export function rateStringToScaledUnits(value: string): bigint {
  const normalized = normalizeRateString(value);
  const [integerPart, decimalPart] = normalized.split('.') as [string, string];
  return BigInt(integerPart) * 100000000n + BigInt(decimalPart);
}

export function multiplyMoneyByRate(money: string, rate: string): MoneyString {
  const moneyMinorUnits = moneyStringToMinorUnits(money);
  const rateScaledUnits = rateStringToScaledUnits(rate);
  const numerator = moneyMinorUnits * rateScaledUnits;
  const denominator = 100000000n;
  return minorUnitsToMoneyString(roundHalfUp(numerator, denominator));
}

export function addMoneyStrings(left: string, right: string): MoneyString {
  return minorUnitsToMoneyString(moneyStringToMinorUnits(left) + moneyStringToMinorUnits(right));
}

export function subtractMoneyStrings(left: string, right: string): MoneyString {
  return minorUnitsToMoneyString(moneyStringToMinorUnits(left) - moneyStringToMinorUnits(right));
}

export function isPositiveMoneyString(value: string): boolean {
  return MONEY_PATTERN.test(value) && moneyStringToMinorUnits(value) > 0n;
}

function splitDecimal(value: string, scale: number): [string, string] {
  const [integerPart, decimalPart = ''] = value.split('.');
  if (!integerPart) {
    throw new Error(`Invalid decimal string: ${value}`);
  }

  return [integerPart, decimalPart.padEnd(scale, '0').slice(0, scale)];
}

function stripLeadingZeros(value: string): string {
  const stripped = value.replace(/^0+(?=\d)/, '');
  return stripped.length > 0 ? stripped : '0';
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMoneyString = normalizeMoneyString;
exports.normalizeRateString = normalizeRateString;
exports.moneyStringToMinorUnits = moneyStringToMinorUnits;
exports.minorUnitsToMoneyString = minorUnitsToMoneyString;
exports.rateStringToScaledUnits = rateStringToScaledUnits;
exports.multiplyMoneyByRate = multiplyMoneyByRate;
exports.addMoneyStrings = addMoneyStrings;
exports.subtractMoneyStrings = subtractMoneyStrings;
exports.isPositiveMoneyString = isPositiveMoneyString;
const rounding_1 = require("./rounding");
const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{2})?$/;
const RATE_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;
function normalizeMoneyString(value) {
    if (!MONEY_PATTERN.test(value)) {
        throw new Error(`Invalid money string: ${value}`);
    }
    const [integerPart, decimalPart] = splitDecimal(value, 2);
    return `${stripLeadingZeros(integerPart)}.${decimalPart}`;
}
function normalizeRateString(value) {
    if (!RATE_PATTERN.test(value)) {
        throw new Error(`Invalid rate string: ${value}`);
    }
    const [integerPart, decimalPart] = splitDecimal(value, 8);
    return `${stripLeadingZeros(integerPart)}.${decimalPart}`;
}
function moneyStringToMinorUnits(value) {
    const normalized = normalizeMoneyString(value);
    const [integerPart, decimalPart] = normalized.split('.');
    return BigInt(integerPart) * 100n + BigInt(decimalPart);
}
function minorUnitsToMoneyString(value) {
    const negative = value < 0n;
    const absolute = negative ? -value : value;
    const integerPart = absolute / 100n;
    const decimalPart = absolute % 100n;
    return `${negative ? '-' : ''}${integerPart.toString()}.${decimalPart.toString().padStart(2, '0')}`;
}
function rateStringToScaledUnits(value) {
    const normalized = normalizeRateString(value);
    const [integerPart, decimalPart] = normalized.split('.');
    return BigInt(integerPart) * 100000000n + BigInt(decimalPart);
}
function multiplyMoneyByRate(money, rate) {
    const moneyMinorUnits = moneyStringToMinorUnits(money);
    const rateScaledUnits = rateStringToScaledUnits(rate);
    const numerator = moneyMinorUnits * rateScaledUnits;
    const denominator = 100000000n;
    return minorUnitsToMoneyString((0, rounding_1.roundHalfUp)(numerator, denominator));
}
function addMoneyStrings(left, right) {
    return minorUnitsToMoneyString(moneyStringToMinorUnits(left) + moneyStringToMinorUnits(right));
}
function subtractMoneyStrings(left, right) {
    return minorUnitsToMoneyString(moneyStringToMinorUnits(left) - moneyStringToMinorUnits(right));
}
function isPositiveMoneyString(value) {
    return MONEY_PATTERN.test(value) && moneyStringToMinorUnits(value) > 0n;
}
function splitDecimal(value, scale) {
    const [integerPart, decimalPart = ''] = value.split('.');
    if (!integerPart) {
        throw new Error(`Invalid decimal string: ${value}`);
    }
    return [integerPart, decimalPart.padEnd(scale, '0').slice(0, scale)];
}
function stripLeadingZeros(value) {
    const stripped = value.replace(/^0+(?=\d)/, '');
    return stripped.length > 0 ? stripped : '0';
}

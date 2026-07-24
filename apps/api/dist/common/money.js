"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundCurrency = roundCurrency;
exports.toNumber = toNumber;
function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    return roundCurrency(Number(value));
}

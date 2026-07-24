"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMonthStart = toMonthStart;
exports.normalizeMonthDate = normalizeMonthDate;
exports.formatMonthLabel = formatMonthLabel;
exports.addMonths = addMonths;
exports.isSameMonth = isSameMonth;
exports.monthDiff = monthDiff;
const constants_1 = require("./constants");
function toMonthStart(year, month) {
    return new Date(Date.UTC(year, month - 1, 1));
}
function normalizeMonthDate(date) {
    return toMonthStart(date.getUTCFullYear(), date.getUTCMonth() + 1);
}
function formatMonthLabel(year, month) {
    return `${constants_1.MONTH_NAMES[month - 1]}/${year}`;
}
function addMonths(base, increment) {
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + increment, 1));
}
function isSameMonth(a, b) {
    return (a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth());
}
function monthDiff(start, end) {
    return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

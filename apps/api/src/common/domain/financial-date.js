"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocalDate = parseLocalDate;
exports.formatLocalDate = formatLocalDate;
exports.monthStartFromDate = monthStartFromDate;
exports.parseMonthStart = parseMonthStart;
exports.formatMonthStart = formatMonthStart;
exports.addMonths = addMonths;
exports.compareMonthStarts = compareMonthStarts;
exports.lastDayOfMonth = lastDayOfMonth;
exports.clampDayToMonth = clampDayToMonth;
const config_1 = require("@finance/config");
function parseLocalDate(value) {
    const [year, month, day] = splitDate(value);
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid local date: ${value}`);
    }
    return date;
}
function formatLocalDate(value) {
    return value.toISOString().slice(0, 10);
}
function monthStartFromDate(value) {
    return (0, config_1.normalizeMonthStart)(value);
}
function parseMonthStart(value) {
    return parseLocalDate((0, config_1.normalizeMonthStart)(value));
}
function formatMonthStart(value) {
    return (0, config_1.normalizeMonthStart)(formatLocalDate(value));
}
function addMonths(monthStart, count) {
    const [year, month] = splitDate(monthStart).slice(0, 2);
    const date = new Date(Date.UTC(Number(year), Number(month) - 1 + count, 1));
    return `${date.getUTCFullYear().toString().padStart(4, '0')}-${(date.getUTCMonth() + 1)
        .toString()
        .padStart(2, '0')}-01`;
}
function compareMonthStarts(left, right) {
    return left.localeCompare(right);
}
function lastDayOfMonth(monthStart) {
    const [year, month] = splitDate(monthStart).slice(0, 2);
    const date = new Date(Date.UTC(Number(year), Number(month), 0));
    return formatLocalDate(date);
}
function clampDayToMonth(monthStart, day) {
    const [year, month] = splitDate(monthStart).slice(0, 2);
    const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    const clampedDay = Math.min(Math.max(day, 1), lastDay);
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${clampedDay.toString().padStart(2, '0')}`;
}
function splitDate(value) {
    const parts = value.split('-');
    if (parts.length !== 3) {
        throw new Error(`Invalid local date: ${value}`);
    }
    const [year, month, day] = parts;
    if (!year || !month || !day) {
        throw new Error(`Invalid local date: ${value}`);
    }
    return [year, month, day];
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONTH_NAME_TO_NUMBER = exports.MONTH_NAMES = void 0;
exports.MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];
exports.MONTH_NAME_TO_NUMBER = exports.MONTH_NAMES.reduce((acc, name, index) => {
    acc[name.toLowerCase()] = index + 1;
    return acc;
}, {});

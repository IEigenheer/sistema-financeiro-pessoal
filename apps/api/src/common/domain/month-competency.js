"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSecondSalaryInstallmentAmount = calculateSecondSalaryInstallmentAmount;
exports.buildSalaryInstallments = buildSalaryInstallments;
exports.computeMonthlyOverview = computeMonthlyOverview;
const financial_date_1 = require("./financial-date");
const money_1 = require("./money");
function calculateSecondSalaryInstallmentAmount(snapshot) {
    return (0, money_1.subtractMoneyStrings)(snapshot.monthlyNetSalary, snapshot.firstSalaryInstallmentAmount);
}
function buildSalaryInstallments(month, settings) {
    const normalizedMonth = (0, financial_date_1.formatMonthStart)((0, financial_date_1.parseMonthStart)(month));
    return [
        {
            installmentLabel: 'FIRST_INSTALLMENT',
            plannedDate: clampSalaryDay(normalizedMonth, settings.firstSalaryInstallmentDay),
            plannedAmount: settings.firstSalaryInstallmentAmount,
        },
        {
            installmentLabel: 'SECOND_INSTALLMENT',
            plannedDate: lastDayOfMonth(normalizedMonth),
            plannedAmount: settings.secondSalaryInstallmentAmount,
        },
    ];
}
function computeMonthlyOverview(month, settings, currentOperationalBalance = settings.initialOperationalBalance, currentInvestmentBalance = settings.initialInvestmentBalance) {
    const normalizedMonth = (0, financial_date_1.formatMonthStart)((0, financial_date_1.parseMonthStart)(month));
    const withinControlPeriod = (0, financial_date_1.compareMonthStarts)(normalizedMonth, settings.controlStartDate) >= 0;
    if (!withinControlPeriod) {
        return {
            month: normalizedMonth,
            withinControlPeriod: false,
            openingOperationalBalance: '0.00',
            openingInvestmentBalance: '0.00',
            plannedSalaryInstallments: [],
            plannedIncome: '0.00',
            realizedIncome: '0.00',
            plannedFixedExpenses: '0.00',
            realizedExpenses: '0.00',
            variableExpenses: '0.00',
            installments: '0.00',
            contributions: '0.00',
            yields: '0.00',
            operationalBalance: '0.00',
            investmentBalance: '0.00',
            plannedVsRealizedDelta: '0.00',
        };
    }
    const plannedSalaryInstallments = buildSalaryInstallments(normalizedMonth, settings);
    const plannedIncome = settings.monthlyNetSalary;
    const openingOperationalBalance = currentOperationalBalance;
    const openingInvestmentBalance = currentInvestmentBalance;
    const operationalBalance = (0, money_1.addMoneyStrings)(openingOperationalBalance, plannedIncome);
    return {
        month: normalizedMonth,
        withinControlPeriod: true,
        openingOperationalBalance,
        openingInvestmentBalance,
        plannedSalaryInstallments,
        plannedIncome,
        realizedIncome: '0.00',
        plannedFixedExpenses: '0.00',
        realizedExpenses: '0.00',
        variableExpenses: '0.00',
        installments: '0.00',
        contributions: '0.00',
        yields: '0.00',
        operationalBalance,
        investmentBalance: openingInvestmentBalance,
        plannedVsRealizedDelta: '0.00',
    };
}
function clampSalaryDay(month, day) {
    const [year, monthNumber] = splitMonthStart(month);
    const lastDay = new Date(Date.UTC(Number(year), Number(monthNumber), 0)).getUTCDate();
    const normalizedDay = Math.min(Math.max(day, 1), lastDay);
    return `${year.padStart(4, '0')}-${monthNumber.padStart(2, '0')}-${normalizedDay.toString().padStart(2, '0')}`;
}
function lastDayOfMonth(month) {
    const [year, monthNumber] = splitMonthStart(month);
    const lastDay = new Date(Date.UTC(Number(year), Number(monthNumber), 0)).getUTCDate();
    return `${year.padStart(4, '0')}-${monthNumber.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
}
function splitMonthStart(month) {
    const parts = month.split('-');
    if (parts.length !== 3) {
        throw new Error(`Invalid month start: ${month}`);
    }
    const [year, monthNumber, day] = parts;
    if (!year || !monthNumber || day !== '01') {
        throw new Error(`Invalid month start: ${month}`);
    }
    return [year, monthNumber];
}

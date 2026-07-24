import { compareMonthStarts, formatMonthStart, parseMonthStart } from './financial-date';
import { addMoneyStrings, subtractMoneyStrings } from './money';

export type SalaryInstallmentLabel = 'FIRST_INSTALLMENT' | 'SECOND_INSTALLMENT';

export interface SalaryInstallmentOverview {
  installmentLabel: SalaryInstallmentLabel;
  plannedDate: string;
  plannedAmount: string;
}

export interface MonthlyOverview {
  month: string;
  withinControlPeriod: boolean;
  openingOperationalBalance: string;
  openingInvestmentBalance: string;
  plannedSalaryInstallments: SalaryInstallmentOverview[];
  plannedIncome: string;
  realizedIncome: string;
  plannedFixedExpenses: string;
  realizedExpenses: string;
  variableExpenses: string;
  installments: string;
  contributions: string;
  yields: string;
  operationalBalance: string;
  investmentBalance: string;
  plannedVsRealizedDelta: string;
}

export interface FinancialSettingsSnapshot {
  controlStartDate: string;
  monthlyNetSalary: string;
  firstSalaryInstallmentAmount: string;
  firstSalaryInstallmentDay: number;
  secondSalaryInstallmentAmount: string;
  secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH';
  defaultMonthlyContribution: string;
  projectedMonthlyInvestmentYieldRate: string;
  initialOperationalBalance: string;
  initialInvestmentBalance: string;
}

export function calculateSecondSalaryInstallmentAmount(snapshot: FinancialSettingsSnapshot): string {
  return subtractMoneyStrings(snapshot.monthlyNetSalary, snapshot.firstSalaryInstallmentAmount);
}

export function buildSalaryInstallments(month: string, settings: FinancialSettingsSnapshot): SalaryInstallmentOverview[] {
  const normalizedMonth = formatMonthStart(parseMonthStart(month));
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

export function computeMonthlyOverview(
  month: string,
  settings: FinancialSettingsSnapshot,
  currentOperationalBalance = settings.initialOperationalBalance,
  currentInvestmentBalance = settings.initialInvestmentBalance,
): MonthlyOverview {
  const normalizedMonth = formatMonthStart(parseMonthStart(month));
  const withinControlPeriod = compareMonthStarts(normalizedMonth, settings.controlStartDate) >= 0;

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
  const operationalBalance = addMoneyStrings(openingOperationalBalance, plannedIncome);

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

function clampSalaryDay(month: string, day: number): string {
  const [year, monthNumber] = splitMonthStart(month);
  const lastDay = new Date(Date.UTC(Number(year), Number(monthNumber), 0)).getUTCDate();
  const normalizedDay = Math.min(Math.max(day, 1), lastDay);
  return `${year.padStart(4, '0')}-${monthNumber.padStart(2, '0')}-${normalizedDay.toString().padStart(2, '0')}`;
}

function lastDayOfMonth(month: string): string {
  const [year, monthNumber] = splitMonthStart(month);
  const lastDay = new Date(Date.UTC(Number(year), Number(monthNumber), 0)).getUTCDate();
  return `${year.padStart(4, '0')}-${monthNumber.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
}

function splitMonthStart(month: string): [string, string] {
  const parts = month.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid month start: ${month}`);
  }

  const [year, monthNumber, day] = parts as [string, string, string];
  if (!year || !monthNumber || day !== '01') {
    throw new Error(`Invalid month start: ${month}`);
  }

  return [year, monthNumber];
}

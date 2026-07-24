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
export declare function calculateSecondSalaryInstallmentAmount(snapshot: FinancialSettingsSnapshot): string;
export declare function buildSalaryInstallments(month: string, settings: FinancialSettingsSnapshot): SalaryInstallmentOverview[];
export declare function computeMonthlyOverview(month: string, settings: FinancialSettingsSnapshot, currentOperationalBalance?: string, currentInvestmentBalance?: string): MonthlyOverview;

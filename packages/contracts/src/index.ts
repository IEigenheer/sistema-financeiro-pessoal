export type MoneyString = string;
export type PositiveMoneyString = string;
export type RateString = string;
export type LocalDateString = string;
export type MonthDateString = `${number}-${string}-01`;

export interface BaseEntityReference {
  id: string;
}

export interface IdempotencyAwareRequest {
  idempotencyKey?: string;
}

export interface ChangeImpactPreview {
  summary?: string;
  affectedMonths?: MonthDateString[];
  affectedOpenInstallments?: number;
  affectedRealizedEntries?: number;
  warnings?: string[];
}

export interface FinancialSettings {
  controlStartDate: LocalDateString;
  monthlyNetSalary: MoneyString;
  firstSalaryInstallmentAmount: MoneyString;
  firstSalaryInstallmentDay: number;
  secondSalaryInstallmentAmount: MoneyString;
  secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH';
  defaultMonthlyContribution: MoneyString;
  projectedMonthlyInvestmentYieldRate: RateString;
  initialOperationalBalance: MoneyString;
  initialInvestmentBalance: MoneyString;
}

export interface UpsertFinancialSettingsRequest {
  controlStartDate: LocalDateString;
  monthlyNetSalary: PositiveMoneyString;
  firstSalaryInstallmentAmount: PositiveMoneyString;
  firstSalaryInstallmentDay: number;
  defaultMonthlyContribution: PositiveMoneyString;
  projectedMonthlyInvestmentYieldRate: RateString;
  initialOperationalBalance: PositiveMoneyString;
  initialInvestmentBalance: PositiveMoneyString;
  secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH';
}

export interface StartDatePreviewRequest {
  newControlStartDate: LocalDateString;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  isActive?: boolean;
}

export interface SalaryInstallmentOverview {
  installmentLabel: 'FIRST_INSTALLMENT' | 'SECOND_INSTALLMENT';
  plannedDate: LocalDateString;
  plannedAmount: MoneyString;
}

export interface MonthlyOverview {
  month: MonthDateString;
  withinControlPeriod: boolean;
  openingOperationalBalance: MoneyString;
  openingInvestmentBalance: MoneyString;
  plannedSalaryInstallments: SalaryInstallmentOverview[];
  plannedIncome: MoneyString;
  realizedIncome: MoneyString;
  plannedFixedExpenses: MoneyString;
  realizedExpenses: MoneyString;
  variableExpenses: MoneyString;
  installments: MoneyString;
  contributions: MoneyString;
  yields: MoneyString;
  operationalBalance: MoneyString;
  investmentBalance: MoneyString;
  plannedVsRealizedDelta: MoneyString;
}

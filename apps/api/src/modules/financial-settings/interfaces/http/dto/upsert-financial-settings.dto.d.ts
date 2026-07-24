declare const SECOND_INSTALLMENT_RULES: readonly ["LAST_DAY_OF_MONTH"];
export type SecondSalaryInstallmentDateRule = (typeof SECOND_INSTALLMENT_RULES)[number];
export declare class UpsertFinancialSettingsDto {
    controlStartDate: string;
    monthlyNetSalary: string;
    firstSalaryInstallmentAmount: string;
    firstSalaryInstallmentDay: number;
    projectedMonthlyInvestmentYieldRate: string;
    defaultMonthlyContribution: string;
    initialOperationalBalance: string;
    initialInvestmentBalance: string;
    secondSalaryInstallmentDateRule: SecondSalaryInstallmentDateRule;
}
export {};

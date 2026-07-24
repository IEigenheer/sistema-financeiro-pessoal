import { z } from 'zod';

const moneyPattern = /^(?:0|[1-9]\d*)(?:\.\d{2})?$/;

export const financialSettingsSchema = z.object({
  controlStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  monthlyNetSalary: z.string().regex(moneyPattern),
  firstSalaryInstallmentAmount: z.string().regex(moneyPattern),
  firstSalaryInstallmentDay: z.number().int().min(1).max(31),
  defaultMonthlyContribution: z.string().regex(moneyPattern),
  projectedMonthlyInvestmentYieldRate: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/),
  initialOperationalBalance: z.string().regex(moneyPattern),
  initialInvestmentBalance: z.string().regex(moneyPattern),
  secondSalaryInstallmentDateRule: z.literal('LAST_DAY_OF_MONTH'),
});

export type FinancialSettingsFormValues = z.infer<typeof financialSettingsSchema>;

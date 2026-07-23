import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Matches, Max, Min } from 'class-validator';

const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{2})?$/;
const SECOND_INSTALLMENT_RULES = ['LAST_DAY_OF_MONTH'] as const;

export type SecondSalaryInstallmentDateRule = (typeof SECOND_INSTALLMENT_RULES)[number];

export class UpsertFinancialSettingsDto {
  @ApiProperty({ example: '2026-01-01', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  controlStartDate!: string;

  @ApiProperty({ example: '8500.00' })
  @Matches(MONEY_PATTERN)
  monthlyNetSalary!: string;

  @ApiProperty({ example: '3000.00' })
  @Matches(MONEY_PATTERN)
  firstSalaryInstallmentAmount!: string;

  @ApiProperty({ example: 15, minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  firstSalaryInstallmentDay!: number;

  @ApiProperty({ example: '0.00800000' })
  @Matches(/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/)
  projectedMonthlyInvestmentYieldRate!: string;

  @ApiProperty({ example: '2500.00' })
  @Matches(MONEY_PATTERN)
  defaultMonthlyContribution!: string;

  @ApiProperty({ example: '2500.00' })
  @Matches(MONEY_PATTERN)
  initialOperationalBalance!: string;

  @ApiProperty({ example: '10000.00' })
  @Matches(MONEY_PATTERN)
  initialInvestmentBalance!: string;

  @ApiProperty({ enum: SECOND_INSTALLMENT_RULES, example: 'LAST_DAY_OF_MONTH' })
  @IsIn(SECOND_INSTALLMENT_RULES)
  secondSalaryInstallmentDateRule!: SecondSalaryInstallmentDateRule;
}

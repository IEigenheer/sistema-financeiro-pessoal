import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsInt()
  referenceYear!: number;

  @IsDateString()
  currentMonthReference!: string;

  @IsDateString()
  controlStartDate!: string;

  @Type(() => Number)
  @IsNumber()
  salaryNetTotal!: number;

  @Type(() => Number)
  @IsNumber()
  salaryFirstInstallment!: number;

  @Type(() => Number)
  @IsNumber()
  salarySecondInstallment!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  salaryFirstInstallmentDay!: number;

  @Type(() => Number)
  @IsNumber()
  monthlyInvestmentContribution!: number;

  @Type(() => Number)
  @IsNumber()
  projectedMonthlyReturnRate!: number;

  @Type(() => Number)
  @IsNumber()
  initialCheckingBalance!: number;

  @Type(() => Number)
  @IsNumber()
  initialInvestmentBalance!: number;
}

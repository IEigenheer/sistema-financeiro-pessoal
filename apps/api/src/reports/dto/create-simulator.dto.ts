import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateSimulatorDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth?: number;

  @Type(() => Number)
  @IsNumber()
  salaryMonthly!: number;

  @Type(() => Number)
  @IsNumber()
  fixedMonthlyExpense!: number;

  @Type(() => Number)
  @IsNumber()
  variableMonthlyExpense!: number;

  @Type(() => Number)
  @IsNumber()
  investmentX!: number;

  @Type(() => Number)
  @IsNumber()
  investmentY!: number;

  @Type(() => Number)
  @IsNumber()
  monthlyReturnRate!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  monthsToSimulate!: number;

  @Type(() => Number)
  @IsNumber()
  purchaseValue!: number;

  @IsIn(['cash', 'installment'])
  purchaseMode!: 'cash' | 'installment';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(36)
  purchaseInstallmentCount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  purchaseStartMonthIndex!: number;
}

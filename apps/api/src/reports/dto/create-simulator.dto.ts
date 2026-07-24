import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class SimulatorExtraEntryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(36)
  monthIndex!: number;

  @IsString()
  label!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsIn(['both', 'base', 'comparison'])
  scenario!: 'both' | 'base' | 'comparison';
}

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
  baseMonthlyInvestment!: number;

  @Type(() => Number)
  @IsNumber()
  comparisonMonthlyInvestment!: number;

  @Type(() => Number)
  @IsNumber()
  monthlyReturnRate!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(36)
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
  @Max(36)
  purchaseStartMonthIndex!: number;

  @IsOptional()
  @IsBoolean()
  investmentOnly?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulatorExtraEntryDto)
  extraEntries?: SimulatorExtraEntryDto[];
}
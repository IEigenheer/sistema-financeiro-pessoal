import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  description!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  day?: number;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsIn(['FIXED_EXTRA', 'VARIABLE_EXTRA', 'OTHER'])
  kind!: 'FIXED_EXTRA' | 'VARIABLE_EXTRA' | 'OTHER';
}
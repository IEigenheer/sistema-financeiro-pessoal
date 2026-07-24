import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertFixedExpenseDto {
  @IsString()
  description!: string;

  @IsString()
  categoryId!: string;

  @Type(() => Number)
  @IsNumber()
  defaultAmount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsBoolean()
  dueOnLastDay!: boolean;
}

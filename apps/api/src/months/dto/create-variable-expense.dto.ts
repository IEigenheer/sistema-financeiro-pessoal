import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateVariableExpenseDto {
  @IsDateString()
  expenseDate!: string;

  @IsString()
  description!: string;

  @IsString()
  categoryId!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;
}

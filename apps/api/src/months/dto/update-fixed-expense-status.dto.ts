import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateFixedExpenseStatusDto {
  @IsIn(['PENDING', 'PAID'])
  status!: 'PENDING' | 'PAID';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paidAmount?: number;
}
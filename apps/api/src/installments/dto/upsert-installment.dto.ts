import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class UpsertInstallmentDto {
  @IsString()
  description!: string;

  @IsString()
  categoryId!: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @IsInt()
  @Min(1)
  installmentCount!: number;

  @Type(() => Number)
  @IsNumber()
  monthlyAmount!: number;

  @IsDateString()
  purchaseDate!: string;

  @IsDateString()
  firstInstallmentMonth!: string;

  @IsDateString()
  lastInstallmentMonth!: string;

  @IsString()
  paymentSource!: string;
}

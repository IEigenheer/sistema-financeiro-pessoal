import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateAdjustmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investmentContributionOverride?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investmentReturnAdjustment?: number;
}

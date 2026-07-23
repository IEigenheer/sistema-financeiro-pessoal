import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Alimentação' })
  @IsOptional()
  @Matches(/^.{1,120}$/)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

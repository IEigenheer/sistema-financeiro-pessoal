import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class StartDatePreviewDto {
  @ApiProperty({ example: '2026-02-01', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  newControlStartDate!: string;
}

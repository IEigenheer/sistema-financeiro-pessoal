import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Moradia', minLength: 1, maxLength: 120 })
  @Matches(/^.{1,120}$/)
  name!: string;
}

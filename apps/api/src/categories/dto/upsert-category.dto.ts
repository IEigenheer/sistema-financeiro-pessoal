import { IsIn, IsString } from 'class-validator';

export class UpsertCategoryDto {
  @IsString()
  name!: string;

  @IsIn(['FIXED', 'VARIABLE'])
  type!: 'FIXED' | 'VARIABLE';
}
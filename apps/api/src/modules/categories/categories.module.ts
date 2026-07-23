import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';

import { CategoryService } from './application/category.service';
import { CategoriesController } from './interfaces/http/categories.controller';

@Module({
  imports: [AuditModule],
  providers: [CategoryService],
  controllers: [CategoriesController],
  exports: [CategoryService],
})
export class CategoriesModule {}

import { Module } from '@nestjs/common';

import { PrismaModule } from './common/database/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DuplicateCheckModule } from './modules/duplicate-check/duplicate-check.module';
import { FinancialSettingsModule } from './modules/financial-settings/financial-settings.module';
import { HealthController } from './modules/health/health.controller';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { MonthlyOverviewsModule } from './modules/monthly-overviews/monthly-overviews.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    IdempotencyModule,
    DuplicateCheckModule,
    FinancialSettingsModule,
    CategoriesModule,
    MonthlyOverviewsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

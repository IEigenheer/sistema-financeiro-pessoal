import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { CategoriesModule } from './categories/categories.module';
import { FixedExpensesModule } from './fixed-expenses/fixed-expenses.module';
import { InstallmentsModule } from './installments/installments.module';
import { MonthsModule } from './months/months.module';
import { ReportsModule } from './reports/reports.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    PrismaModule,
    ConfigurationModule,
    CategoriesModule,
    FixedExpensesModule,
    InstallmentsModule,
    MonthsModule,
    ReportsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}

import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';

import { FinancialSettingsService } from './application/financial-settings.service';
import { FinancialSettingsController } from './interfaces/http/financial-settings.controller';

@Module({
  imports: [AuditModule],
  providers: [FinancialSettingsService],
  controllers: [FinancialSettingsController],
  exports: [FinancialSettingsService],
})
export class FinancialSettingsModule {}

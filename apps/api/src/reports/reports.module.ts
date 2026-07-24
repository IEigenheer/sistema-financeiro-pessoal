import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MonthsModule } from '../months/months.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ConfigurationModule, MonthsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

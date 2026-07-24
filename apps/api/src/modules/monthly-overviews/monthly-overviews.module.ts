import { Module } from '@nestjs/common';

import { MonthlyOverviewService } from './application/monthly-overview.service';
import { MonthlyOverviewController } from './interfaces/http/monthly-overview.controller';

@Module({
  providers: [MonthlyOverviewService],
  controllers: [MonthlyOverviewController],
  exports: [MonthlyOverviewService],
})
export class MonthlyOverviewsModule {}

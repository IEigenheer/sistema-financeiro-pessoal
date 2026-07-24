import { MonthlyOverview as MonthlyOverviewContract } from '@finance/contracts';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';


import { MonthlyOverviewService } from '../../application/monthly-overview.service';

@ApiTags('Months')
@Controller('/months')
export class MonthlyOverviewController {
  constructor(@Inject(MonthlyOverviewService) private readonly monthlyOverviewService: MonthlyOverviewService) {}

  @Get(':month/overview')
  @ApiParam({ name: 'month', example: '2026-07-01' })
  @ApiOkResponse({ type: Object })
  async getOverview(@Param('month') month: string): Promise<MonthlyOverviewContract> {
    return this.monthlyOverviewService.getMonthlyOverview(month);
  }
}

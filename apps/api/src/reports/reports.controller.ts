import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateSimulatorDto } from './dto/create-simulator.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  getOverview(@Query('year') year?: string) {
    return this.reportsService.getOverview(year ? Number(year) : undefined);
  }

  @Post('simulator')
  simulate(@Body() dto: CreateSimulatorDto) {
    return this.reportsService.simulate(dto);
  }
}

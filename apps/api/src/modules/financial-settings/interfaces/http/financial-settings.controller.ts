import { FinancialSettings as FinancialSettingsContract } from '@finance/contracts';
import { Body, Controller, Get, Inject, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';


import { FinancialSettingsService } from '../../application/financial-settings.service';

import { StartDatePreviewDto } from './dto/start-date-preview.dto';
import { UpsertFinancialSettingsDto } from './dto/upsert-financial-settings.dto';

@ApiTags('Financial Settings')
@Controller('/financial-settings')
export class FinancialSettingsController {
  constructor(@Inject(FinancialSettingsService) private readonly financialSettingsService: FinancialSettingsService) {}

  @Get()
  @ApiOkResponse({ type: Object })
  async getCurrent(): Promise<FinancialSettingsContract | null> {
    return this.financialSettingsService.getCurrent();
  }

  @Put()
  @ApiBody({ type: UpsertFinancialSettingsDto })
  async upsert(@Body() dto: UpsertFinancialSettingsDto): Promise<FinancialSettingsContract> {
    return this.financialSettingsService.upsert(dto);
  }

  @Post('/start-date-preview')
  @ApiBody({ type: StartDatePreviewDto })
  async preview(@Body() dto: StartDatePreviewDto) {
    return this.financialSettingsService.previewStartDate(dto);
  }
}
